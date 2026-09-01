// ============================================================================
// AI CONFIG — shared thresholds & constants for the evidence-fusion pipeline,
// risk engine, and uncertainty checks. Centralized here so all three modules
// (evidence-fusion, risk-engine, inference) stay consistent and are easy to
// tune without hunting through business logic.
// ============================================================================

/** Below this overall confidence, the "more information needed" flow triggers (Section 13). */
export const UNCERTAINTY_CONFIDENCE_THRESHOLD = 55

/** Risk score band boundaries (0-100) → RiskLevel (Section 10). */
export const RISK_BANDS = {
  LOW_MAX: 30,
  MODERATE_MAX: 55,
  HIGH_MAX: 80,
  // > HIGH_MAX => CRITICAL
} as const

/** Label shown everywhere risk/AI output appears, per Section 62 (safety rule). */
export const RISK_MODEL_LABEL = 'Prototype Risk Model — not a validated epidemiological model'

/** Relative fusion weights per evidence source (Section 8). Tunable, sums are not required to equal 1. */
export const FUSION_WEIGHTS = {
  image: 0.45,
  weather: 0.15,
  cropStage: 0.10,
  soil: 0.08,
  irrigation: 0.05,
  treatmentHistory: 0.05,
  regional: 0.10,
  seed: 0.02,
} as const

/** Crop stages most vulnerable to rapid disease/pest progression (used by risk engine). */
export const HIGH_VULNERABILITY_STAGES = ['Flowering', 'Fruiting']
