// ============================================================================
// ALERTS REPOSITORY (Section 44 — personal, regional, weather, follow-up, seed)
// ============================================================================

import { newId, nowIso } from '../utils/db'

export interface AlertRow {
  id: string
  user_id: string | null
  alert_type: string
  severity: string
  title: string
  message: string
  ref_diagnosis_id: string | null
  ref_seed_id: string | null
  is_read: number
  created_at: string
}

export class AlertsRepo {
  constructor(private db: D1Database) {}

  async create(input: {
    userId?: string
    alertType: 'risk' | 'weather' | 'followup' | 'seed' | 'regional' | 'system'
    severity: 'WATCH' | 'ADVISORY' | 'HIGH RISK' | 'CRITICAL'
    title: string
    message: string
    refDiagnosisId?: string
    refSeedId?: string
  }): Promise<AlertRow> {
    const id = newId('alert')
    await this.db
      .prepare(
        `INSERT INTO alerts (id, user_id, alert_type, severity, title, message, ref_diagnosis_id, ref_seed_id, is_read, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,0,?9)`
      )
      .bind(id, input.userId ?? null, input.alertType, input.severity, input.title, input.message, input.refDiagnosisId ?? null, input.refSeedId ?? null, nowIso())
      .run()
    const row = await this.db.prepare('SELECT * FROM alerts WHERE id = ?1').bind(id).first<AlertRow>()
    return row!
  }

  async listForUser(userId: string, limit = 50): Promise<AlertRow[]> {
    const res = await this.db
      .prepare('SELECT * FROM alerts WHERE user_id = ?1 OR user_id IS NULL ORDER BY created_at DESC LIMIT ?2')
      .bind(userId, limit)
      .all<AlertRow>()
    return res.results ?? []
  }

  async markRead(id: string): Promise<void> {
    await this.db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?1').bind(id).run()
  }
}
