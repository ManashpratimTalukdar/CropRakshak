// ============================================================================
// SHARED BACKEND TYPES
// ============================================================================

export type Bindings = {
  AI?: Ai
  DB: D1Database
  JWT_SECRET?: string
  DEMO_MODE?: string
  WEATHER_API_KEY?: string
}

export type Role = 'farmer' | 'expert' | 'admin' | 'dealer'

export interface AuthUser {
  sub: string // user id
  role: Role
  name: string
  village?: string
  district?: string
}

// Variables set on the Hono context by middleware/auth.ts
export type AppVariables = {
  user?: AuthUser
}
