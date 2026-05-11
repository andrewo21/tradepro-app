// lib/ats/utils/text_cleaning.ts
// Pure text cleaning functions. No AI. No side effects. Deterministic.

/** Remove PDF page markers like "-- 1 of 3 --" and repeated headers */
export function cleanExtractedText(text: string): string {
  return text
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")   // PDF page markers
    .replace(/\n{3,}/g, "\n\n")                     // collapse excess blank lines
    .trim();
}

/** Count words in a text string */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Truncate text to a maximum number of characters (for API input limits) */
export function truncateText(text: string, maxChars = 10000): string {
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

/** Check if text appears to contain a given section heading */
export function containsSection(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
}
