// ============================================================================
// DB UTILITIES — small helpers shared by all repositories.
// ============================================================================

/** Generates a UUID v4 using the Web Crypto API (available in Workers runtime). */
export function newId(prefix?: string): string {
  const id = crypto.randomUUID()
  return prefix ? `${prefix}_${id}` : id
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** Safe JSON stringify for storing structured data in TEXT columns. */
export function toJson(value: unknown): string {
  return JSON.stringify(value ?? null)
}

/** Safe JSON parse with a fallback for empty/invalid text columns. */
export function fromJson<T>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

export function toBool(v: number | null | undefined): boolean {
  return v === 1
}

export function fromBool(v: boolean | undefined): number {
  return v ? 1 : 0
}
