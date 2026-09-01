// ============================================================================
// VIEW ADAPTER — maps persisted D1 rows (DiagnosisRow + RiskAssessmentRow +
// RecommendationRow + WeatherSnapshot + DealerRow[]) into the ViewDiagnosisCase
// shape the existing frontend pages (diagnosis.tsx / action.tsx) render.
// Keeping this mapping in one place means the UI components never had to be
// rewritten when the backend moved from in-memory mocks to D1.
// ============================================================================

import type { DiagnosisRow, RiskAssessmentRow, RecommendationRow } from '../repositories/diagnoses.repo'
import { DiagnosesRepo } from '../repositories/diagnoses.repo'
import type { WeatherSnapshot } from '../services/weather'
import type { DealerRow } from '../repositories/dealers.repo'
import type { FollowupRow } from '../repositories/followups.repo'
import { fromJson } from '../utils/db'
import { CATEGORY_META, type ViewDiagnosisCase, type ViewCategoryAssessment } from './view-types'
import type { CategoryAssessment, RiskLevel } from '@ai/inference/types'

function riskFromConfidenceSeverity(severity: string, confidence: number): RiskLevel {
  if (severity === 'Severe' && confidence >= 60) return 'Critical'
  if (severity === 'Severe') return 'High'
  if (severity === 'Moderate') return 'Moderate'
  return 'Low'
}

function toViewAssessment(type: 'disease' | 'pest' | 'abiotic', a: CategoryAssessment, isPrimary: boolean): ViewCategoryAssessment {
  const meta = CATEGORY_META[type]
  return {
    type,
    icon: meta.icon,
    label: meta.label,
    cause: a.cause,
    scientificName: a.scientificName,
    confidence: a.confidence,
    severity: a.severity,
    riskLevel: riskFromConfidenceSeverity(a.severity, a.confidence),
    alternatives: a.alternatives || [],
    isPrimary,
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return iso
  }
}

export function buildViewDiagnosisCase(
  row: DiagnosisRow,
  risk: RiskAssessmentRow | null,
  reco: RecommendationRow | null,
  followup: FollowupRow | null,
  weather: WeatherSnapshot,
  regionalAdvisory: { hotspotStatus: ViewDiagnosisCase['regional']['hotspotStatus']; nearbyReports: number; radiusKm: number; dominantIssue: string; advisory: string },
  dealers: DealerRow[]
): ViewDiagnosisCase {
  const { disease, pest, abiotic } = DiagnosesRepo.parseAssessments(row)

  const helpProviders = dealers.slice(0, 4).map((d) => ({
    name: d.name,
    type: 'Dealer' as const,
    distanceKm: 3 + Math.round(Math.random() * 12), // demo distance, no live geo-routing in prototype scope
    phone: d.phone || 'N/A',
    village: d.village || '',
    verified: !!d.verified,
    rating: d.rating,
  }))

  return {
    id: row.id,
    scanId: row.scan_code,
    cropName: row.crop_name,
    cropEmoji: row.crop_emoji,
    variety: row.variety || 'Unspecified variety',
    stage: row.crop_stage || 'Unspecified stage',
    farmerName: 'Farmer', // Section 41 — replaced by real user name once auth-linked crop detail pages land
    village: row.village || 'Unspecified',
    district: row.district || 'Unspecified',
    date: formatDate(row.created_at),
    fieldSizeAcres: row.field_size_acres ?? 0,
    budgetLevel: 'Medium',
    primaryType: row.primary_type,
    overallConfidence: row.overall_confidence,
    uncertain: !!row.uncertain,
    uncertaintyMessage: row.uncertainty_message || undefined,
    disease: toViewAssessment('disease', disease, row.primary_type === 'disease'),
    pest: toViewAssessment('pest', pest, row.primary_type === 'pest'),
    abiotic: toViewAssessment('abiotic', abiotic, row.primary_type === 'abiotic'),
    weather: {
      temp: `${weather.temperatureC}°C`,
      humidity: `${weather.humidityPct}%`,
      rainfall: `${weather.rainfallMm} mm`,
      soilMoisture: `${Math.round(weather.soilMoisturePct)}%`,
      forecast: weather.forecastNote,
      windSpeed: `${weather.windKmh} km/h`,
    },
    regional: regionalAdvisory,
    recommendations: reco
      ? {
          immediateActions: fromJson(reco.immediate_actions_json, []),
          treatmentGuidance: fromJson(reco.treatment_guidance_json, []),
          culturalPractices: fromJson(reco.cultural_practices_json, []),
          safeUsage: fromJson(reco.safe_usage_json, []),
          purchaseOptions: fromJson(reco.purchase_options_json, []),
          followUp: {
            rescanAfterDays: followup?.rescan_after_days ?? 3,
            monitorNotes: followup ? fromJson(followup.monitor_notes_json || '[]', []) : [],
            escalateWhen: reco.escalate_when || followup?.escalate_when || '',
          },
        }
      : {
          immediateActions: [],
          treatmentGuidance: [],
          culturalPractices: [],
          safeUsage: [],
          purchaseOptions: [],
          followUp: { rescanAfterDays: 3, monitorNotes: [], escalateWhen: '' },
        },
    helpProviders,
    status: row.status,
  }
}
