// ============================================================================
// DIAGNOSIS PIPELINE — the single orchestration point for the P1 core flow:
//
//   Image + context evidence
//     -> getAiModel().classify()        (ai/inference)
//     -> fuseEvidence()                 (ai/evidence-fusion)
//     -> assessRisk()                   (ai/risk-engine)
//     -> generateRecommendations()      (ai/recommendation-engine)
//     -> persist via repositories       (backend/src/repositories)
//
// Every route that produces a diagnosis (POST /api/scan, future
// /api/v1/diagnosis/analyze) should call runDiagnosisPipeline() rather than
// re-implementing this sequence, so the core pipeline only lives in one place.
// ============================================================================

import {
  getAiModel,
  fuseEvidence,
  assessRisk,
  generateRecommendations,
  getSimilaritySearchService,
} from '@ai/index'
import type { EvidenceBundle, FusedDiagnosis, RiskAssessment } from '@ai/inference/types'
import type { RecommendationSet } from '@ai/recommendation-engine/engine'
import type { Bindings } from '../lib/types'
import { DiagnosesRepo, DiagnosisEvidenceRepo, RiskAssessmentsRepo, RecommendationsRepo, type DiagnosisRow } from '../repositories/diagnoses.repo'
import { FollowupsRepo } from '../repositories/followups.repo'
import { RegionalReportsRepo } from '../repositories/regional.repo'
import { getWeatherSnapshot } from './weather'

export interface ScanInput {
  userId?: string
  cropId?: string
  cropName: string
  cropEmoji?: string
  variety?: string
  cropStage?: string
  fieldSizeAcres?: number
  village?: string
  district?: string
  latitude?: number
  longitude?: number
  imageDataUrl: string
  contextNote?: string
  soil?: EvidenceBundle['soil']
  irrigation?: EvidenceBundle['irrigation']
  treatmentHistory?: EvidenceBundle['treatmentHistory']
  isDemo?: boolean
}

export interface PipelineResult {
  diagnosis: DiagnosisRow
  fused: FusedDiagnosis
  risk: RiskAssessment
  recommendations: RecommendationSet
}

/**
 * Runs the full P1 core pipeline for a single scan and persists every stage
 * (diagnosis, evidence bundle, risk assessment, recommendations, follow-up
 * plan, and — when the finding isn't uncertain — a regional report entry
 * feeding the Section 29/30 hotspot map).
 */
export async function runDiagnosisPipeline(env: Bindings, input: ScanInput): Promise<PipelineResult> {
  const model = getAiModel(env)
  const imageResult = await model.classify({
    imageDataUrl: input.imageDataUrl,
    cropName: input.cropName,
    contextNote: input.contextNote,
  })

  const weather = await getWeatherSnapshot(env, input.latitude, input.longitude)

  const regionalRepo = new RegionalReportsRepo(env.DB)
  const nearbyReports = input.district ? await regionalRepo.countNearby(input.district, input.cropName) : 0
  const hotspotStatus: EvidenceBundle['regional'] = input.district
    ? {
        nearbyReports,
        radiusKm: 15,
        hotspotStatus: nearbyReports >= 8 ? 'Outbreak Alert' : nearbyReports >= 4 ? 'Elevated Activity' : nearbyReports >= 1 ? 'Watch' : 'Low Activity',
        advisory: nearbyReports > 0
          ? `${nearbyReports} nearby report(s) for ${input.cropName} in ${input.district} over the last 30 days — Prototype/Demonstration Data.`
          : `No recent nearby reports on file for ${input.cropName} in ${input.district}.`,
        isDemo: true,
      }
    : undefined

  const similarityService = getSimilaritySearchService()
  const similarCases = await similarityService.findSimilar(input.cropName, imageResult.disease.cause)

  const evidence: EvidenceBundle = {
    image: imageResult,
    cropStage: input.cropStage,
    soil: input.soil,
    irrigation: input.irrigation,
    treatmentHistory: input.treatmentHistory,
    weather: { ...weather },
    regional: hotspotStatus,
    similarCases,
  }

  const fused = fuseEvidence(evidence)
  const risk = assessRisk(fused, evidence)
  const recommendations = generateRecommendations(fused)

  const diagnosesRepo = new DiagnosesRepo(env.DB)
  const evidenceRepo = new DiagnosisEvidenceRepo(env.DB)
  const riskRepo = new RiskAssessmentsRepo(env.DB)
  const recoRepo = new RecommendationsRepo(env.DB)
  const followupsRepo = new FollowupsRepo(env.DB)

  const diagnosis = await diagnosesRepo.create({
    userId: input.userId,
    cropId: input.cropId,
    cropName: input.cropName,
    cropEmoji: input.cropEmoji,
    variety: input.variety,
    cropStage: input.cropStage,
    village: input.village,
    district: input.district,
    latitude: input.latitude,
    longitude: input.longitude,
    fieldSizeAcres: input.fieldSizeAcres,
    diagnosis: fused,
    aiSource: imageResult.source,
    aiModelUsed: imageResult.modelUsed,
    isDemo: input.isDemo ?? false,
  })

  await evidenceRepo.saveBundle(diagnosis.id, evidence)
  await riskRepo.create(diagnosis.id, risk)
  await recoRepo.create(diagnosis.id, recommendations)
  await followupsRepo.create(diagnosis.id, recommendations.followUp.rescanAfterDays, recommendations.followUp.monitorNotes, recommendations.followUp.escalateWhen)

  // Feed the regional early-warning system, but only once the finding is
  // reasonably confident — never let an uncertain guess pollute the hotspot map.
  if (!fused.uncertain && input.district) {
    await regionalRepo.create({
      diagnosisId: diagnosis.id,
      cropName: input.cropName,
      issueName: fused.primaryCause,
      issueType: fused.primaryType,
      district: input.district,
      latitude: input.latitude,
      longitude: input.longitude,
      riskLevel: risk.riskLevel,
      isDemo: input.isDemo ?? false,
    })
  }

  return { diagnosis, fused, risk, recommendations }
}
