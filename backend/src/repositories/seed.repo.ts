// ============================================================================
// SEED VERIFICATION & QUALITY ASSURANCE REPOSITORIES (Sections 23-28)
// ============================================================================

import { newId, nowIso, toJson, fromBool } from '../utils/db'

export interface SeedRecordRow {
  id: string
  user_id: string | null
  crop_name: string
  variety: string | null
  batch_number: string
  seed_source: string | null
  supplier: string | null
  certification_no: string | null
  purchase_date: string | null
  packet_image_url: string | null
  certificate_image_url: string | null
  invoice_image_url: string | null
  created_at: string
}

export class SeedRecordsRepo {
  constructor(private db: D1Database) {}

  async create(input: {
    userId?: string
    cropName: string
    variety?: string
    batchNumber: string
    seedSource?: string
    supplier?: string
    certificationNo?: string
    purchaseDate?: string
    packetImageUrl?: string
    certificateImageUrl?: string
    invoiceImageUrl?: string
  }): Promise<SeedRecordRow> {
    const id = newId('seed')
    await this.db
      .prepare(
        `INSERT INTO seed_records (id, user_id, crop_name, variety, batch_number, seed_source, supplier, certification_no, purchase_date, packet_image_url, certificate_image_url, invoice_image_url, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)`
      )
      .bind(
        id,
        input.userId ?? null,
        input.cropName,
        input.variety ?? null,
        input.batchNumber,
        input.seedSource ?? null,
        input.supplier ?? null,
        input.certificationNo ?? null,
        input.purchaseDate ?? null,
        input.packetImageUrl ?? null,
        input.certificateImageUrl ?? null,
        input.invoiceImageUrl ?? null,
        nowIso()
      )
      .run()
    return (await this.findById(id))!
  }

  async findById(id: string): Promise<SeedRecordRow | null> {
    const row = await this.db.prepare('SELECT * FROM seed_records WHERE id = ?1').bind(id).first<SeedRecordRow>()
    return row ?? null
  }

  async findByBatch(batchNumber: string): Promise<SeedRecordRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM seed_records WHERE UPPER(batch_number) = UPPER(?1) ORDER BY created_at DESC LIMIT 1')
      .bind(batchNumber)
      .first<SeedRecordRow>()
    return row ?? null
  }

  async listByUser(userId: string): Promise<SeedRecordRow[]> {
    const res = await this.db.prepare('SELECT * FROM seed_records WHERE user_id = ?1 ORDER BY created_at DESC').bind(userId).all<SeedRecordRow>()
    return res.results ?? []
  }
}

export interface SeedVerificationRow {
  id: string
  seed_record_id: string
  status: string
  authenticity: string
  authenticity_score: number
  evidence_json: string | null
  is_demo: number
  created_at: string
}

export class SeedVerificationsRepo {
  constructor(private db: D1Database) {}

  async create(input: {
    seedRecordId: string
    status: 'VERIFIED' | 'PARTIALLY VERIFIED' | 'UNVERIFIED' | 'SUSPICIOUS'
    authenticity: 'Trusted' | 'Needs Verification' | 'Not Trusted'
    authenticityScore: number
    evidence: Record<string, boolean>
    isDemo?: boolean
  }): Promise<SeedVerificationRow> {
    const id = newId('sv')
    await this.db
      .prepare(
        `INSERT INTO seed_verifications (id, seed_record_id, status, authenticity, authenticity_score, evidence_json, is_demo, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8)`
      )
      .bind(id, input.seedRecordId, input.status, input.authenticity, input.authenticityScore, toJson(input.evidence), fromBool(input.isDemo ?? true), nowIso())
      .run()
    return (await this.findByRecord(input.seedRecordId))!
  }

  async findByRecord(seedRecordId: string): Promise<SeedVerificationRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM seed_verifications WHERE seed_record_id = ?1 ORDER BY created_at DESC LIMIT 1')
      .bind(seedRecordId)
      .first<SeedVerificationRow>()
    return row ?? null
  }
}

export interface SeedQualityRow {
  id: string
  seed_record_id: string
  germination_pct: number | null
  purity_pct: number | null
  genetic_purity_pct: number | null
  seed_treatment: string | null
  lab_test_status: string | null
  quality_label: string | null
  created_at: string
}

export class SeedQualityRepo {
  constructor(private db: D1Database) {}

  async create(input: {
    seedRecordId: string
    germinationPct?: number
    purityPct?: number
    geneticPurityPct?: number
    seedTreatment?: string
    labTestStatus?: string
    qualityLabel: 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'UNKNOWN'
  }): Promise<SeedQualityRow> {
    const id = newId('sq')
    await this.db
      .prepare(
        `INSERT INTO seed_quality_assessments (id, seed_record_id, germination_pct, purity_pct, genetic_purity_pct, seed_treatment, lab_test_status, quality_label, created_at)
         VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9)`
      )
      .bind(id, input.seedRecordId, input.germinationPct ?? null, input.purityPct ?? null, input.geneticPurityPct ?? null, input.seedTreatment ?? null, input.labTestStatus ?? null, input.qualityLabel, nowIso())
      .run()
    return (await this.findByRecord(input.seedRecordId))!
  }

  async findByRecord(seedRecordId: string): Promise<SeedQualityRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM seed_quality_assessments WHERE seed_record_id = ?1 ORDER BY created_at DESC LIMIT 1')
      .bind(seedRecordId)
      .first<SeedQualityRow>()
    return row ?? null
  }
}
