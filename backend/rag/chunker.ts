export interface TextChunk {
  index: number;
  text: string;
}

const TARGET_CHARS = 900;
const MAX_CHARS = 1300;
const OVERLAP_CHARS = 160;

function splitSentences(paragraph: string): string[] {
  const parts = paragraph.match(/[^.!?\n]+(?:[.!?]+["')\]]*\s+|\n|$)/g);
  return (parts ?? [paragraph]).map(s => s.trim()).filter(Boolean);
}

function hardSplit(text: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += TARGET_CHARS - OVERLAP_CHARS) {
    out.push(text.slice(i, i + TARGET_CHARS));
  }
  return out;
}

function toUnits(text: string): string[] {
  const units: string[] = [];
  for (const para of text.split(/\n{2,}/)) {
    const p = para.replace(/\s*\n\s*/g, ' ').replace(/[ \t]{2,}/g, ' ').trim();
    if (!p) continue;
    if (p.length <= MAX_CHARS) {
      units.push(p);
      continue;
    }
    for (const sentence of splitSentences(p)) {
      if (sentence.length <= MAX_CHARS) units.push(sentence);
      else units.push(...hardSplit(sentence));
    }
  }
  return units;
}

export function chunkText(text: string): TextChunk[] {
  const units = toUnits(text);
  const chunks: string[] = [];
  let current = '';

  for (const unit of units) {
    if (current && current.length + unit.length + 1 > TARGET_CHARS) {
      chunks.push(current);
      const tail = current.slice(-OVERLAP_CHARS);
      const wordBoundary = tail.indexOf(' ');
      current = (wordBoundary > -1 ? tail.slice(wordBoundary + 1) : tail) + ' ' + unit;
    } else {
      current = current ? `${current}\n${unit}` : unit;
    }
  }
  if (current.trim()) chunks.push(current);

  return chunks
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map((text, index) => ({ index, text }));
}
