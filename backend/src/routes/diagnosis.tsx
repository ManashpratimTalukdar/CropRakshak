// ============================================================================
// DIAGNOSIS ROUTES — GET /diagnosis/:caseId
//
// Reads the persisted diagnosis + risk assessment + recommendations +
// follow-up plan from D1, adapts them into the ViewDiagnosisCase shape the
// (unchanged) DiagnosisPage component expects, and renders it.
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { DiagnosesRepo, RiskAssessmentsRepo, RecommendationsRepo } from '../repositories/diagnoses.repo'
import { FollowupsRepo } from '../repositories/followups.repo'
import { DealersRepo } from '../repositories/dealers.repo'
import { RegionalReportsRepo } from '../repositories/regional.repo'
import { getWeatherSnapshot } from '../services/weather'
import { buildViewDiagnosisCase } from '../lib/view-adapter'
import { DiagnosisPage } from '@frontend/pages/diagnosis'

export const diagnosisRoute = new Hono<{ Bindings: Bindings }>()

diagnosisRoute.get('/diagnosis/:caseId', async (c) => {
  const caseId = c.req.param('caseId')
  const diagnosesRepo = new DiagnosesRepo(c.env.DB)
  const row = await diagnosesRepo.findById(caseId)

  if (!row) {
    return c.render(
      <main class="max-w-2xl mx-auto px-4 py-16 text-center">
        <i class="fa-solid fa-file-circle-question text-4xl text-gray-300 mb-4"></i>
        <h1 class="text-xl font-bold text-gray-800">Diagnosis not found</h1>
        <p class="text-gray-500 mt-2">This case may not exist yet — try running a new scan.</p>
        <a href="/scan" class="btn-primary inline-flex items-center gap-2 mt-6"><i class="fa-solid fa-camera"></i> Scan a crop</a>
      </main>
    )
  }

  const [risk, reco, followup, dealers] = await Promise.all([
    new RiskAssessmentsRepo(c.env.DB).findByDiagnosis(caseId),
    new RecommendationsRepo(c.env.DB).findByDiagnosis(caseId),
    new FollowupsRepo(c.env.DB).findByDiagnosis(caseId),
    new DealersRepo(c.env.DB).listNearDistrict(row.district || undefined),
  ])

  const weather = await getWeatherSnapshot(c.env, row.latitude ?? undefined, row.longitude ?? undefined)
  const nearbyReports = row.district ? await new RegionalReportsRepo(c.env.DB).countNearby(row.district, row.crop_name) : 0

  const viewCase = buildViewDiagnosisCase(
    row,
    risk,
    reco,
    followup,
    weather,
    {
      hotspotStatus: nearbyReports >= 8 ? 'Outbreak Alert' : nearbyReports >= 4 ? 'Elevated Activity' : nearbyReports >= 1 ? 'Watch' : 'Low Activity',
      nearbyReports,
      radiusKm: 15,
      dominantIssue: row.primary_cause,
      advisory: nearbyReports > 0
        ? `${nearbyReports} nearby report(s) for ${row.crop_name} within the district over the last 30 days — Prototype/Demonstration Data.`
        : `No recent nearby reports on file for ${row.crop_name} in this district.`,
    },
    dealers
  )

  return c.render(<DiagnosisPage c={viewCase} />)
})
