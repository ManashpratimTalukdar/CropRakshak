// ============================================================================
// SIMILARITY SEARCH (Section 11) — compares a current diagnosis against
// historical/reference cases to surface supporting evidence.
//
// This is a MOCK implementation, clearly labeled as such. The abstraction
// (SimilaritySearchService interface) is designed so a real vector search
// backend (pgvector, FAISS, Cloudflare Vectorize, etc.) could be dropped in
// later without changing the evidence-fusion engine that consumes it.
// ============================================================================

import type { SimilarCase } from '../inference/types'

export interface SimilaritySearchService {
  readonly isMock: boolean
  findSimilar(cropName: string, primaryCause: string, limit?: number): Promise<SimilarCase[]>
}

/**
 * Deterministic mock similarity search: pretends to compare embeddings by
 * hashing crop+cause into a stable pseudo-random similarity score. Returns
 * 0-3 "similar cases" with plausible outcomes. Prepared architecture for a
 * future pgvector/FAISS/Vectorize-backed implementation (Section 11).
 */
export class MockSimilaritySearchService implements SimilaritySearchService {
  readonly isMock = true

  async findSimilar(cropName: string, primaryCause: string, limit = 3): Promise<SimilarCase[]> {
    const seed = hash(cropName + primaryCause)
    const count = 1 + (seed % 3) // 1-3 similar cases
    const outcomes = ['Improved after treatment', 'Escalated to expert review', 'Resolved after re-scan confirmed recovery']
    const results: SimilarCase[] = []
    for (let i = 0; i < Math.min(count, limit); i++) {
      const sim = 55 + ((seed + i * 13) % 40) // 55-94%
      results.push({
        caseId: `demo-sim-${seed % 9000}-${i}`,
        cropName,
        cause: primaryCause,
        similarityPct: sim,
        outcome: outcomes[(seed + i) % outcomes.length],
      })
    }
    return results.sort((a, b) => b.similarityPct - a.similarityPct)
  }
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function getSimilaritySearchService(): SimilaritySearchService {
  // Future: swap based on env (e.g., pgvector/FAISS/Vectorize configured) —
  // for this hackathon-scope build, always the mock (Section 11 requirement).
  return new MockSimilaritySearchService()
}
