import { prisma } from '../db/prisma';
import { INDEX_VERSION, vectorSearchConfigured } from './config';
import { extractText } from './extract';
import { chunkText, TextChunk } from './chunker';
import { embedDocuments } from './embeddings';
import { ensureCollection, upsertChunks, deleteByDocId } from './qdrant';

export function isIndexed(vectorId: string | null | undefined): boolean {
  return !!vectorId && vectorId.startsWith(`${INDEX_VERSION}:`);
}

const CHUNK_CACHE_MAX = 150;
const chunkCache = new Map<string, { updatedAt: number; chunks: TextChunk[] }>();

export async function getCachedChunks(doc: {
  id: string;
  title: string;
  mimeType: string | null;
  content: string;
  updatedAt: Date;
}): Promise<TextChunk[]> {
  const stamp = doc.updatedAt.getTime();
  const hit = chunkCache.get(doc.id);
  if (hit && hit.updatedAt === stamp) {
    chunkCache.delete(doc.id);
    chunkCache.set(doc.id, hit);
    return hit.chunks;
  }

  const text = await extractText(doc.content, doc.title, doc.mimeType);
  const chunks = text ? chunkText(text) : [];
  chunkCache.set(doc.id, { updatedAt: stamp, chunks });
  if (chunkCache.size > CHUNK_CACHE_MAX) {
    const oldest = chunkCache.keys().next().value;
    if (oldest) chunkCache.delete(oldest);
  }
  return chunks;
}

export async function indexDocument(docId: string): Promise<boolean> {
  if (!vectorSearchConfigured()) return false;

  const doc = await prisma.document.findUnique({
    where: { id: docId },
    select: {
      id: true, title: true, content: true, mimeType: true,
      userId: true, orgId: true, updatedAt: true,
    },
  });
  if (!doc) return false;

  const chunks = await getCachedChunks(doc);
  await ensureCollection();
  await deleteByDocId(doc.id);

  if (chunks.length === 0) {
    await prisma.document.update({ where: { id: doc.id }, data: { vectorId: `${INDEX_VERSION}:0` } });
    return false;
  }

  const ws = doc.orgId || doc.userId || '';
  const vectors = await embedDocuments(chunks.map(c => `${doc.title}\n\n${c.text}`));

  await upsertChunks(
    chunks.map((c, i) => ({
      vector: vectors[i],
      payload: { docId: doc.id, ws, title: doc.title, chunkIndex: c.index, text: c.text },
    }))
  );

  await prisma.document.update({
    where: { id: doc.id },
    data: { vectorId: `${INDEX_VERSION}:${chunks.length}` },
  });
  return true;
}

export async function removeDocumentVectors(docId: string): Promise<void> {
  chunkCache.delete(docId);
  if (!vectorSearchConfigured()) return;
  await ensureCollection();
  await deleteByDocId(docId);
}
