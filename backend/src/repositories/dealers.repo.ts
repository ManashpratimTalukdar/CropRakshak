// ============================================================================
// DEALERS / LABS / REFERRALS REPOSITORIES (Sections 16-18/33)
// ============================================================================

import { newId, nowIso } from '../utils/db'

export interface DealerRow {
  id: string
  name: string
  category: string
  village: string | null
  district: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  verified: number
  rating: number
  is_demo: number
  created_at: string
}

export class DealersRepo {
  constructor(private db: D1Database) {}

  async listAll(): Promise<DealerRow[]> {
    const res = await this.db.prepare('SELECT * FROM dealers ORDER BY rating DESC').all<DealerRow>()
    return res.results ?? []
  }

  async listNearDistrict(district?: string): Promise<DealerRow[]> {
    if (!district) return this.listAll()
    const res = await this.db.prepare('SELECT * FROM dealers WHERE district = ?1 ORDER BY rating DESC').bind(district).all<DealerRow>()
    const results = res.results ?? []
    return results.length > 0 ? results : this.listAll()
  }
}

export interface LabRow {
  id: string
  name: string
  lab_type: string
  village: string | null
  district: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  verified: number
  rating: number
  is_demo: number
  created_at: string
}

export class LabsRepo {
  constructor(private db: D1Database) {}

  async listAll(): Promise<LabRow[]> {
    const res = await this.db.prepare('SELECT * FROM labs ORDER BY rating DESC').all<LabRow>()
    return res.results ?? []
  }
}

export interface ReferralRow {
  id: string
  diagnosis_id: string
  dealer_id: string | null
  requested_item: string | null
  status: string
  created_at: string
}

export class ReferralsRepo {
  constructor(private db: D1Database) {}

  async create(input: { diagnosisId: string; dealerId?: string; requestedItem?: string }): Promise<ReferralRow> {
    const id = newId('ref')
    await this.db
      .prepare("INSERT INTO referrals (id, diagnosis_id, dealer_id, requested_item, status, created_at) VALUES (?1,?2,?3,?4,'New',?5)")
      .bind(id, input.diagnosisId, input.dealerId ?? null, input.requestedItem ?? null, nowIso())
      .run()
    const row = await this.db.prepare('SELECT * FROM referrals WHERE id = ?1').bind(id).first<ReferralRow>()
    return row!
  }

  async listAll(): Promise<
    (ReferralRow & { farmer_name: string | null; crop_name: string; crop_emoji: string; primary_cause: string; village: string | null; dealer_name: string | null })[]
  > {
    const res = await this.db
      .prepare(
        `SELECT r.*, u.name as farmer_name, d.crop_name, d.crop_emoji, d.primary_cause, d.village, de.name as dealer_name
         FROM referrals r
         JOIN diagnoses d ON d.id = r.diagnosis_id
         LEFT JOIN users u ON u.id = d.user_id
         LEFT JOIN dealers de ON de.id = r.dealer_id
         ORDER BY r.created_at DESC`
      )
      .all()
    return (res.results ?? []) as any
  }

  async updateStatus(id: string, status: 'New' | 'Contacted' | 'Fulfilled'): Promise<void> {
    await this.db.prepare('UPDATE referrals SET status = ?1 WHERE id = ?2').bind(status, id).run()
  }
}
