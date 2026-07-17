import { TextChunk } from "@/types/embedding";

interface ChunkOptions {
  maxChars?: number;
  overlapChars?: number;
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function splitLongParagraph(paragraph: string, maxChars: number): string[] {
  const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [paragraph];
  const result: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if ((current + " " + trimmed).trim().length > maxChars && current.length > 0) {
      result.push(current.trim());
      current = trimmed;
    } else {
      current = (current + " " + trimmed).trim();
    }
  }

  if (current.length > 0) {
    result.push(current.trim());
  }

  return result;
}

export function chunkText(rawText: string, options: ChunkOptions = {}): TextChunk[] {
  const maxChars = options.maxChars ?? 600;
  const cleaned = rawText.replace(/\r\n/g, "\n").trim();

  if (cleaned.length === 0) {
    return [];
  }

  const paragraphs = splitIntoParagraphs(cleaned);
  const blocks: string[] = [];
  let buffer = "";

  for (const paragraph of paragraphs) {
    if (paragraph.length > maxChars) {
      if (buffer.length > 0) {
        blocks.push(buffer);
        buffer = "";
      }
      const subBlocks = splitLongParagraph(paragraph, maxChars);
      blocks.push(...subBlocks);
      continue;
    }

    const candidate = buffer.length > 0 ? `${buffer}\n\n${paragraph}` : paragraph;
    if (candidate.length > maxChars && buffer.length > 0) {
      blocks.push(buffer);
      buffer = paragraph;
    } else {
      buffer = candidate;
    }
  }

  if (buffer.length > 0) {
    blocks.push(buffer);
  }

  return blocks.map((text, index) => ({
    id: `chunk-${index}-${text.length}`,
    index,
    text,
    charCount: text.length
  }));
}
