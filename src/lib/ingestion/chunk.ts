// Split long text into overlapping chunks, preferring natural boundaries
// (paragraph / sentence / line) near the target size so chunks stay coherent.

import { CHUNK_CHARS, CHUNK_OVERLAP } from "../constants";

export function chunkText(
  text: string,
  size = CHUNK_CHARS,
  overlap = CHUNK_OVERLAP,
): string[] {
  const clean = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  if (clean.length === 0) return [];
  if (clean.length <= size) return [clean];

  const chunks: string[] = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);

    if (end < clean.length) {
      const slice = clean.slice(start, end);
      const boundary = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf("\n"),
      );
      // Only honor the boundary if it's not too early in the window.
      if (boundary > size * 0.5) end = start + boundary + 1;
    }

    const piece = clean.slice(start, end).trim();
    if (piece) chunks.push(piece);

    if (end >= clean.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
}
