// ============================================================================
// DEALER / LAB VIEW ROUTES — GET /dealer
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { DealerPage } from '@frontend/pages/dealer'

export const dealerRoute = new Hono<{ Bindings: Bindings }>()

dealerRoute.get('/dealer', (c) => c.render(<DealerPage />))
