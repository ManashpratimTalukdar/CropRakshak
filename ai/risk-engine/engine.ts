// ============================================================================
// RISK ENGINE (Section 10) — "Prototype Risk Model"
//
// IMPORTANT (Section 62): this is explicitly NOT a scientifically validated
// epidemiological model. It is a transparent, modular scoring heuristic that
// combines disease/pest severity with weather, crop stage, historical cases,
// and regional reports into a 0-100 score + LOW/MODERATE/HIGH/CRITICAL band.
// Every factor is recorded so the score stays fully explainable, and the
// model is intentionally kept swappable — see RISK_MODEL_LABEL and the
// modular addFactor() pattern below, which a validated model could replace
// without changing any caller code (same RiskAssessment return shape).
// ============================================================================

import type { EvidenceBundle, FusedDiagnosis, RiskAssessment, RiskFactor, RiskLevel } from '../inference/types'
import { RISK_BANDS, RISK_MODEL_LABEL, HIGH_VULNERABILITY_STAGES } from '../config/thresholds'

function bandFromScore(score: number): RiskLevel {
  if (score <= RISK_BANDS.LOW_MAX) return 'Low'
  if (score <= RISK_BANDS.MODERATE_MAX) return 'Moderate'
  if (score <= RISK_BANDS.HIGH_MAX) return 'High'
  return 'Critical'
}

export function assessRisk(diagnosis: FusedDiagnosis, evidence: EvidenceBundle): RiskAssessment {
  const factors: RiskFactor[] = []
  let score = 0

  const addFactor = (name: string, contribution: number, note: string) => {
    factors.push({ name, contribution, note })
    score += contribution
  }

  // ---- Base severity of the primary finding -----------------------------
  const severityPoints = diagnosis.severity === 'Severe' ? 35 : diagnosis.severity === 'Moderate' ? 20 : 8
  addFactor('Severity', severityPoints, `Primary finding severity: ${diagnosis.severity}.`)

  // ---- Confidence — a confident bad finding is riskier than an uncertain one
  const confPoints = Math.round((diagnosis.overallConfidence / 100) * 15)
  addFactor('Diagnostic confidence', confPoints, `${diagnosis.overallConfidence}% confidence in "${diagnosis.primaryCause}".`)

  // ---- Weather amplification (Section 10) --------------------------------
  if (evidence.weather) {
    const { humidityPct, rainfallMm, temperatureC } = evidence.weather
    if (diagnosis.primaryType === 'disease' && (humidityPct ?? 0) >= 70) {
      addFactor('Weather (humidity)', 10, `${humidityPct}% humidity favours disease spread.`)
    }
    if (diagnosis.primaryType === 'pest' && (temperatureC ?? 0) >= 30 && (humidityPct ?? 100) <= 60) {
      addFactor('Weather (heat & dryness)', 10, `${temperatureC}°C and ${humidityPct}% humidity favour pest population growth.`)
    }
    if ((rainfallMm ?? 0) > 30) {
      addFactor('Weather (heavy rainfall)', 5, `${rainfallMm} mm recent rainfall — waterlogging / nutrient leaching risk.`)
    }
  }

  // ---- Crop stage vulnerability -------------------------------------------
  if (evidence.cropStage && HIGH_VULNERABILITY_STAGES.includes(evidence.cropStage)) {
    addFactor('Crop stage', 8, `${evidence.cropStage} stage is more vulnerable to yield loss from this issue.`)
  }

  // ---- Historical / treatment context -------------------------------------
  if (evidence.treatmentHistory?.pastIssues) {
    addFactor('Field history', 5, 'This field has a recorded history of similar issues — recurrence risk.')
  }

  // ---- Regional reports (Section 29) ---------------------------------------
  if (evidence.regional && evidence.regional.nearbyReports > 0) {
    const regionalPoints = Math.min(20, evidence.regional.nearbyReports * 1.5)
    addFactor(
      'Regional reports',
      Math.round(regionalPoints),
      `${evidence.regional.nearbyReports} nearby report(s) within ${evidence.regional.radiusKm} km (${evidence.regional.hotspotStatus})${evidence.regional.isDemo ? ' — Prototype/Demonstration Data' : ''}.`
    )
  }

  // ---- Uncertainty dampener — never let an uncertain case read as CRITICAL
  if (diagnosis.uncertain) {
    addFactor('Uncertainty dampener', -15, 'Diagnosis confidence is below the reliable threshold — risk score capped downward until confirmed.')
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)))

  return {
    riskScore: clamped,
    riskLevel: bandFromScore(clamped),
    factors,
    modelLabel: RISK_MODEL_LABEL,
  }
}
