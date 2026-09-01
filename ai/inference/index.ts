// ============================================================================
// AI MODEL SELECTOR — the single seam the backend calls through (Section 55).
// Chooses MockCropHealthModel or RealCropHealthModel based on DEMO_MODE and
// binding availability, without the caller needing to know which one runs.
// ============================================================================

import type { AIModelInterface } from './types'
import { MockCropHealthModel } from './mock-model'
import { RealCropHealthModel } from './real-model'

export * from './types'
export { fileToDataUrl } from './real-model'

export interface AiSelectorEnv {
  AI?: Ai
  DEMO_MODE?: string
}

/**
 * Returns the AIModelInterface implementation to use for this request.
 * - DEMO_MODE=true (or unset)  → MockCropHealthModel (explicit, no external calls)
 * - DEMO_MODE=false + AI bound → RealCropHealthModel (Cloudflare Workers AI)
 * - DEMO_MODE=false + no AI    → RealCropHealthModel, which itself degrades to
 *                                 a labeled heuristic fallback (see real-model.ts)
 */
export function getAiModel(env: AiSelectorEnv): AIModelInterface {
  const demoMode = env.DEMO_MODE !== 'false' // default true unless explicitly disabled
  if (demoMode) return new MockCropHealthModel()
  return new RealCropHealthModel(env.AI)
}
