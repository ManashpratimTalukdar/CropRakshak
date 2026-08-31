// ============================================================================
// ACTION / RECOMMENDATION ROUTES — GET /action/:caseId
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { CASES, getCase } from '../lib/data'
import { ActionPage } from '@frontend/pages/action'

export const actionRoute = new Hono<{ Bindings: Bindings }>()

actionRoute.get('/action/:caseId', (c) => {
  const caseId = c.req.param('caseId')
  const found = getCase(caseId) || CASES['wheat-rust']
  return c.render(<ActionPage c={found} />)
})
