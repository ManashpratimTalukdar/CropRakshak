// ============================================================================
// AI EVIDENCE FUSION ENGINE (Section 8) — the core intelligence of Crop Rakshak.
//
// Combines:
//   IMAGE ANALYSIS + CROP/FIELD DATA + SOIL + IRRIGATION + TREATMENT HISTORY
//   + WEATHER + REGIONAL REPORTS + SEED DATA + SIMILARITY SEARCH
// into ONE fused diagnosis, rather than trusting the image classifier alone.
//
// Design principles (Sections 12/13/62):
//   - Never silently average away disagreement — record *why* confidence
//     moved in reasoningNotes[] so the result stays explainable.
//   - Confidence can only be nudged by contextual evidence within a capped
//     range; it must remain traceable to the underlying image-model score.
//   - Low/conflicting confidence => uncertain=true, asks for more info
//     instead of forcing a falsely confident answer (Section 13).
// ============================================================================

import type { EvidenceBundle, FusedDiagnosis, CategoryAssessment, IssueType } from '../inference/types'
import { UNCERTAINTY_CONFIDENCE_THRESHOLD, FUSION_WEIGHTS, HIGH_VULNERABILITY_STAGES } from '../config/thresholds'

/** Small bounded nudge helper — contextual evidence can shift confidence but never overwhelm the image model. */
function nudge(base: number, delta: number, capAbs = 12): number {
  const clamped = Math.max(-capAbs, Math.min(capAbs, delta))
  return Math.max(2, Math.min(98, Math.round(base + clamped)))
}

function withConfidence(a: CategoryAssessment, confidence: number): CategoryAssessment {
  return { ...a, confidence }
}

export function fuseEvidence(evidence: EvidenceBundle): FusedDiagnosis {
  const { image } = evidence
  const notes: string[] = [`Image analysis (${image.source}) suggested ${image.primaryType}: "${image.disease.type === image.primaryType ? image.disease.cause : image.primaryType === 'pest' ? image.pest.cause : image.abiotic.cause}" at ${image.overallConfidence}% confidence.`]

  let disease = image.disease
  let pest = image.pest
  let abiotic = image.abiotic

  const byType: Record<IssueType, CategoryAssessment> = { disease, pest, abiotic }

  // ---- Weather corroboration (Section 8/38) ----------------------------------
  if (evidence.weather) {
    const { humidityPct, rainfallMm, temperatureC } = evidence.weather
    const humidFungalFavor = (humidityPct ?? 0) >= 70 && (rainfallMm ?? 0) > 0
    const hotDryPestFavor = (temperatureC ?? 0) >= 30 && (humidityPct ?? 100) <= 60

    if (humidFungalFavor && (byType.disease.type === image.primaryType || byType.disease.confidence >= 30)) {
      byType.disease = withConfidence(byType.disease, nudge(byType.disease.confidence, +6, FUSION_WEIGHTS.weather * 100))
      notes.push('Humid + recent rainfall conditions favour fungal/bacterial spread — disease confidence nudged up slightly.')
    }
    if (hotDryPestFavor && (byType.pest.type === image.primaryType || byType.pest.confidence >= 25)) {
      byType.pest = withConfidence(byType.pest, nudge(byType.pest.confidence, +6, FUSION_WEIGHTS.weather * 100))
      notes.push('Hot & dry conditions favour pest population build-up (e.g., whitefly, mites) — pest confidence nudged up slightly.')
    }
  }

  // ---- Crop stage vulnerability (Section 15) ---------------------------------
  if (evidence.cropStage && HIGH_VULNERABILITY_STAGES.includes(evidence.cropStage)) {
    notes.push(`Crop is at ${evidence.cropStage} stage — a period of higher vulnerability to rapid disease/pest progression; this raises urgency, not necessarily the diagnosis itself.`)
  }

  // ---- Soil / irrigation corroborating abiotic hypothesis (Section 7C/7D) ----
  if (evidence.soil || evidence.irrigation) {
    const lowN = evidence.soil?.n !== undefined && evidence.soil.n < 40
    const waterlogged = evidence.irrigation?.waterStress === 'Waterlogged'
    const dry = evidence.irrigation?.waterStress === 'Dry'
    if ((lowN || waterlogged || dry) && byType.abiotic.confidence >= 20) {
      const reason = lowN ? 'low soil nitrogen' : waterlogged ? 'waterlogged field conditions' : 'dry/water-stressed field conditions'
      byType.abiotic = withConfidence(byType.abiotic, nudge(byType.abiotic.confidence, +8, FUSION_WEIGHTS.soil * 100 + FUSION_WEIGHTS.irrigation * 100))
      notes.push(`Recorded ${reason} is consistent with the abiotic-stress hypothesis — confidence nudged up.`)
    }
  }

  // ---- Treatment history (Section 7E) ----------------------------------------
  if (evidence.treatmentHistory?.pastIssues) {
    notes.push(`Field history notes past issue(s): "${evidence.treatmentHistory.pastIssues}" — considered as background context, not proof of recurrence.`)
  }

  // ---- Regional reports corroboration (Section 8/29) --------------------------
  if (evidence.regional && evidence.regional.nearbyReports > 0) {
    const regionalBoost = Math.min(10, Math.round(evidence.regional.nearbyReports / 3))
    const dominant = (evidence.regional.dominantIssue || '').toLowerCase()
    for (const t of ['disease', 'pest', 'abiotic'] as IssueType[]) {
      const a = byType[t]
      if (dominant && a.cause.toLowerCase().includes(dominant.split(' ')[0])) {
        byType[t] = withConfidence(a, nudge(a.confidence, +regionalBoost, FUSION_WEIGHTS.regional * 100))
        notes.push(`Regional signal: ${evidence.regional.nearbyReports} nearby reports within ${evidence.regional.radiusKm} km (status: ${evidence.regional.hotspotStatus}) support this finding — confidence nudged up.`)
      }
    }
    if (evidence.regional.isDemo) {
      notes.push('Regional evidence used above is Prototype / Demonstration Data, not a live outbreak feed.')
    }
  }

  // ---- Similarity search corroboration (Section 11) ---------------------------
  const similarCases = evidence.similarCases || []
  if (similarCases.length > 0) {
    const avgSim = similarCases.reduce((s, c) => s + c.similarityPct, 0) / similarCases.length
    if (avgSim >= 60) {
      const primary = byType[image.primaryType]
      byType[image.primaryType] = withConfidence(primary, nudge(primary.confidence, +5, 5))
      notes.push(`Similarity search found ${similarCases.length} historically similar case(s) averaging ${Math.round(avgSim)}% visual similarity, supporting the current primary hypothesis.`)
    }
  }

  // ---- Recompute primary + overall confidence after fusion --------------------
  const ranked = (Object.entries(byType) as [IssueType, CategoryAssessment][]).sort((a, b) => b[1].confidence - a[1].confidence)
  const [primaryType, primaryAssessment] = ranked[0]
  const secondBest = ranked[1][1].confidence

  // Conflicting evidence: top two hypotheses very close together => treat as uncertain
  const conflicting = primaryAssessment.confidence - secondBest < 10
  const uncertain = primaryAssessment.confidence < UNCERTAINTY_CONFIDENCE_THRESHOLD || conflicting

  let uncertaintyMessage: string | undefined
  if (uncertain) {
    uncertaintyMessage = conflicting && primaryAssessment.confidence >= UNCERTAINTY_CONFIDENCE_THRESHOLD
      ? `Two possible causes are close in likelihood (${primaryAssessment.cause} vs ${ranked[1][1].cause}) — more information is needed to be confident which one applies. Please provide a clearer or additional photo, or additional field details.`
      : `Confidence is below our reliable threshold (${primaryAssessment.confidence}%). ${primaryAssessment.cause} is our best estimate, but the evidence is not strong enough to be sure. We need a clearer, closer photo — ideally in daylight, without shadows — or additional crop/soil/weather details before we can raise confidence.`
    notes.push('Uncertainty check triggered — recommending additional evidence before acting on this result (Section 13).')
  }

  return {
    primaryType,
    primaryCause: primaryAssessment.cause,
    primaryScientificName: primaryAssessment.scientificName,
    overallConfidence: primaryAssessment.confidence,
    severity: primaryAssessment.severity,
    disease: byType.disease,
    pest: byType.pest,
    abiotic: byType.abiotic,
    uncertain,
    uncertaintyMessage,
    reasoningNotes: notes,
    similarCases,
  }
}
