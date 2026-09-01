// ============================================================================
// AI MODULE — barrel export. The backend imports the whole pipeline through
// this single entry point:
//
//   Image → getAiModel().classify() → fuseEvidence() → assessRisk()
//         → generateRecommendations()
//
// See docs/ai-pipeline.md for the full data-flow diagram and rationale.
// ============================================================================

export * from './inference'
export { fuseEvidence } from './evidence-fusion/engine'
export { getSimilaritySearchService } from './evidence-fusion/similarity-search'
export { assessRisk } from './risk-engine/engine'
export { generateRecommendations } from './recommendation-engine/engine'
export * from './config/thresholds'
