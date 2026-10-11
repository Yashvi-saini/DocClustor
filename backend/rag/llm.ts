import { ragConfig } from './config';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface GenerateInput {
  system: string;
  history?: ChatTurn[];
  user: string;
  temperature?: number;
  maxTokens?: number;
}

const TIMEOUT_MS = 40_000;

async function callOpenAiCompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  input: GenerateInput
): Promise<string | null> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: input.temperature ?? 0.1,
      max_tokens: input.maxTokens ?? 1200,
      messages: [
        { role: 'system', content: input.system },
        ...(input.history ?? []),
        { role: 'user', content: input.user },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    console.warn(`[RAG LLM] ${baseUrl} (${model}) returned HTTP ${res.status}`);
    return null;
  }
  const json = await res.json();
  const text: string | undefined = json.choices?.[0]?.message?.content;
  return text?.trim() || null;
}

async function callGemini(model: string, apiKey: string, input: GenerateInput): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.system }] },
        contents: [
          ...(input.history ?? []).map(t => ({
            role: t.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: t.content }],
          })),
          { role: 'user', parts: [{ text: input.user }] },
        ],
        generationConfig: {
          temperature: input.temperature ?? 0.1,
          maxOutputTokens: input.maxTokens ?? 1200,
        },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  );

  if (!res.ok) {
    console.warn(`[RAG LLM] Gemini ${model} returned HTTP ${res.status}`);
    return null;
  }
  const json = await res.json();
  const parts: Array<{ text?: string; thought?: boolean }> = json.candidates?.[0]?.content?.parts ?? [];
  const text = parts.filter(p => !p.thought).map(p => p.text ?? '').join('').trim();
  return text || null;
}

export async function generate(input: GenerateInput): Promise<string | null> {
  const cfg = ragConfig();

  const providers: Record<string, Array<() => Promise<string | null>>> = {
    groq: cfg.groqKey
      ? [() => callOpenAiCompatible('https://api.groq.com/openai/v1', cfg.groqKey!, cfg.groqModel, input)]
      : [],
    xai: cfg.xaiKey
      ? [() => callOpenAiCompatible('https://api.x.ai/v1', cfg.xaiKey!, cfg.xaiModel, input)]
      : [],
    gemini: cfg.geminiKey
      ? cfg.geminiChatModels.map(m => () => callGemini(m, cfg.geminiKey!, input))
      : [],
  };

  for (const name of cfg.providerOrder) {
    for (const attempt of providers[name] ?? []) {
      try {
        const out = await attempt();
        if (out) return out;
      } catch (err) {
        console.warn(`[RAG LLM] ${name} call failed:`, err instanceof Error ? err.message : err);
      }
    }
  }
  return null;
}

export function llmConfigured(): boolean {
  const c = ragConfig();
  return !!(c.groqKey || c.geminiKey || c.xaiKey);
}
