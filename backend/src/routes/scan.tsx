// ============================================================================
// POST /api/scan — real image-classification inference for the /scan flow.
//
// Accepts a multipart form with the crop photo + optional context fields,
// runs it through Cloudflare Workers AI (a real vision-language model — see
// backend/src/services/ai.ts), builds a full DiagnosisCase from the result,
// and returns its caseId so the client can redirect to the normal
// /analysis/:caseId -> /diagnosis/:caseId flow, unchanged from the demo path.
// ============================================================================

import { Hono } from 'hono'
import type { Bindings } from '../lib/types'
import { buildCaseFromAssessment } from '../lib/data'
import { classifyCropImage, fileToDataUrl } from '../services/ai'

export const scanApiRoute = new Hono<{ Bindings: Bindings }>()

scanApiRoute.post('/api/scan', async (c) => {
  try {
    const form = await c.req.formData()
    const photo = form.get('photo')
    const cropName = String(form.get('cropName') || 'Unspecified crop')
    const cropEmoji = String(form.get('cropEmoji') || '🌿')
    const variety = form.get('variety') ? String(form.get('variety')) : undefined
    const stage = form.get('stage') ? String(form.get('stage')) : undefined
    const fieldSizeAcres = form.get('fieldSizeAcres') ? Number(form.get('fieldSizeAcres')) : undefined
    const village = form.get('village') ? String(form.get('village')) : undefined
    const notes = form.get('notes') ? String(form.get('notes')) : ''

    if (!photo || !(photo instanceof Blob) || photo.size === 0) {
      return c.json({ error: 'A crop photo is required for analysis.' }, 400)
    }
    // Basic guardrails: reject absurdly large uploads and non-image types.
    const MAX_BYTES = 8 * 1024 * 1024
    if (photo.size > MAX_BYTES) {
      return c.json({ error: 'Photo is too large (max 8 MB). Please use a smaller image.' }, 400)
    }
    const mime = (photo as File).type || 'image/jpeg'
    if (!mime.startsWith('image/')) {
      return c.json({ error: 'Uploaded file must be an image.' }, 400)
    }

    const dataUrl = await fileToDataUrl(photo, mime)
    const contextNote = notes ? `Farmer-provided notes: ${notes}` : 'No additional notes provided.'

    const result = await classifyCropImage(c.env.AI, dataUrl, cropName, contextNote)

    const now = new Date()
    const caseId = `live-${now.getTime().toString(36)}`
    const scanId = `SCN-${now.getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`

    const toAssessment = (a: typeof result.disease) => ({
      cause: a.cause,
      scientificName: a.scientific_name,
      confidence: a.confidence,
      severity: a.severity,
      riskLevel: a.risk_level,
      alternatives: a.alternatives,
    })

    const diagnosisCase = buildCaseFromAssessment({
      id: caseId,
      scanId,
      cropName,
      cropEmoji,
      variety,
      stage,
      village,
      date: now.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      fieldSizeAcres,
      primaryType: result.primary_type,
      overallConfidence: result.overall_confidence,
      disease: toAssessment(result.disease),
      pest: toAssessment(result.pest),
      abiotic: toAssessment(result.abiotic),
    })

    return c.json({
      caseId: diagnosisCase.id,
      summary: result.summary,
      source: result.source,
      modelUsed: result.modelUsed,
      warning: result.source === 'heuristic-fallback' ? result.error : undefined,
    })
  } catch (err: any) {
    return c.json({ error: `Scan failed: ${err?.message || 'unknown error'}` }, 500)
  }
})
