// ============================================================================
// AUTH UTILITIES — password hashing (Web Crypto PBKDF2, no external deps —
// Workers runtime has no bcrypt/native bindings) + JWT sign/verify via Hono.
// Section 58: never store plaintext passwords, never hardcode secrets.
// ============================================================================

import { sign, verify } from 'hono/jwt'
import type { AuthUser } from '../lib/types'

const PBKDF2_ITERATIONS = 100_000

/** Hashes a password with PBKDF2-SHA256 + a random salt. Format: `pbkdf2$<iterations>$<saltHex>$<hashHex>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS)
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = parseInt(parts[1], 10)
  const salt = fromHex(parts[2])
  const expected = parts[3]
  const hash = await pbkdf2(password, salt, iterations)
  return toHex(hash) === expected
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, 256)
}

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  return bytes
}

const JWT_EXPIRY_SECONDS = 60 * 60 * 24 * 7 // 7 days

export async function signToken(user: AuthUser, secret: string): Promise<string> {
  const payload = { ...user, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRY_SECONDS }
  return sign(payload, secret)
}

export async function verifyToken(token: string, secret: string): Promise<AuthUser | null> {
  try {
    const payload = await verify(token, secret)
    return payload as unknown as AuthUser
  } catch {
    return null
  }
}
