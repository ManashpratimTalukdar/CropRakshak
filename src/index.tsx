import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'
import { HomePage } from './pages/home'
import { ScanPage } from './pages/scan'
import { AnalysisPage } from './pages/analysis'
import { DiagnosisPage } from './pages/diagnosis'
import { ActionPage } from './pages/action'
import { DashboardPage } from './pages/dashboard'
import { SeedPage } from './pages/seed'
import { AdminPage } from './pages/admin'
import { DealerPage } from './pages/dealer'
import { CASES } from './lib/data'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './public' }))
app.use(renderer)

app.get('/', (c) => c.render(<HomePage />))

app.get('/scan', (c) => c.render(<ScanPage />))

app.get('/analysis/:caseId?', (c) => {
  const caseId = c.req.param('caseId') || 'wheat-rust'
  return c.render(<AnalysisPage caseId={caseId} />)
})

app.get('/diagnosis/:caseId', (c) => {
  const caseId = c.req.param('caseId')
  const found = CASES[caseId] || CASES['wheat-rust']
  return c.render(<DiagnosisPage c={found} />)
})

app.get('/action/:caseId', (c) => {
  const caseId = c.req.param('caseId')
  const found = CASES[caseId] || CASES['wheat-rust']
  return c.render(<ActionPage c={found} />)
})

app.get('/dashboard', (c) => c.render(<DashboardPage />))

app.get('/seed', (c) => {
  const batch = c.req.query('batch')?.trim().toUpperCase()
  return c.render(<SeedPage batchCode={batch} />)
})

app.get('/admin', (c) => c.render(<AdminPage />))

app.get('/dealer', (c) => c.render(<DealerPage />))

export default app
