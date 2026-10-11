
const env = (name: string): string | undefined => {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
};

export const INDEX_VERSION = 'v2';

export const EMBEDDING_DIMENSIONS = 768;

export function ragConfig() {
  const grokKey = env('GROK_API_KEY');
  const groqKey = env('GROQ_API_KEY') || (grokKey?.startsWith('gsk_') ? grokKey : undefined);
  const xaiKey = env('XAI_API_KEY') || (grokKey && !grokKey.startsWith('gsk_') ? grokKey : undefined);

  return {
    qdrantUrl: env('QDRANT_URL')?.replace(/\/+$/, ''),
    qdrantApiKey: env('QDRANT_API_KEY'),
    qdrantCollection: env('QDRANT_COLLECTION') || 'doccluster_chunks',

    geminiKey: env('GEMINI_API_KEY'),
    embeddingModel: env('GEMINI_EMBEDDING_MODEL') || 'gemini-embedding-001',
    geminiChatModels: (env('GEMINI_CHAT_MODEL') || 'gemini-2.5-flash,gemini-2.0-flash').split(',').map(s => s.trim()),

    groqKey,
    groqModel: env('GROQ_MODEL') || 'openai/gpt-oss-120b',

    xaiKey,
    xaiModel: env('XAI_MODEL') || 'grok-3-mini',

    providerOrder: (env('LLM_PROVIDER_ORDER') || 'groq,gemini,xai').split(',').map(s => s.trim().toLowerCase()),
  };
}

export function vectorSearchConfigured(): boolean {
  const c = ragConfig();
  return !!(c.qdrantUrl && c.geminiKey);
}
