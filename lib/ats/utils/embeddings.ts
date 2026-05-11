// lib/ats/utils/embeddings.ts
// Cosine similarity computation. Pure math. No AI calls here.
// AI embedding calls happen in scoring/semantic_match.ts.

/** Compute cosine similarity between two equal-length numeric vectors.
 *  Returns a value in [-1, 1]. Returns 0 if either vector is zero-length. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Map cosine similarity from embedding space to a 0–100 ATS score.
 *
 * For text-embedding-3-small, related-document similarity typically
 * falls in the 0.50–1.00 range. We map linearly:
 *   0.50 → 0
 *   1.00 → 100
 *
 * Values outside [0.5, 1.0] are clamped.
 */
export function similarityToScore(similarity: number): number {
  return Math.min(100, Math.max(0, (similarity - 0.5) * 200));
}
