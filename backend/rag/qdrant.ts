import crypto from 'crypto';
import { ragConfig, EMBEDDING_DIMENSIONS } from './config';

export interface ChunkPayload {
  docId: string;
  ws: string;
  title: string;
  chunkIndex: number;
  text: string;
}

export interface ScoredChunk extends ChunkPayload {
  score: number;
}

export function pointId(docId: string, chunkIndex: number): string {
  const h = crypto.createHash('sha1').update(`${docId}:${chunkIndex}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

async function request<T>(method: string, path: string, body?: unknown, timeoutMs = 20_000): Promise<T> {
  const { qdrantUrl, qdrantApiKey } = ragConfig();
  if (!qdrantUrl) throw new Error('QDRANT_URL is not configured');

  const res = await fetch(`${qdrantUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(qdrantApiKey ? { 'api-key': qdrantApiKey } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    const err = new Error(`Qdrant ${method} ${path} failed: HTTP ${res.status} ${detail}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

let collectionReady: Promise<void> | null = null;

export function ensureCollection(): Promise<void> {
  if (!collectionReady) {
    collectionReady = (async () => {
      const { qdrantCollection } = ragConfig();
      const c = encodeURIComponent(qdrantCollection);

      let exists = true;
      try {
        await request('GET', `/collections/${c}`);
      } catch (err) {
        if ((err as { status?: number }).status === 404) exists = false;
        else throw err;
      }

      if (!exists) {
        await request('PUT', `/collections/${c}`, {
          vectors: { size: EMBEDDING_DIMENSIONS, distance: 'Cosine' },
        });
      }

      for (const field of ['docId', 'ws']) {
        await request('PUT', `/collections/${c}/index?wait=true`, {
          field_name: field,
          field_schema: 'keyword',
        }).catch(() => undefined);
      }
    })().catch(err => {
      collectionReady = null;
      throw err;
    });
  }
  return collectionReady;
}

export async function upsertChunks(
  chunks: Array<{ payload: ChunkPayload; vector: number[] }>
): Promise<void> {
  const { qdrantCollection } = ragConfig();
  const c = encodeURIComponent(qdrantCollection);
  const BATCH = 64;

  for (let i = 0; i < chunks.length; i += BATCH) {
    await request('PUT', `/collections/${c}/points?wait=true`, {
      points: chunks.slice(i, i + BATCH).map(({ payload, vector }) => ({
        id: pointId(payload.docId, payload.chunkIndex),
        vector,
        payload,
      })),
    }, 60_000);
  }
}

export async function deleteByDocId(docId: string): Promise<void> {
  const { qdrantCollection } = ragConfig();
  await request(
    'POST',
    `/collections/${encodeURIComponent(qdrantCollection)}/points/delete?wait=true`,
    { filter: { must: [{ key: 'docId', match: { value: docId } }] } }
  );
}

export async function searchChunks(
  vector: number[],
  docIds: string[],
  limit: number
): Promise<ScoredChunk[]> {
  if (docIds.length === 0) return [];
  const { qdrantCollection } = ragConfig();

  const json = await request<{
    result: { points: Array<{ score: number; payload: ChunkPayload }> };
  }>('POST', `/collections/${encodeURIComponent(qdrantCollection)}/points/query`, {
    query: vector,
    limit,
    with_payload: true,
    filter: { must: [{ key: 'docId', match: { any: docIds } }] },
  });

  return (json.result?.points ?? []).map(p => ({ ...p.payload, score: p.score }));
}
