// ============================================================================
// POST /api/scan — the P1 core scan endpoint.
//
// Accepts a multipart form with the crop photo + crop/field/soil/irrigation/
// treatment-history context (matching the 6-step /scan wizard), runs the full
// Evidence Fusion + Risk Engine + Recommendation Engine pipeline
// (backend/src/services/diagnosis-pipeline.ts), persists every stage to D1,
// and returns the new diagnosis id so the client redirects to the unchanged
// /analysis/:caseId -> /diagnosis/:caseId flow.
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { fileToDataUrl } from '@ai/index'
import { runDiagnosisPipeline } from '../services/diagnosis-pipeline'
import { attachUser } from '../middleware/auth'
import type { AppVariables } from '../lib/types'

export const scanApiRoute = new Hono<{ Bindings: Bindings; Variables: AppVariables }>()

scanApiRoute.post('/api/scan', attachUser, async (c) => {
  try {
    const form = await c.req.formData()
    const photo = form.get('photo')
    const cropName = String(form.get('cropName') || 'Unspecified crop')
    const cropEmoji = String(form.get('cropEmoji') || '🌿')
    const variety = form.get('variety') ? String(form.get('variety')) : undefined
    const stage = form.get('stage') ? String(form.get('stage')) : undefined
    const fieldSizeAcres = form.get('fieldSizeAcres') ? Number(form.get('fieldSizeAcres')) : undefined
    const locationRaw = form.get('village') ? String(form.get('village')) : undefined
    const notes = form.get('notes') ? String(form.get('notes')) : ''

    // The scan form's "Field location" field is free text ("Village, District") —
    // split it best-effort so district-scoped regional/hotspot lookups still work.
    let village: string | undefined
    let district: string | undefined
    if (locationRaw) {
      const parts = locationRaw.split(',').map((p) => p.trim()).filter(Boolean)
      village = parts[0]
      district = parts[1] || parts[0]
    }

    if (!photo || !(photo instanceof Blob) || photo.size === 0) {
      return c.json({ error: 'A crop photo is required for analysis.' }, 400)
    }
    const MAX_BYTES = 8 * 1024 * 1024
    if (photo.size > MAX_BYTES) {
      return c.json({ error: 'Photo is too large (max 8 MB). Please use a smaller image.' }, 400)
    }
    const mime = (photo as File).type || 'image/jpeg'
    if (!mime.startsWith('image/')) {
      return c.json({ error: 'Uploaded file must be an image.' }, 400)
    }

    const imageDataUrl = await fileToDataUrl(photo, mime)
    const contextNote = notes ? `Farmer-provided notes: ${notes}` : 'No additional notes provided.'
    const user = c.get('user')

    const { diagnosis, fused, risk } = await runDiagnosisPipeline(c.env, {
      userId: user?.sub,
      cropName,
      cropEmoji,
      variety,
      cropStage: stage,
      fieldSizeAcres,
      village,
      district,
      imageDataUrl,
      contextNote,
      treatmentHistory: notes ? { pastIssues: notes } : undefined,
      isDemo: c.env.DEMO_MODE !== 'false',
    })

    return c.json({
      caseId: diagnosis.id,
      summary: fused.uncertain
        ? fused.uncertaintyMessage
        : `${fused.primaryCause} (${fused.overallConfidence}% confidence, ${risk.riskLevel} risk).`,
      source: diagnosis.ai_source,
      modelUsed: diagnosis.ai_model_used,
      warning: diagnosis.ai_source === 'heuristic-fallback' ? 'Live AI model was unavailable — showed a conservative fallback instead.' : undefined,
    })
  } catch (err: any) {
    return c.json({ error: `Scan failed: ${err?.message || 'unknown error'}` }, 500)
  }
})
