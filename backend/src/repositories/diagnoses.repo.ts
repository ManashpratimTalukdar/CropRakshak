// ============================================================================
// DIAGNOSES REPOSITORY — persists the fused diagnosis + risk assessment +
// recommendations + evidence bundle for every scan (Sections 12/48/50/51).
// ============================================================================

import type { FusedDiagnosis, RiskAssessment, EvidenceBundle, CategoryAssessment, IssueType } from '@ai/inference/types'
import type { RecommendationSet } from '@ai/recommendation-engine/engine'
import { newId, nowIso, toJson, fromJson, toBool, fromBool } from '../utils/db'

export interface DiagnosisRow {
  id: string
  scan_code: string
  user_id: string | null
  crop_id: string | null
  crop_name: string
  crop_emoji: string
  variety: string | null
  crop_stage: string | null
  village: string | null
  district: string | null
  latitude: number | null
  longitude: number | null
  image_url: string | null
  primary_type: IssueType
  primary_cause: string
  primary_scientific: string | null
  overall_confidence: number
  uncertain: number
  uncertainty_message: string | null
  disease_json: string
  pest_json: string
  abiotic_json: string
  ai_source: string
  ai_model_used: string | null
  status: string
  is_demo: number
  created_at: string
  updated_at: string
}

export interface CreateDiagnosisInput {
  userId?: string
  cropId?: string
  cropName: string
  cropEmoji?: string
  variety?: string
  cropStage?: string
  village?: string
  district?: string
  latitude?: number
  longitude?: number
  imageUrl?: string
  diagnosis: FusedDiagnosis
  aiSource: 'mock' | 'workers-ai' | 'heuristic-fallback'
  aiModelUsed?: string
  isDemo?: boolean
}

export class DiagnosesRepo {
  constructor(private db: D1Database) {}

  async create(input: CreateDiagnosisInput): Promise<DiagnosisRow> {
    const id = newId('diag')
    const now = nowIso()
    const scanCode = `SCN-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`
    const d = input.diagnosis

    await this.db
      .prepare(
        `INSERT INTO diagnoses (
          id, scan_code, user_id, crop_id, crop_name, crop_emoji, variety, crop_stage,
          village, district, latitude, longitude, image_url,
          primary_type, primary_cause, primary_scientific, overall_confidence,
          uncertain, uncertainty_message, disease_json, pest_json, abiotic_json,
          ai_source, ai_model_used, status, is_demo, created_at, updated_at
        ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?21,?22,?23,?24,?25,?26,?27,?27)`
      )
      .bind(
        id,
        scanCode,
        input.userId ?? null,
        input.cropId ?? null,
        input.cropName,
        input.cropEmoji ?? '🌱',
        input.variety ?? null,
        input.cropStage ?? null,
        input.village ?? null,
        input.district ?? null,
        input.latitude ?? null,
        input.longitude ?? null,
        input.imageUrl ?? null,
        d.primaryType,
        d.primaryCause,
        d.primaryScientificName ?? null,
        d.overallConfidence,
        fromBool(d.uncertain),
        d.uncertaintyMessage ?? null,
        toJson(d.disease),
        toJson(d.pest),
        toJson(d.abiotic),
        input.aiSource,
        input.aiModelUsed ?? null,
        'AI Analyzed',
        fromBool(input.isDemo),
        now
      )
      .run()

    return (await this.findById(id))!
  }

  async findById(id: string): Promise<DiagnosisRow | null> {
    const row = await this.db.prepare('SELECT * FROM diagnoses WHERE id = ?1').bind(id).first<DiagnosisRow>()
    return row ?? null
  }

  async listByUser(userId: string, limit = 50): Promise<DiagnosisRow[]> {
    const res = await this.db
      .prepare('SELECT * FROM diagnoses WHERE user_id = ?1 ORDER BY created_at DESC LIMIT ?2')
      .bind(userId, limit)
      .all<DiagnosisRow>()
    return res.results ?? []
  }

  async listByCrop(cropId: string): Promise<DiagnosisRow[]> {
    const res = await this.db.prepare('SELECT * FROM diagnoses WHERE crop_id = ?1 ORDER BY created_at DESC').bind(cropId).all<DiagnosisRow>()
    return res.results ?? []
  }

  async listAll(limit = 200): Promise<DiagnosisRow[]> {
    const res = await this.db.prepare('SELECT * FROM diagnoses ORDER BY created_at DESC LIMIT ?1').bind(limit).all<DiagnosisRow>()
    return res.results ?? []
  }

  async listByStatus(status: string): Promise<DiagnosisRow[]> {
    const res = await this.db.prepare('SELECT * FROM diagnoses WHERE status = ?1 ORDER BY created_at DESC').bind(status).all<DiagnosisRow>()
    return res.results ?? []
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.db.prepare('UPDATE diagnoses SET status = ?1, updated_at = ?2 WHERE id = ?3').bind(status, nowIso(), id).run()
  }

  static parseAssessments(row: DiagnosisRow): { disease: CategoryAssessment; pest: CategoryAssessment; abiotic: CategoryAssessment } {
    return {
      disease: fromJson(row.disease_json, {} as CategoryAssessment),
      pest: fromJson(row.pest_json, {} as CategoryAssessment),
      abiotic: fromJson(row.abiotic_json, {} as CategoryAssessment),
    }
  }
}

// ---------------------------------------------------------------------------
// EVIDENCE
// ---------------------------------------------------------------------------
export class DiagnosisEvidenceRepo {
  constructor(private db: D1Database) {}

  async saveBundle(diagnosisId: string, evidence: EvidenceBundle): Promise<void> {
    const entries: { type: string; payload: unknown; weight: number }[] = [
      { type: 'image', payload: evidence.image, weight: 0.45 },
    ]
    if (evidence.soil) entries.push({ type: 'soil', payload: evidence.soil, weight: 0.08 })
    if (evidence.irrigation) entries.push({ type: 'irrigation', payload: evidence.irrigation, weight: 0.05 })
    if (evidence.treatmentHistory) entries.push({ type: 'treatment', payload: evidence.treatmentHistory, weight: 0.05 })
    if (evidence.weather) entries.push({ type: 'weather', payload: evidence.weather, weight: 0.15 })
    if (evidence.regional) entries.push({ type: 'regional', payload: evidence.regional, weight: 0.1 })
    if (evidence.seed) entries.push({ type: 'seed', payload: evidence.seed, weight: 0.02 })
    if (evidence.cropStage) entries.push({ type: 'crop_field', payload: { cropStage: evidence.cropStage }, weight: 0.1 })

    const stmts = entries.map((e) =>
      this.db
        .prepare('INSERT INTO diagnosis_evidence (id, diagnosis_id, evidence_type, payload_json, weight, created_at) VALUES (?1,?2,?3,?4,?5,?6)')
        .bind(newId('ev'), diagnosisId, e.type, toJson(e.payload), e.weight, nowIso())
    )
    if (stmts.length > 0) await this.db.batch(stmts)
  }

  async listByDiagnosis(diagnosisId: string): Promise<{ evidence_type: string; payload_json: string; weight: number }[]> {
    const res = await this.db
      .prepare('SELECT evidence_type, payload_json, weight FROM diagnosis_evidence WHERE diagnosis_id = ?1')
      .bind(diagnosisId)
      .all<{ evidence_type: string; payload_json: string; weight: number }>()
    return res.results ?? []
  }
}

// ---------------------------------------------------------------------------
// RISK ASSESSMENTS
// ---------------------------------------------------------------------------
export interface RiskAssessmentRow {
  id: string
  diagnosis_id: string
  risk_score: number
  risk_level: string
  factors_json: string
  model_label: string
  created_at: string
}

export class RiskAssessmentsRepo {
  constructor(private db: D1Database) {}

  async create(diagnosisId: string, risk: RiskAssessment): Promise<RiskAssessmentRow> {
    const id = newId('risk')
    await this.db
      .prepare('INSERT INTO risk_assessments (id, diagnosis_id, risk_score, risk_level, factors_json, model_label, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)')
      .bind(id, diagnosisId, risk.riskScore, risk.riskLevel, toJson(risk.factors), risk.modelLabel, nowIso())
      .run()
    return (await this.findByDiagnosis(diagnosisId))!
  }

  async findByDiagnosis(diagnosisId: string): Promise<RiskAssessmentRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM risk_assessments WHERE diagnosis_id = ?1 ORDER BY created_at DESC LIMIT 1')
      .bind(diagnosisId)
      .first<RiskAssessmentRow>()
    return row ?? null
  }
}

// ---------------------------------------------------------------------------
// RECOMMENDATIONS
// ---------------------------------------------------------------------------
export interface RecommendationRow {
  id: string
  diagnosis_id: string
  immediate_actions_json: string
  treatment_guidance_json: string
  cultural_practices_json: string
  safe_usage_json: string
  purchase_options_json: string
  escalate_when: string | null
  created_at: string
}

export class RecommendationsRepo {
  constructor(private db: D1Database) {}

  async create(diagnosisId: string, r: RecommendationSet): Promise<RecommendationRow> {
    const id = newId('reco')
    await this.db
      .prepare(
        `INSERT INTO recommendations (id, diagnosis_id, immediate_actions_json, treatment_guidance_json, cultural_practices_json, safe_usage_json, purchase_options_json, escalate_when, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)`
      )
      .bind(id, diagnosisId, toJson(r.immediateActions), toJson(r.treatmentGuidance), toJson(r.culturalPractices), toJson(r.safeUsage), toJson(r.purchaseOptions), r.followUp.escalateWhen, nowIso())
      .run()
    return (await this.findByDiagnosis(diagnosisId))!
  }

  async findByDiagnosis(diagnosisId: string): Promise<RecommendationRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM recommendations WHERE diagnosis_id = ?1 ORDER BY created_at DESC LIMIT 1')
      .bind(diagnosisId)
      .first<RecommendationRow>()
    return row ?? null
  }
}
