// ============================================================================
// LIVE IMAGE-CLASSIFICATION INFERENCE
// Wires the /scan photo submission to Cloudflare Workers AI (a real
// vision-language model), replacing the old fully-mocked analysis flow.
//
// Model: @cf/meta/llama-3.2-11b-vision-instruct (Meta, multimodal, runs on
// Cloudflare's edge GPUs). We ask it for a strict JSON object describing a
// disease / pest / abiotic three-way split, mirroring this app's data model
// (see src/lib/data.ts — CategoryAssessment / DiagnosisCase), so the rest of
// the site (diagnosis, action, dashboard, admin) needs no changes to render
// a real result the exact same way it renders the seeded demo cases.
//
// Graceful degradation: if the AI binding isn't present (e.g. local dev
// without `wrangler login`, or a transient model error), we fall back to a
// clearly-labeled heuristic classifier so the flow never breaks — but on a
// real Cloudflare deployment with the `ai` binding in wrangler.jsonc, this
// calls the live model with no extra configuration or secrets required.
// ============================================================================

import type { IssueType, Severity, RiskLevel } from './data'

export interface AiAssessmentRaw {
  type: IssueType
  cause: string
  scientific_name?: string
  confidence: number // 0-100
  severity: Severity
  risk_level: RiskLevel
  alternatives: string[]
}

export interface AiScanResult {
  primary_type: IssueType
  overall_confidence: number
  disease: AiAssessmentRaw
  pest: AiAssessmentRaw
  abiotic: AiAssessmentRaw
  summary: string
  source: 'workers-ai' | 'heuristic-fallback'
  modelUsed?: string
  error?: string
}

const MODEL = '@cf/meta/llama-3.2-11b-vision-instruct'

const RESPONSE_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'crop_health_assessment',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        primary_type: { type: 'string', enum: ['disease', 'pest', 'abiotic'] },
        overall_confidence: { type: 'integer', minimum: 0, maximum: 100 },
        summary: { type: 'string', description: 'One or two plain-language sentences a farmer can understand.' },
        disease: {
          type: 'object',
          properties: {
            cause: { type: 'string' },
            scientific_name: { type: 'string' },
            confidence: { type: 'integer', minimum: 0, maximum: 100 },
            severity: { type: 'string', enum: ['Mild', 'Moderate', 'Severe'] },
            risk_level: { type: 'string', enum: ['Low', 'Moderate', 'High', 'Critical'] },
            alternatives: { type: 'array', items: { type: 'string' } },
          },
          required: ['cause', 'confidence', 'severity', 'risk_level', 'alternatives'],
          additionalProperties: false,
        },
        pest: {
          type: 'object',
          properties: {
            cause: { type: 'string' },
            scientific_name: { type: 'string' },
            confidence: { type: 'integer', minimum: 0, maximum: 100 },
            severity: { type: 'string', enum: ['Mild', 'Moderate', 'Severe'] },
            risk_level: { type: 'string', enum: ['Low', 'Moderate', 'High', 'Critical'] },
            alternatives: { type: 'array', items: { type: 'string' } },
          },
          required: ['cause', 'confidence', 'severity', 'risk_level', 'alternatives'],
          additionalProperties: false,
        },
        abiotic: {
          type: 'object',
          properties: {
            cause: { type: 'string' },
            scientific_name: { type: 'string' },
            confidence: { type: 'integer', minimum: 0, maximum: 100 },
            severity: { type: 'string', enum: ['Mild', 'Moderate', 'Severe'] },
            risk_level: { type: 'string', enum: ['Low', 'Moderate', 'High', 'Critical'] },
            alternatives: { type: 'array', items: { type: 'string' } },
          },
          required: ['cause', 'confidence', 'severity', 'risk_level', 'alternatives'],
          additionalProperties: false,
        },
      },
      required: ['primary_type', 'overall_confidence', 'summary', 'disease', 'pest', 'abiotic'],
      additionalProperties: false,
    },
  },
}

const SYSTEM_PROMPT = `You are an expert agricultural plant pathologist and entomologist helping smallholder farmers in India diagnose crop problems from a single photo.

You must evaluate THREE separate hypotheses independently and never collapse them into one guess:
1. disease — fungal/bacterial/viral infection
2. pest — insect or mite damage
3. abiotic — nutrient deficiency, water stress, heat/cold stress, or other non-living cause

For each of the three, give your best specific finding even if the honest answer is "no significant sign of this" (use a low confidence in that case). Confidence must reflect real uncertainty — if the photo is blurry, poorly lit, too far away, or ambiguous, give LOW confidence (below 50) rather than guessing with false certainty. Never inflate confidence to sound helpful. Pick primary_type as whichever of the three has the highest confidence / most visible evidence.

Respond ONLY with the JSON object matching the provided schema — no extra commentary.`

function userPrompt(cropName: string, contextNote: string) {
  return `Crop: ${cropName || 'unspecified — infer from the photo if possible'}.
${contextNote}
Analyze the attached photo of this crop and return the disease / pest / abiotic assessment as JSON per the schema. Be honest and specific; separate disease and pest findings even if one is dominant.`
}

/**
 * Runs the real Cloudflare Workers AI vision model against a base64-encoded
 * photo. Falls back to a transparent heuristic if the AI binding is
 * unavailable (e.g. sandbox/local dev without Cloudflare credentials) so the
 * end-to-end flow keeps working, but is clearly labeled as such.
 */
export async function classifyCropImage(
  ai: Ai | undefined,
  imageDataUrl: string,
  cropName: string,
  contextNote: string
): Promise<AiScanResult> {
  if (!ai) {
    return heuristicFallback(cropName, 'No AI binding available in this environment (add the `ai` binding in wrangler.jsonc and deploy to Cloudflare to enable live inference).')
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt(cropName, contextNote) },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      },
    ]

    const response: any = await ai.run(MODEL as any, {
      messages,
      max_tokens: 900,
      temperature: 0.3,
      response_format: RESPONSE_SCHEMA,
    } as any)

    const raw = typeof response === 'string' ? response : response?.response ?? response
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw

    return normalizeAiOutput(parsed, MODEL)
  } catch (err: any) {
    return heuristicFallback(cropName, `Live model call failed (${err?.message || 'unknown error'}) — showing a heuristic estimate instead.`)
  }
}

function normalizeAiOutput(parsed: any, modelUsed: string): AiScanResult {
  const clampInt = (n: any, def = 50) => {
    const v = Math.round(Number(n))
    return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : def
  }
  const asAssessment = (type: IssueType, a: any): AiAssessmentRaw => ({
    type,
    cause: String(a?.cause || 'No clear finding'),
    scientific_name: a?.scientific_name ? String(a.scientific_name) : undefined,
    confidence: clampInt(a?.confidence, 10),
    severity: (['Mild', 'Moderate', 'Severe'].includes(a?.severity) ? a.severity : 'Mild') as Severity,
    risk_level: (['Low', 'Moderate', 'High', 'Critical'].includes(a?.risk_level) ? a.risk_level : 'Low') as RiskLevel,
    alternatives: Array.isArray(a?.alternatives) ? a.alternatives.filter((x: any) => typeof x === 'string').slice(0, 4) : [],
  })

  const disease = asAssessment('disease', parsed?.disease)
  const pest = asAssessment('pest', parsed?.pest)
  const abiotic = asAssessment('abiotic', parsed?.abiotic)

  const byType: Record<IssueType, AiAssessmentRaw> = { disease, pest, abiotic }
  const primaryType: IssueType = ['disease', 'pest', 'abiotic'].includes(parsed?.primary_type)
    ? parsed.primary_type
    : (Object.entries(byType).sort((a, b) => b[1].confidence - a[1].confidence)[0][0] as IssueType)

  return {
    primary_type: primaryType,
    overall_confidence: clampInt(parsed?.overall_confidence, byType[primaryType].confidence),
    disease,
    pest,
    abiotic,
    summary: String(parsed?.summary || 'Assessment complete.'),
    source: 'workers-ai',
    modelUsed,
  }
}

/**
 * Deterministic, clearly-labeled fallback used only when the real model
 * can't be reached. It is intentionally conservative (mid/low confidence)
 * rather than confidently wrong, in keeping with this app's "honest
 * confidence scoring" design principle.
 */
function heuristicFallback(cropName: string, reason: string): AiScanResult {
  const crop = (cropName || '').toLowerCase()
  let disease: AiAssessmentRaw = {
    type: 'disease', cause: 'Unable to run live inference — inspect leaves for spots, pustules, or discoloration', confidence: 20,
    severity: 'Mild', risk_level: 'Low', alternatives: [],
  }
  let pest: AiAssessmentRaw = {
    type: 'pest', cause: 'Unable to run live inference — check leaf undersides for insects or larvae', confidence: 15,
    severity: 'Mild', risk_level: 'Low', alternatives: [],
  }
  let abiotic: AiAssessmentRaw = {
    type: 'abiotic', cause: 'Unable to run live inference — consider nutrient, water, or heat stress', confidence: 15,
    severity: 'Mild', risk_level: 'Low', alternatives: [],
  }

  // A slightly crop-aware nudge so the fallback isn't identical for every crop —
  // still clearly marked low-confidence/uncertain, never presented as a firm diagnosis.
  if (crop.includes('wheat')) disease.cause = 'Unable to run live inference — check for rust-colored pustules on leaves'
  if (crop.includes('tomato')) pest.cause = 'Unable to run live inference — check leaf undersides for whitefly/aphids'
  if (crop.includes('rice')) abiotic.cause = 'Unable to run live inference — check for yellowing pattern (nutrient vs. waterlogging)'

  return {
    primary_type: 'abiotic',
    overall_confidence: 30,
    disease,
    pest,
    abiotic,
    summary: `We could not reach the live AI model, so this is a low-confidence placeholder, not a diagnosis. ${reason}`,
    source: 'heuristic-fallback',
    error: reason,
  }
}

/** Converts an uploaded File/Blob into a data: URL the vision model can accept. */
export async function fileToDataUrl(file: File | Blob, mime: string): Promise<string> {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunkSize = 8192
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(i, i + chunkSize))
  }
  const base64 = btoa(binary)
  return `data:${mime || 'image/jpeg'};base64,${base64}`
}
