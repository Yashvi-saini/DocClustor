import { ragConfig, EMBEDDING_DIMENSIONS } from './config';

type TaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

const BATCH_SIZE = 50;
const MAX_RETRIES = 3;

function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

async function embedBatch(texts: string[], taskType: TaskType): Promise<number[][]> {
  const { geminiKey, embeddingModel } = ragConfig();
  if (!geminiKey) throw new Error('GEMINI_API_KEY is not configured');

  const body = JSON.stringify({
    requests: texts.map(text => ({
      model: `models/${embeddingModel}`,
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    })),
  });

  let lastError = 'unknown error';
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${embeddingModel}:batchEmbedContents`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
          body,
          signal: AbortSignal.timeout(30_000),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const embeddings: Array<{ values: number[] }> = json.embeddings ?? [];
        if (embeddings.length !== texts.length) throw new Error('Embedding count mismatch');
        return embeddings.map(e => normalize(e.values));
      }

      lastError = `HTTP ${res.status}`;
      if (res.status !== 429 && res.status < 500) break;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise(r => setTimeout(r, 600 * 2 ** attempt));
  }
  throw new Error(`Gemini embedding failed: ${lastError}`);
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    out.push(...(await embedBatch(texts.slice(i, i + BATCH_SIZE), 'RETRIEVAL_DOCUMENT')));
  }
  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vec] = await embedBatch([text], 'RETRIEVAL_QUERY');
  return vec;
}
