import { WorkspaceContext } from '../types/api.types';
import { getDocuments } from './document.service';
import { listWorkspaces } from './workspace.service';
import { prisma } from '../db/prisma';
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

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

async function extractTextContent(rawContent: string, title = ''): Promise<string> {
  if (!rawContent) return '';

  const isPdf = title.toLowerCase().endsWith('.pdf') || 
                rawContent.includes('application/pdf') || 
                rawContent.startsWith('JVBERi'); // '%PDF' in base64

  if (rawContent.startsWith('data:') && rawContent.includes(';base64,')) {
    try {
      const [header, base64Data] = rawContent.split(';base64,');
      const buffer = Buffer.from(base64Data, 'base64');

      if (header.includes('pdf') || isPdf) {
        const parsed = await pdfParse(buffer);
        return parsed.text ? parsed.text.trim() : '';
      } else {
        const decoded = buffer.toString('utf-8');
        return decoded.trim();
      }
    } catch (err) {
      console.error('[RAG PDF Parse Error]', err);
      return '';
    }
  } else if (rawContent.startsWith('JVBERi')) {
    try {
      const buffer = Buffer.from(rawContent, 'base64');
      const parsed = await pdfParse(buffer);
      return parsed.text ? parsed.text.trim() : '';
    } catch (err) {
      console.error('[RAG PDF Base64 Parse Error]', err);
      return '';
    }
  }

  return rawContent.trim();
}

interface Chunk {
  docId: string;
  docTitle: string;
  workspaceName: string;
  text: string;
}

async function callGemini(systemPrompt: string, userQuestion: string, apiKey: string): Promise<string | null> {
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuestion}` }]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1000
            }
          })
        }
      );

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return text.trim();
        }
      } else {
        const err = await res.text();
        console.warn(`[RAG Service] Model ${model} returned HTTP ${res.status}: ${err}`);
      }
    } catch (err) {
      console.warn(`[RAG Service] Call to model ${model} failed:`, err);
    }
  }

  return null;
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
      
      const docs = await getDocuments(tempContext, false);
      eligibleDocs.push(...docs);
    }
  } else {
    const workspaces = await listWorkspaces(userId);
    workspaces.forEach(w => workspaceNames.set(w.id, w.name));

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
      doc.mimeType.startsWith('video/')
    )) {
      return false;
    }

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

  // 2. Fetch document content and extract text using pdf-parse
  const allChunks: Chunk[] = [];
  if (targetDocs.length > 0) {
    const docsWithContent = await prisma.document.findMany({
      where: { id: { in: targetDocs.map(d => d.id) } },
      select: { id: true, content: true }
    });

    const contentMap = new Map<string, string>();
    docsWithContent.forEach(d => contentMap.set(d.id, d.content || ''));

    for (const doc of targetDocs) {
      const rawContent = contentMap.get(doc.id) || '';
      const textContent = await extractTextContent(rawContent, doc.title);

      if (!textContent) continue;

      const words = textContent.split(/\s+/);
      const chunkSize = 150; // ~600 chars
      const overlap = 30;
      const workspaceName = workspaceNames.get(doc.orgId || doc.userId || '') || 'Workspace';

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

  // If no document chunks exist in workspace
  if (allChunks.length === 0) {
    if (apiKey) {
      const systemPrompt = `You are DocCluster Assistant, a highly secure, professional AI. The user has not uploaded any readable text documents in this workspace context yet. Answer the user's question using your general knowledge. At the end of your response, gently and politely mention that they can upload text files (.txt, .md, .pdf) in their workspace to let you answer questions directly from their documents.`;
      
      const answer = await callGemini(systemPrompt, question, apiKey);
      if (answer) {
        return { answer, sources: [] };
      }
    }

    return {
      answer: `Hello! I don't see any text documents uploaded in your active workspace context yet. Please upload a text document (.txt, .md, .pdf) using the paperclip button below to start querying your custom data.`,
      sources: []
    };
  }

  // 3. TF-IDF Chunk Ranking
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

  let topScored = scoredChunks
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (topScored.length === 0) {
    topScored = scoredChunks.slice(0, 5);
  }

  const finalSources = topScored.map(item => ({
    documentId: item.chunk.docId,
    title: item.chunk.docTitle,
    snippet: item.chunk.text,
    workspaceName: item.chunk.workspaceName
  }));

  // 4. LLM Synthesis via Gemini
  if (apiKey) {
    const contextText = topScored
      .map(item => `[Document: "${item.chunk.docTitle}" | Workspace: ${item.chunk.workspaceName}]\n${item.chunk.text}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are DocCluster Assistant, an enterprise AI document assistant. Answer the user's question concisely and accurately using ONLY the provided document context below. If the answer cannot be found in the context, clearly state that the information is not present in the uploaded documents. Cite the document names when answering.

Context:
${contextText}`;

    const answer = await callGemini(systemPrompt, question, apiKey);
    if (answer) {
      return {
        answer,
        sources: finalSources
      };
    }
  }

  const intro = `Here is the relevant information found in your workspace documents regarding "${question}":\n\n`;
  const body = topScored.map((item, idx) => {
    const textSnippet = item.chunk.text.trim();
    const cleanSnippet = textSnippet.length > 220 ? textSnippet.substring(0, 220) + '...' : textSnippet;
    return `${idx + 1}. **From "${item.chunk.docTitle}" (${item.chunk.workspaceName})**:\n   > "${cleanSnippet}"`;
  }).join('\n\n');

  return {
    answer: intro + body,
    sources: finalSources
  };
}
