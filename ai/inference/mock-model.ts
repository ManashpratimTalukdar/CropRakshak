// ============================================================================
// MOCK CROP HEALTH MODEL — deterministic, clearly-labeled stand-in for a real
// trained CNN/YOLO/MobileNet-style classifier (Section 4 / 55 / 76).
//
// Used whenever:
//   - DEMO_MODE=true, or
//   - the Cloudflare Workers AI binding is unavailable / errors out.
//
// IMPORTANT (Section 76): this never claims a fabricated accuracy number and
// always keeps confidence in a realistic, non-inflated range. It is crop-name
// aware only as a light heuristic nudge — it is NOT real image analysis.
// ============================================================================

import type { AIModelInterface, ClassifyInput, ImageAnalysisResult, IssueType, CategoryAssessment } from './types'

const CROP_PROFILES: Record<string, { disease: string; pest: string; abiotic: string; primary: IssueType }> = {
  wheat: { disease: 'Leaf Rust (early pustule stage)', pest: 'Aphid colonies (trace, non-threshold)', abiotic: 'Minor nitrogen mottling on older leaves', primary: 'disease' },
  tomato: { disease: 'Possible early Leaf Curl Virus (secondary to pest)', pest: 'Whitefly infestation on leaf undersides', abiotic: 'Mild heat stress on top leaves', primary: 'pest' },
  rice: { disease: 'Cannot rule out early Bacterial Leaf Blight', pest: 'Minor leafhopper presence (non-threshold)', abiotic: 'Likely Nitrogen deficiency (interveinal yellowing)', primary: 'abiotic' },
  maize: { disease: 'Leaf-related disease (early lesion pattern)', pest: 'Fall Armyworm feeding damage', abiotic: 'Mild potassium deficiency (leaf margin scorch)', primary: 'pest' },
  default: { disease: 'Possible fungal leaf spot (unconfirmed)', pest: 'No significant pest activity detected', abiotic: 'No significant abiotic stress detected', primary: 'disease' },
}

function assessment(type: IssueType, cause: string, confidence: number, alternatives: string[]): CategoryAssessment {
  return {
    type,
    cause,
    confidence,
    severity: confidence >= 70 ? 'Severe' : confidence >= 40 ? 'Moderate' : 'Mild',
    alternatives,
  }
}

/** Simple string hash so the same crop+notes combination is stable across requests (deterministic demo). */
function seedFrom(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export class MockCropHealthModel implements AIModelInterface {
  readonly name = 'MockCropHealthModel (heuristic, not a trained model)'
  readonly isMock = true

  async classify(input: ClassifyInput): Promise<ImageAnalysisResult> {
    const cropKey = (input.cropName || '').toLowerCase().trim()
    const profile = CROP_PROFILES[cropKey] || CROP_PROFILES.default
    const seed = seedFrom(cropKey + (input.contextNote || ''))

    // Deterministic pseudo-random confidence in a realistic (never-inflated) band.
    const jitter = (base: number, spread: number) => Math.max(8, Math.min(94, Math.round(base + ((seed % 17) - 8) * (spread / 8))))

    const primaryConf = jitter(76, 10)
    const secondaryConf1 = jitter(30, 12)
    const secondaryConf2 = jitter(15, 8)

    const byType: Record<IssueType, CategoryAssessment> = {
      disease: assessment('disease', profile.disease, profile.primary === 'disease' ? primaryConf : secondaryConf1, []),
      pest: assessment('pest', profile.pest, profile.primary === 'pest' ? primaryConf : secondaryConf1, []),
      abiotic: assessment('abiotic', profile.abiotic, profile.primary === 'abiotic' ? primaryConf : secondaryConf2, []),
    }

    return {
      primaryType: profile.primary,
      overallConfidence: byType[profile.primary].confidence,
      disease: byType.disease,
      pest: byType.pest,
      abiotic: byType.abiotic,
      summary: `Mock inference (demo mode): ${byType[profile.primary].cause}. This is a deterministic placeholder, not a trained-model result — see docs/ai-pipeline.md.`,
      source: 'mock',
      modelUsed: this.name,
      modelVersion: 'mock-v1',
    }
  }
}
