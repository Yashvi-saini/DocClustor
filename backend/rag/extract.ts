import { ragConfig } from './config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const MIN_PDF_TEXT_CHARS = 40;
const MAX_OCR_BYTES = 12 * 1024 * 1024;

const TEXT_EXTENSIONS = ['.txt', '.md', '.markdown', '.csv', '.tsv', '.json', '.log', '.xml', '.html', '.htm', '.yaml', '.yml'];

export function isMediaOnlyUnsupported(title: string, mimeType?: string | null): boolean {
  const t = title.toLowerCase();
  if (mimeType && (mimeType.startsWith('audio/') || mimeType.startsWith('video/'))) return true;
  return ['.mp3', '.mp4', '.wav', '.mov', '.avi', '.mkv', '.zip', '.exe'].some(ext => t.endsWith(ext));
}

function isImage(title: string, mime: string): boolean {
  return mime.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(title);
}

interface Decoded {
  buffer: Buffer;
  mime: string;
  wasDataUrl: boolean;
}

function decode(raw: string): Decoded {
  const dataUrl = /^data:([^;,]*)(?:;[^,]*)*;base64,/i.exec(raw);
  if (dataUrl) {
    return {
      buffer: Buffer.from(raw.slice(dataUrl[0].length), 'base64'),
      mime: (dataUrl[1] || '').toLowerCase(),
      wasDataUrl: true,
    };
  }
  if (raw.startsWith('JVBERi')) {
    return { buffer: Buffer.from(raw, 'base64'), mime: 'application/pdf', wasDataUrl: true };
  }
  return { buffer: Buffer.from(raw, 'utf8'), mime: 'text/plain', wasDataUrl: false };
}

function cleanText(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function ocrWithGemini(buffer: Buffer, mime: string): Promise<string> {
  const { geminiKey, geminiChatModels } = ragConfig();
  if (!geminiKey || buffer.length > MAX_OCR_BYTES) return '';

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiChatModels[0]}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { inlineData: { mimeType: mime, data: buffer.toString('base64') } },
              {
                text:
                  'Transcribe ALL text in this file verbatim, preserving headings, lists and tables as plain text. ' +
                  'If it is a picture without text, describe it factually in a few sentences. Output only the content.',
              },
            ],
          }],
          generationConfig: { temperature: 0, maxOutputTokens: 8192 },
        }),
        signal: AbortSignal.timeout(60_000),
      }
    );
    if (!res.ok) {
      console.warn('[RAG] OCR request failed with HTTP', res.status);
      return '';
    }
    const json = await res.json();
    const parts: Array<{ text?: string }> = json.candidates?.[0]?.content?.parts ?? [];
    return cleanText(parts.map(p => p.text ?? '').join('\n'));
  } catch (err) {
    console.warn('[RAG] OCR failed:', err instanceof Error ? err.message : err);
    return '';
  }
}

export async function extractText(rawContent: string, title = '', declaredMime?: string | null): Promise<string> {
  if (!rawContent || !rawContent.trim()) return '';

  const { buffer, mime: sniffed, wasDataUrl } = decode(rawContent);
  const mime = sniffed || declaredMime?.toLowerCase() || '';
  const lowerTitle = title.toLowerCase();

  try {
    if (mime.includes('pdf') || lowerTitle.endsWith('.pdf')) {
      const parsed = await pdfParse(buffer);
      const text = cleanText(parsed?.text || '');
      if (text.length >= MIN_PDF_TEXT_CHARS) return text;
      return (await ocrWithGemini(buffer, 'application/pdf')) || text;
    }

    if (
      mime.includes('wordprocessingml') ||
      lowerTitle.endsWith('.docx')
    ) {
      const mammoth = await import('mammoth');
      const { value } = await mammoth.extractRawText({ buffer });
      return cleanText(value || '');
    }

    if (isImage(lowerTitle, mime)) {
      const imageMime = mime.startsWith('image/') ? mime : 'image/png';
      return await ocrWithGemini(buffer, imageMime);
    }

    if (wasDataUrl || TEXT_EXTENSIONS.some(ext => lowerTitle.endsWith(ext)) || mime.startsWith('text/') || mime === '' || mime === 'application/json') {
      const text = buffer.toString('utf8');
      const sample = text.slice(0, 2000);
      const replacementChars = (sample.match(/�/g) || []).length;
      if (replacementChars > sample.length * 0.1) return '';
      return cleanText(text);
    }
  } catch (err) {
    console.error('[RAG] Text extraction failed for', title, err instanceof Error ? err.message : err);
  }
  return '';
}
