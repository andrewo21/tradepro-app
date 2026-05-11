// lib/ats/scoring/semantic_match.ts
// One AI call (embeddings only). Score math is pure deterministic formula.

import OpenAI from "openai";
import { cosineSimilarity, similarityToScore } from "../utils/embeddings";
import { truncateText } from "../utils/text_cleaning";

export interface SemanticMatchResult {
  score: number;       // 0–100
  raw_similarity: number; // cosine similarity before mapping
  used_fallback: boolean; // true if embeddings failed and we used default
}

const FALLBACK_SCORE = 50; // neutral default if embeddings fail

/**
 * Compute semantic similarity between resume and job description
 * using OpenAI text-embedding-3-small + cosine similarity.
 *
 * Falls back to FALLBACK_SCORE (50) if the embedding call fails,
 * so the overall ATS score is never blocked by an embeddings failure.
 */
export async function computeSemanticMatch(
  client: OpenAI,
  resumeText: string,
  jobText: string
): Promise<SemanticMatchResult> {
  try {
    const [resumeEmb, jobEmb] = await Promise.all([
      client.embeddings.create({
        model: "text-embedding-3-small",
        input: truncateText(resumeText, 8000),
      }),
      client.embeddings.create({
        model: "text-embedding-3-small",
        input: truncateText(jobText, 8000),
      }),
    ]);

    const rawSim = cosineSimilarity(
      resumeEmb.data[0].embedding,
      jobEmb.data[0].embedding
    );
    const score = similarityToScore(rawSim);

    return { score, raw_similarity: rawSim, used_fallback: false };
  } catch {
    return { score: FALLBACK_SCORE, raw_similarity: -1, used_fallback: true };
  }
}
