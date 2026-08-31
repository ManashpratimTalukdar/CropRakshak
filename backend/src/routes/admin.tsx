// ============================================================================
// ADMIN / OFFICER VIEW ROUTES — GET /admin
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { AdminPage } from '@frontend/pages/admin'

export const adminRoute = new Hono<{ Bindings: Bindings }>()

adminRoute.get('/admin', (c) => c.render(<AdminPage />))
