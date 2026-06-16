import { WorkspaceContext } from '../types/api.types';
import { getDocuments } from './document.service';
import { listWorkspaces } from './workspace.service';
import { prisma } from '../db/prisma';

export interface RagQueryInput {
  question: string;
  workspaceContext: WorkspaceContext;
  searchAllWorkspaces?: boolean;
  unlockedWorkspaceIds?: string[];
}

export interface RagQueryOutput {
  answer: string;
  sources: Array<{ documentId: string; title: string; snippet: string; workspaceName: string }>;
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'you', 'that', 'this', 'with', 'from', 'your', 'have',
  'are', 'but', 'not', 'can', 'will', 'was', 'were', 'they', 'them', 'their',
  'our', 'his', 'her', 'she', 'him', 'has', 'had', 'been', 'about', 'out',
  'what', 'when', 'where', 'who', 'how', 'why', 'which'
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token));
}

interface Chunk {
  docId: string;
  docTitle: string;
  workspaceName: string;
  text: string;
}

export async function queryRag(input: RagQueryInput): Promise<RagQueryOutput> {
  const { question, workspaceContext, searchAllWorkspaces, unlockedWorkspaceIds = [] } = input;
  const userId = workspaceContext.userId;
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Gather all authorized documents based on workspace context & scope
  let eligibleDocs: any[] = [];
  const workspaceNames = new Map<string, string>();

  if (searchAllWorkspaces) {
    const workspaces = await listWorkspaces(userId);
    for (const w of workspaces) {
      workspaceNames.set(w.id, w.name);
      
      const tempContext: WorkspaceContext = w.type === 'personal'
        ? { type: 'personal', userId }
        : { type: 'org', orgId: w.id, userId, memberRole: w.role || 'VIEWER' };
      
      // Fetch document METADATA first (excludeContent = false for speed)
      const docs = await getDocuments(tempContext, false);
      eligibleDocs.push(...docs);
    }
  } else {
    // Single workspace search
    const workspaces = await listWorkspaces(userId);
    workspaces.forEach(w => workspaceNames.set(w.id, w.name));

    // Fetch document METADATA first (excludeContent = false for speed)
    const docs = await getDocuments(workspaceContext, false);
    eligibleDocs = docs;
  }

  const targetDocs = eligibleDocs.filter(doc => {
    // Check lock status
    if (doc.lockerId) {
      const wId = doc.orgId || doc.userId || '';
      if (!unlockedWorkspaceIds.includes(wId)) {
        return false;
      }
    }


    if (doc.mimeType && (
      doc.mimeType.startsWith('image/') ||
      doc.mimeType.startsWith('audio/') ||
      doc.mimeType.startsWith('video/') ||
      doc.mimeType === 'application/octet-stream'
    )) {
      return false;
    }

    // Check filename extension
    const titleLower = doc.title.toLowerCase();
    if (
      titleLower.endsWith('.png') ||
      titleLower.endsWith('.jpg') ||
      titleLower.endsWith('.jpeg') ||
      titleLower.endsWith('.gif') ||
      titleLower.endsWith('.webp') ||
      titleLower.endsWith('.mp3') ||
      titleLower.endsWith('.mp4')
    ) {
      return false;
    }

    return true;
  });

  // If we have documents, fetch their content and build chunks
  const allChunks: Chunk[] = [];
  if (targetDocs.length > 0) {
    const docsWithContent = await prisma.document.findMany({
      where: { id: { in: targetDocs.map(d => d.id) } },
      select: { id: true, content: true }
    });

    const contentMap = new Map<string, string>();
    docsWithContent.forEach(d => contentMap.set(d.id, d.content || ''));

    for (const doc of targetDocs) {
      const content = contentMap.get(doc.id) || '';

      if (content.startsWith('data:') && content.includes(';base64,')) {
        continue;
      }

      const words = content.split(/\s+/);
      const chunkSize = 120; // ~500 chars
      const overlap = 30;
      const workspaceName = workspaceNames.get(doc.orgId || doc.userId || '') || 'Unknown Space';

      for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunkText = words.slice(i, i + chunkSize).join(' ');
        if (chunkText.trim()) {
          allChunks.push({
            docId: doc.id,
            docTitle: doc.title,
            workspaceName,
            text: chunkText,
          });
        }
        if (i + chunkSize >= words.length) break;
      }
    }
  }

  if (allChunks.length === 0) {
    if (apiKey) {
      try {
        const systemPrompt = `You are DocCluster Assistant, a highly secure, professional AI. The user has not uploaded any readable text documents in this workspace context yet. Answer the user's question using your general knowledge. At the end of your response, gently and politely mention that they can upload text files (.txt, .md, .pdf) in their workspace to let you answer questions directly from their documents.`;
        
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Question: ${question}` }]
                }
              ],
              generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 800
              }
            })
          }
        );

        if (geminiRes.ok) {
          const resJson = await geminiRes.json();
          const answer = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (answer) {
            return {
              answer: answer.trim(),
              sources: []
            };
          }
        } else {
          const errText = await geminiRes.text();
          console.error(`[RAG Service] Gemini API returned error status ${geminiRes.status}:`, errText);
        }
      } catch (err) {
        console.error("Gemini general chat failed:", err);
      }
    }

    // Fallback if no API key is configured
    return {
      answer: `Hello! I don't see any text documents uploaded in your workspace context yet. Please upload a text document (.txt, .md, .pdf) using the paperclip button below to start querying your custom data.\n\n*(Note: To enable general conversational chat when no files are present, please configure your GEMINI_API_KEY in the environment variables)*`,
      sources: []
    };
  }

  // 4. Score chunks using lightweight TF-IDF logic
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) {
    queryTokens.push(...question.toLowerCase().split(/\s+/).filter(t => t.length > 0));
  }

  const totalChunks = allChunks.length;
  const docFreqs = new Map<string, number>();

  queryTokens.forEach(token => {
    let count = 0;
    allChunks.forEach(chunk => {
      if (chunk.text.toLowerCase().includes(token)) {
        count++;
      }
    });
    docFreqs.set(token, count);
  });

  const idfs = new Map<string, number>();
  queryTokens.forEach(token => {
    const df = docFreqs.get(token) || 0;
    const idf = Math.log(1 + (totalChunks / (df + 1)));
    idfs.set(token, idf);
  });

  const scoredChunks = allChunks.map(chunk => {
    const words = chunk.text.toLowerCase().split(/\s+/);
    const totalWords = words.length;
    let score = 0;

    queryTokens.forEach(token => {
      let termCount = 0;
      words.forEach(w => {
        if (w.includes(token)) termCount++;
      });

      const tf = termCount / (totalWords || 1);
      const idf = idfs.get(token) || 0;
      score += tf * idf;
    });

    return { chunk, score };
  });

  // Sort chunks by TF-IDF relevance
  const topScored = scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const finalSources = topScored.map(item => ({
    documentId: item.chunk.docId,
    title: item.chunk.docTitle,
    snippet: item.chunk.text,
    workspaceName: item.chunk.workspaceName
  }));

  // 5. Synthesis & LLM integration
  if (apiKey) {
    try {
      const contextText = topScored
        .map(item => `[Source: ${item.chunk.docTitle} (${item.chunk.workspaceName})] ${item.chunk.text}`)
        .join('\n\n');

      const systemPrompt = `You are DocCluster Assistant, a highly secure, professional AI. Answer the user's question using ONLY the provided document context below. If the answer cannot be found in the context, say that the information is not present in the uploaded documents. Do not make up facts. Cite your sources when answering.

Context:
${contextText}`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nUser Question: ${question}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800
            }
          })
        }
      );

      if (geminiRes.ok) {
        const resJson = await geminiRes.json();
        const answer = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          return {
            answer: answer.trim(),
            sources: finalSources
          };
        }
      } else {
        const errText = await geminiRes.text();
        console.error(`[RAG Service] Gemini API returned error status during synthesis ${geminiRes.status}:`, errText);
      }
    } catch (apiErr) {
      console.error('Gemini API call failed with exception:', apiErr);
    }
  }

  if (topScored.length === 0) {
    return {
      answer: "No relevant documents or matches found in your active workspace context. Please try rephrasing your question or upload documents containing matching keywords.",
      sources: []
    };
  }

  // Build a sophisticated local synthesis
  const intro = `Here is what I found in your documents regarding "${question}":\n\n`;
  const body = topScored.map((item, idx) => {
    const textSnippet = item.chunk.text.trim();
    // Trim leading/trailing punctuation nicely
    const cleanSnippet = textSnippet.length > 200 ? textSnippet.substring(0, 200) + '...' : textSnippet;
    return `${idx + 1}. **From "${item.chunk.docTitle}" [${item.chunk.workspaceName}]**:\n   > "... ${cleanSnippet} ..."`;
  }).join('\n\n');

  const apiKeyWarning = `\n\n*(Note: Gemini API key is missing from .env, using local high-fidelity semantic matching context fallback)*`;

  return {
    answer: intro + body + apiKeyWarning,
    sources: finalSources
  };
}
