// ============================================================================
// REGIONAL REPORTS REPOSITORY (Sections 29/30 — Early Warning & Hotspot Map)
// ============================================================================

import { newId, nowIso, fromBool } from '../utils/db'

export interface RegionalReportRow {
  id: string
  diagnosis_id: string | null
  crop_name: string
  issue_name: string
  issue_type: string
  district: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  risk_level: string
  is_demo: number
  reported_at: string
}

export interface HotspotAggregate {
  district: string
  crop_name: string
  issue_name: string
  risk_level: string
  cases: number
  latitude: number | null
  longitude: number | null
  last_reported: string
}

export class RegionalReportsRepo {
  constructor(private db: D1Database) {}

  async create(input: {
    diagnosisId?: string
    cropName: string
    issueName: string
    issueType: 'disease' | 'pest' | 'abiotic'
    district?: string
    state?: string
    latitude?: number
    longitude?: number
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
    isDemo?: boolean
  }): Promise<RegionalReportRow> {
    const id = newId('reg')
    await this.db
      .prepare(
        `INSERT INTO regional_reports (id, diagnosis_id, crop_name, issue_name, issue_type, district, state, latitude, longitude, risk_level, is_demo, reported_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12)`
      )
      .bind(
        id,
        input.diagnosisId ?? null,
        input.cropName,
        input.issueName,
        input.issueType,
        input.district ?? null,
        input.state ?? null,
        input.latitude ?? null,
        input.longitude ?? null,
        input.riskLevel,
        fromBool(input.isDemo ?? false),
        nowIso()
      )
      .run()
    const row = await this.db.prepare('SELECT * FROM regional_reports WHERE id = ?1').bind(id).first<RegionalReportRow>()
    return row!
  }

  /** Section 30 — hotspot map aggregation: groups by district+crop+issue, counts reports. */
  async aggregateHotspots(): Promise<HotspotAggregate[]> {
    const res = await this.db
      .prepare(
        `SELECT district, crop_name, issue_name,
                MAX(risk_level) as risk_level,
                COUNT(*) as cases,
                AVG(latitude) as latitude, AVG(longitude) as longitude,
                MAX(reported_at) as last_reported
         FROM regional_reports
         WHERE district IS NOT NULL
         GROUP BY district, crop_name, issue_name
         ORDER BY cases DESC`
      )
      .all<HotspotAggregate>()
    return res.results ?? []
  }

  async countNearby(district: string, cropName: string, days = 30): Promise<number> {
    const since = new Date(Date.now() - days * 86400000).toISOString()
    const row = await this.db
      .prepare('SELECT COUNT(*) as n FROM regional_reports WHERE district = ?1 AND crop_name = ?2 AND reported_at >= ?3')
      .bind(district, cropName, since)
      .first<{ n: number }>()
    return row?.n ?? 0
  }
}
