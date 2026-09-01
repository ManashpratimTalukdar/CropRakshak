// ============================================================================
// AUTH MIDDLEWARE — reads the Bearer JWT (or `crm_token` cookie for
// browser-rendered pages), verifies it, and attaches AuthUser to context.
// requireAuth() / requireRole() guard API routes (Section 58 — RBAC).
// ============================================================================

import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import type { Bindings, AppVariables, Role } from '../lib/types'
import { verifyToken } from '../utils/auth'

const DEV_SECRET_FALLBACK = 'crop-rakshak-dev-secret-not-for-production'

export function getJwtSecret(env: Bindings): string {
  return env.JWT_SECRET || DEV_SECRET_FALLBACK
}

/** Attaches c.get('user') if a valid token is present; does NOT reject if absent. */
export async function attachUser(c: Context<{ Bindings: Bindings; Variables: AppVariables }>, next: Next) {
  const header = c.req.header('Authorization')
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined
  const cookieToken = getCookie(c, 'crm_token')
  const token = bearer || cookieToken

  if (token) {
    const user = await verifyToken(token, getJwtSecret(c.env))
    if (user) c.set('user', user)
  }
  await next()
}

/** Rejects with 401 if no valid user is attached. */
export async function requireAuth(c: Context<{ Bindings: Bindings; Variables: AppVariables }>, next: Next) {
  const user = c.get('user')
  if (!user) return c.json({ error: 'Authentication required.' }, 401)
  await next()
}

/** Rejects with 403 unless the authenticated user has one of the allowed roles. */
export function requireRole(...roles: Role[]) {
  return async (c: Context<{ Bindings: Bindings; Variables: AppVariables }>, next: Next) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Authentication required.' }, 401)
    if (!roles.includes(user.role)) return c.json({ error: 'You do not have permission to access this resource.' }, 403)
    await next()
  }
}
