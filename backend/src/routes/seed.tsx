// ============================================================================
// SEED VERIFICATION ROUTES — GET /seed
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { SeedPage } from '@frontend/pages/seed'

export const seedRoute = new Hono<{ Bindings: Bindings }>()

seedRoute.get('/seed', (c) => {
  const batch = c.req.query('batch')?.trim().toUpperCase()
  return c.render(<SeedPage batchCode={batch} />)
})
