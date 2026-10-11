const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'so', 'yet', 'of', 'in', 'on', 'at', 'to', 'by', 'as',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'am', 'do', 'does', 'did', 'has', 'have', 'had',
  'it', 'its', 'this', 'that', 'these', 'those', 'with', 'from', 'about', 'into', 'than', 'then',
  'i', 'you', 'he', 'she', 'we', 'they', 'me', 'my', 'your', 'our', 'their', 'his', 'her', 'them',
  'what', 'when', 'where', 'who', 'whom', 'which', 'why', 'how', 'can', 'could', 'will', 'would',
  'should', 'shall', 'may', 'might', 'not', 'no', 'any', 'all', 'please', 'tell', 'give', 'show',
]);

function stem(token: string): string {
  if (token.length > 4 && token.endsWith('ies')) return token.slice(0, -3) + 'y';
  if (token.length > 5 && token.endsWith('ing')) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith('ed')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('es')) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(t => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

export function bm25Scores(query: string, texts: string[], k1 = 1.4, b = 0.75): number[] {
  const queryTerms = Array.from(new Set(tokenize(query)));
  if (queryTerms.length === 0 || texts.length === 0) return texts.map(() => 0);

  const docs = texts.map(t => tokenize(t));
  const avgLen = docs.reduce((s, d) => s + d.length, 0) / docs.length || 1;

  const df = new Map<string, number>();
  for (const term of queryTerms) {
    df.set(term, docs.reduce((n, d) => n + (d.includes(term) ? 1 : 0), 0));
  }

  return docs.map(tokens => {
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    for (const term of queryTerms) {
      const f = tf.get(term) ?? 0;
      if (!f) continue;
      const n = df.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * tokens.length) / avgLen)));
    }
    return score;
  });
}

export function reciprocalRankFusion(rankings: string[][], k = 60): Map<string, number> {
  const fused = new Map<string, number>();
  for (const ranking of rankings) {
    ranking.forEach((key, rank) => {
      fused.set(key, (fused.get(key) ?? 0) + 1 / (k + rank + 1));
    });
  }
  return fused;
}
