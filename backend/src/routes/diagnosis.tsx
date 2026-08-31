// ============================================================================
// DIAGNOSIS ROUTES — GET /diagnosis/:caseId
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { CASES, getCase } from '../lib/data'
import { DiagnosisPage } from '@frontend/pages/diagnosis'

export const diagnosisRoute = new Hono<{ Bindings: Bindings }>()

diagnosisRoute.get('/diagnosis/:caseId', (c) => {
  const caseId = c.req.param('caseId')
  const found = getCase(caseId) || CASES['wheat-rust']
  return c.render(<DiagnosisPage c={found} />)
})
