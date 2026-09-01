// ============================================================================
// FOLLOW-UPS REPOSITORY (Section 19/20 — Monitor, Follow-up & Re-scan)
// ============================================================================

import { newId, nowIso, toJson, fromJson } from '../utils/db'

export interface FollowupRow {
  id: string
  diagnosis_id: string
  rescan_after_days: number
  due_at: string
  monitor_notes_json: string | null
  escalate_when: string | null
  status: string
  rescan_diagnosis_id: string | null
  completed_at: string | null
  created_at: string
}

export class FollowupsRepo {
  constructor(private db: D1Database) {}

  async create(diagnosisId: string, rescanAfterDays: number, monitorNotes: string[], escalateWhen: string): Promise<FollowupRow> {
    const id = newId('fu')
    const due = new Date(Date.now() + rescanAfterDays * 86400000).toISOString()
    await this.db
      .prepare(
        `INSERT INTO followups (id, diagnosis_id, rescan_after_days, due_at, monitor_notes_json, escalate_when, status, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,'Pending',?7)`
      )
      .bind(id, diagnosisId, rescanAfterDays, due, toJson(monitorNotes), escalateWhen, nowIso())
      .run()
    return (await this.findById(id))!
  }

  async findById(id: string): Promise<FollowupRow | null> {
    const row = await this.db.prepare('SELECT * FROM followups WHERE id = ?1').bind(id).first<FollowupRow>()
    return row ?? null
  }

  async findByDiagnosis(diagnosisId: string): Promise<FollowupRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM followups WHERE diagnosis_id = ?1 ORDER BY created_at DESC LIMIT 1')
      .bind(diagnosisId)
      .first<FollowupRow>()
    return row ?? null
  }

  async listPendingByUser(userId: string): Promise<(FollowupRow & { crop_name: string; crop_emoji: string })[]> {
    const res = await this.db
      .prepare(
        `SELECT f.*, d.crop_name, d.crop_emoji FROM followups f
         JOIN diagnoses d ON d.id = f.diagnosis_id
         WHERE d.user_id = ?1 AND f.status = 'Pending'
         ORDER BY f.due_at ASC`
      )
      .bind(userId)
      .all<FollowupRow & { crop_name: string; crop_emoji: string }>()
    return res.results ?? []
  }

  async complete(id: string, rescanDiagnosisId: string): Promise<void> {
    await this.db
      .prepare("UPDATE followups SET status = 'Completed', rescan_diagnosis_id = ?1, completed_at = ?2 WHERE id = ?3")
      .bind(rescanDiagnosisId, nowIso(), id)
      .run()
  }
}
