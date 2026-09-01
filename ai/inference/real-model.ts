// ============================================================================
// REAL CROP HEALTH MODEL — wraps Cloudflare Workers AI's multimodal vision
// model behind the same AIModelInterface as MockCropHealthModel, so the rest
// of the pipeline (evidence fusion, risk engine, backend routes) never needs
// to know which one produced a result (Section 55 — AI Model Abstraction).
//
// This is the "plug in a real trained model later" seam called for in
// Section 4 / 55. Today it calls Cloudflare's hosted vision-language model;
// a future custom-trained CNN/YOLO/MobileNet classifier can be dropped in by
// implementing AIModelInterface and swapping it in ai/inference/index.ts —
// no changes needed to evidence-fusion, risk-engine, or backend routes.
// ============================================================================

import type { AIModelInterface, ClassifyInput, ImageAnalysisResult, IssueType, Severity, CategoryAssessment } from './types'
import { MockCropHealthModel } from './mock-model'

const MODEL_ID = '@cf/meta/llama-3.2-11b-vision-instruct'

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
        disease: assessmentSchema(),
        pest: assessmentSchema(),
        abiotic: assessmentSchema(),
      },
      required: ['primary_type', 'overall_confidence', 'summary', 'disease', 'pest', 'abiotic'],
      additionalProperties: false,
    },
  },
}

function assessmentSchema() {
  return {
    type: 'object',
    properties: {
      cause: { type: 'string' },
      scientific_name: { type: 'string' },
      confidence: { type: 'integer', minimum: 0, maximum: 100 },
      severity: { type: 'string', enum: ['Mild', 'Moderate', 'Severe'] },
      alternatives: { type: 'array', items: { type: 'string' } },
    },
    required: ['cause', 'confidence', 'severity', 'alternatives'],
    additionalProperties: false,
  }
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

export class RealCropHealthModel implements AIModelInterface {
  readonly name = `Cloudflare Workers AI (${MODEL_ID})`
  readonly isMock = false
  private fallback = new MockCropHealthModel()

  constructor(private ai: Ai | undefined) {}

  async classify(input: ClassifyInput): Promise<ImageAnalysisResult> {
    if (!this.ai) {
      const mock = await this.fallback.classify(input)
      return { ...mock, source: 'heuristic-fallback', error: 'No Workers AI binding available in this environment.' }
    }

    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt(input.cropName, input.contextNote || 'No additional notes provided.') },
            { type: 'image_url', image_url: { url: input.imageDataUrl } },
          ],
        },
      ]

      const response: any = await this.ai.run(MODEL_ID as any, {
        messages,
        max_tokens: 900,
        temperature: 0.3,
        response_format: RESPONSE_SCHEMA,
      } as any)

      const raw = typeof response === 'string' ? response : response?.response ?? response
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
      return this.normalize(parsed)
    } catch (err: any) {
      const mock = await this.fallback.classify(input)
      return {
        ...mock,
        source: 'heuristic-fallback',
        error: `Live model call failed (${err?.message || 'unknown error'}) — showing a conservative fallback instead.`,
      }
    }
  }

  private normalize(parsed: any): ImageAnalysisResult {
    const clampInt = (n: any, def = 50) => {
      const v = Math.round(Number(n))
      return Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : def
    }
    const asAssessment = (type: IssueType, a: any): CategoryAssessment => ({
      type,
      cause: String(a?.cause || 'No clear finding'),
      scientificName: a?.scientific_name ? String(a.scientific_name) : undefined,
      confidence: clampInt(a?.confidence, 10),
      severity: (['Mild', 'Moderate', 'Severe'].includes(a?.severity) ? a.severity : 'Mild') as Severity,
      alternatives: Array.isArray(a?.alternatives) ? a.alternatives.filter((x: any) => typeof x === 'string').slice(0, 4) : [],
    })

    const disease = asAssessment('disease', parsed?.disease)
    const pest = asAssessment('pest', parsed?.pest)
    const abiotic = asAssessment('abiotic', parsed?.abiotic)
    const byType: Record<IssueType, CategoryAssessment> = { disease, pest, abiotic }

    const primaryType: IssueType = ['disease', 'pest', 'abiotic'].includes(parsed?.primary_type)
      ? parsed.primary_type
      : (Object.entries(byType).sort((a, b) => b[1].confidence - a[1].confidence)[0][0] as IssueType)

    return {
      primaryType,
      overallConfidence: clampInt(parsed?.overall_confidence, byType[primaryType].confidence),
      disease,
      pest,
      abiotic,
      summary: String(parsed?.summary || 'Assessment complete.'),
      source: 'workers-ai',
      modelUsed: MODEL_ID,
    }
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
