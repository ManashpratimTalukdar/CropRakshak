// ============================================================================
// USERS REPOSITORY
// ============================================================================

import type { Role } from '../lib/types'
import { newId, nowIso } from '../utils/db'

export interface UserRow {
  id: string
  name: string
  phone: string | null
  email: string | null
  password_hash: string
  role: Role
  village: string | null
  district: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  language: string
  avatar_emoji: string
  created_at: string
  updated_at: string
}

export class UsersRepo {
  constructor(private db: D1Database) {}

  async findByEmailOrPhone(identifier: string): Promise<UserRow | null> {
    const row = await this.db
      .prepare('SELECT * FROM users WHERE email = ?1 OR phone = ?1 LIMIT 1')
      .bind(identifier)
      .first<UserRow>()
    return row ?? null
  }

  async findById(id: string): Promise<UserRow | null> {
    const row = await this.db.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first<UserRow>()
    return row ?? null
  }

  async create(input: {
    name: string
    phone?: string
    email?: string
    passwordHash: string
    role: Role
    village?: string
    district?: string
    state?: string
    avatarEmoji?: string
  }): Promise<UserRow> {
    const id = newId('usr')
    const now = nowIso()
    await this.db
      .prepare(
        `INSERT INTO users (id, name, phone, email, password_hash, role, village, district, state, avatar_emoji, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?11)`
      )
      .bind(
        id,
        input.name,
        input.phone ?? null,
        input.email ?? null,
        input.passwordHash,
        input.role,
        input.village ?? null,
        input.district ?? null,
        input.state ?? null,
        input.avatarEmoji ?? '🧑\u200d🌾',
        now
      )
      .run()
    return (await this.findById(id))!
  }

  async listByRole(role: Role): Promise<UserRow[]> {
    const res = await this.db.prepare('SELECT * FROM users WHERE role = ?1 ORDER BY created_at DESC').bind(role).all<UserRow>()
    return res.results ?? []
  }
}
