// ============================================================================
// VIEW TYPES — shape the D1-backed diagnosis/action routes hand to the
// existing frontend pages (frontend/src/pages/diagnosis.tsx, action.tsx).
// Kept intentionally close to the old mock-data shape so the already-built
// UI components (CategoryCard, follow-up timeline, etc.) don't need a
// rewrite — only their data source changes (D1 instead of in-memory mocks).
// ============================================================================

import type { IssueType, Severity, RiskLevel } from '@ai/inference/types'

export interface ViewCategoryAssessment {
  type: IssueType
  icon: string
  label: string
  cause: string
  scientificName?: string
  confidence: number
  severity: Severity
  riskLevel: RiskLevel
  alternatives: string[]
  isPrimary?: boolean
}

export interface ViewWeatherSnapshot {
  temp: string
  humidity: string
  rainfall: string
  forecast: string
  soilMoisture: string
  windSpeed: string
}

export interface ViewRegionalSnapshot {
  hotspotStatus: 'Low Activity' | 'Watch' | 'Elevated Activity' | 'Outbreak Alert'
  nearbyReports: number
  radiusKm: number
  dominantIssue: string
  advisory: string
}

export interface ViewFollowUp {
  rescanAfterDays: number
  monitorNotes: string[]
  escalateWhen: string
}

export interface ViewRecommendations {
  immediateActions: string[]
  treatmentGuidance: string[]
  culturalPractices: string[]
  safeUsage: string[]
  purchaseOptions: { label: string; detail: string; icon: string }[]
  followUp: ViewFollowUp
}

export interface ViewHelpProvider {
  name: string
  type: 'Dealer' | 'KVK / Agri Office' | 'Soil Lab / Clinic' | 'Expert'
  distanceKm: number
  phone: string
  village: string
  verified: boolean
  rating: number
}

export interface ViewDiagnosisCase {
  id: string
  scanId: string
  cropName: string
  cropEmoji: string
  variety: string
  stage: string
  farmerName: string
  village: string
  district: string
  date: string
  fieldSizeAcres: number
  budgetLevel: 'Low' | 'Medium' | 'High'
  primaryType: IssueType
  overallConfidence: number
  uncertain: boolean
  uncertaintyMessage?: string
  disease: ViewCategoryAssessment
  pest: ViewCategoryAssessment
  abiotic: ViewCategoryAssessment
  weather: ViewWeatherSnapshot
  regional: ViewRegionalSnapshot
  recommendations: ViewRecommendations
  helpProviders: ViewHelpProvider[]
  status: string
}

export const CATEGORY_META: Record<IssueType, { icon: string; label: string }> = {
  disease: { icon: 'fa-leaf', label: 'Disease' },
  pest: { icon: 'fa-bug', label: 'Pest' },
  abiotic: { icon: 'fa-droplet', label: 'Abiotic Stress' },
}
