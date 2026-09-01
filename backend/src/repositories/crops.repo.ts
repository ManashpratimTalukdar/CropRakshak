// ============================================================================
// CROPS REPOSITORY — "My Crops" (Section 41/42)
// ============================================================================

import { newId, nowIso } from '../utils/db'

export interface CropRow {
  id: string
  user_id: string
  crop_name: string
  crop_emoji: string
  variety: string | null
  sowing_date: string | null
  crop_stage: string | null
  field_size_acres: number | null
  village: string | null
  district: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  health_status: string
  last_scan_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateCropInput {
  userId: string
  cropName: string
  cropEmoji?: string
  variety?: string
  sowingDate?: string
  cropStage?: string
  fieldSizeAcres?: number
  village?: string
  district?: string
  state?: string
  latitude?: number
  longitude?: number
}

export class CropsRepo {
  constructor(private db: D1Database) {}

  async create(input: CreateCropInput): Promise<CropRow> {
    const id = newId('crop')
    const now = nowIso()
    await this.db
      .prepare(
        `INSERT INTO crops (id, user_id, crop_name, crop_emoji, variety, sowing_date, crop_stage, field_size_acres, village, district, state, latitude, longitude, health_status, created_at, updated_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,'Unknown',?14,?14)`
      )
      .bind(
        id,
        input.userId,
        input.cropName,
        input.cropEmoji ?? '🌱',
        input.variety ?? null,
        input.sowingDate ?? null,
        input.cropStage ?? null,
        input.fieldSizeAcres ?? null,
        input.village ?? null,
        input.district ?? null,
        input.state ?? null,
        input.latitude ?? null,
        input.longitude ?? null,
        now
      )
      .run()
    return (await this.findById(id))!
  }

  async findById(id: string): Promise<CropRow | null> {
    const row = await this.db.prepare('SELECT * FROM crops WHERE id = ?1').bind(id).first<CropRow>()
    return row ?? null
  }

  async listByUser(userId: string): Promise<CropRow[]> {
    const res = await this.db.prepare('SELECT * FROM crops WHERE user_id = ?1 ORDER BY updated_at DESC').bind(userId).all<CropRow>()
    return res.results ?? []
  }

  async update(id: string, patch: Partial<CreateCropInput>): Promise<void> {
    const fields: string[] = []
    const values: any[] = []
    const map: Record<string, string> = {
      cropName: 'crop_name',
      cropEmoji: 'crop_emoji',
      variety: 'variety',
      sowingDate: 'sowing_date',
      cropStage: 'crop_stage',
      fieldSizeAcres: 'field_size_acres',
      village: 'village',
      district: 'district',
      state: 'state',
      latitude: 'latitude',
      longitude: 'longitude',
    }
    for (const [k, col] of Object.entries(map)) {
      if ((patch as any)[k] !== undefined) {
        fields.push(`${col} = ?${fields.length + 1}`)
        values.push((patch as any)[k])
      }
    }
    if (fields.length === 0) return
    fields.push(`updated_at = ?${fields.length + 1}`)
    values.push(nowIso())
    values.push(id)
    await this.db.prepare(`UPDATE crops SET ${fields.join(', ')} WHERE id = ?${fields.length + 1}`).bind(...values).run()
  }

  async touchLastScan(id: string, healthStatus: string): Promise<void> {
    await this.db
      .prepare('UPDATE crops SET last_scan_at = ?1, health_status = ?2, updated_at = ?1 WHERE id = ?3')
      .bind(nowIso(), healthStatus, id)
      .run()
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.db.prepare('DELETE FROM crops WHERE id = ?1 AND user_id = ?2').bind(id, userId).run()
  }
}
