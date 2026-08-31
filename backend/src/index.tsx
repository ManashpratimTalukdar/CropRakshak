import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from '@frontend/components/Layout'
import type { Bindings } from './lib/types'
import { pagesRoute } from './routes/pages'
import { diagnosisRoute } from './routes/diagnosis'
import { actionRoute } from './routes/action'
import { scanApiRoute } from './routes/scan'
import { seedRoute } from './routes/seed'
import { adminRoute } from './routes/admin'
import { dealerRoute } from './routes/dealer'

const app = new Hono<{ Bindings: Bindings }>()

// Static assets now live under frontend/public/static (copied verbatim into
// the build output by Vite's publicDir — see vite.config.ts).
app.use('/static/*', serveStatic({ root: './frontend/public' }))
app.use(renderer)

app.route('/', pagesRoute)
app.route('/', diagnosisRoute)
app.route('/', actionRoute)
app.route('/', scanApiRoute)
app.route('/', seedRoute)
app.route('/', adminRoute)
app.route('/', dealerRoute)

export default app
