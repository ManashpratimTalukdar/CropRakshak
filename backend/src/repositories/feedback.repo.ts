// ============================================================================
// FEEDBACK & EXPERT REVIEWS REPOSITORIES (Sections 21/22/37/65)
// ============================================================================

import { newId, nowIso, fromBool } from '../utils/db'

export interface FeedbackRow {
  id: string
  diagnosis_id: string
  user_id: string | null
  helpful: number | null
  expert_confirmed: string | null
  comment: string | null
  candidate_training_data: number
  created_at: string
}

export class FeedbackRepo {
  constructor(private db: D1Database) {}

  async create(input: { diagnosisId: string; userId?: string; helpful?: boolean; expertConfirmed?: 'yes' | 'no' | 'not_yet'; comment?: string }): Promise<FeedbackRow> {
    const id = newId('fb')
    await this.db
      .prepare(
        `INSERT INTO feedback (id, diagnosis_id, user_id, helpful, expert_confirmed, comment, candidate_training_data, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,1,?7)`
      )
      .bind(id, input.diagnosisId, input.userId ?? null, input.helpful === undefined ? null : fromBool(input.helpful), input.expertConfirmed ?? null, input.comment ?? null, nowIso())
      .run()
    const row = await this.db.prepare('SELECT * FROM feedback WHERE id = ?1').bind(id).first<FeedbackRow>()
    return row!
  }

  async listByDiagnosis(diagnosisId: string): Promise<FeedbackRow[]> {
    const res = await this.db.prepare('SELECT * FROM feedback WHERE diagnosis_id = ?1 ORDER BY created_at DESC').bind(diagnosisId).all<FeedbackRow>()
    return res.results ?? []
  }

  /** Section 65 — candidate training data pending validation, never auto-applied. */
  async listCandidateTrainingData(limit = 100): Promise<FeedbackRow[]> {
    const res = await this.db
      .prepare('SELECT * FROM feedback WHERE candidate_training_data = 1 ORDER BY created_at DESC LIMIT ?1')
      .bind(limit)
      .all<FeedbackRow>()
    return res.results ?? []
  }
}

export interface ExpertReviewRow {
  id: string
  diagnosis_id: string
  expert_id: string | null
  decision: string
  corrected_cause: string | null
  notes: string | null
  created_at: string
}

export class ExpertReviewsRepo {
  constructor(private db: D1Database) {}

  async create(input: { diagnosisId: string; expertId?: string; decision: string; correctedCause?: string; notes?: string }): Promise<ExpertReviewRow> {
    const id = newId('rev')
    await this.db
      .prepare('INSERT INTO expert_reviews (id, diagnosis_id, expert_id, decision, corrected_cause, notes, created_at) VALUES (?1,?2,?3,?4,?5,?6,?7)')
      .bind(id, input.diagnosisId, input.expertId ?? null, input.decision, input.correctedCause ?? null, input.notes ?? null, nowIso())
      .run()
    const row = await this.db.prepare('SELECT * FROM expert_reviews WHERE id = ?1').bind(id).first<ExpertReviewRow>()
    return row!
  }

  async listByDiagnosis(diagnosisId: string): Promise<ExpertReviewRow[]> {
    const res = await this.db.prepare('SELECT * FROM expert_reviews WHERE diagnosis_id = ?1 ORDER BY created_at DESC').bind(diagnosisId).all<ExpertReviewRow>()
    return res.results ?? []
  }
}
