// ============================================================================
// SIMPLE PAGE ROUTES — home, scan form, analysis (loading), dashboard.
// These render server-side JSX pages with no non-trivial request logic.
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { HomePage } from '@frontend/pages/home'
import { ScanPage } from '@frontend/pages/scan'
import { AnalysisPage } from '@frontend/pages/analysis'
import { DashboardPage } from '@frontend/pages/dashboard'

export const pagesRoute = new Hono<{ Bindings: Bindings }>()

pagesRoute.get('/', (c) => c.render(<HomePage />))

pagesRoute.get('/scan', (c) => c.render(<ScanPage />))

pagesRoute.get('/analysis/:caseId?', (c) => {
  const caseId = c.req.param('caseId') || 'wheat-rust'
  return c.render(<AnalysisPage caseId={caseId} />)
})

pagesRoute.get('/dashboard', (c) => c.render(<DashboardPage />))
