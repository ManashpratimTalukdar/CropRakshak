// ============================================================================
// AI MODULE — SHARED TYPES
// Used across inference/, evidence-fusion/, and risk-engine/ so the backend
// only needs to import from ai/ without caring which concrete model ran.
// ============================================================================

export type IssueType = 'disease' | 'pest' | 'abiotic'
export type Severity = 'Mild' | 'Moderate' | 'Severe'
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical'

/** One of the three parallel hypotheses (disease / pest / abiotic) the model scores independently. */
export interface CategoryAssessment {
  type: IssueType
  cause: string
  scientificName?: string
  confidence: number // 0-100
  severity: Severity
  alternatives: string[]
}

/** Raw output of the image-classification stage, before evidence fusion / risk scoring. */
export interface ImageAnalysisResult {
  primaryType: IssueType
  overallConfidence: number
  disease: CategoryAssessment
  pest: CategoryAssessment
  abiotic: CategoryAssessment
  summary: string
  source: 'mock' | 'workers-ai' | 'heuristic-fallback'
  modelUsed?: string
  modelVersion?: string
  error?: string
}

/** The AIModelInterface every concrete model implementation (mock or real) must satisfy (Section 55). */
export interface AIModelInterface {
  readonly name: string
  readonly isMock: boolean
  classify(input: ClassifyInput): Promise<ImageAnalysisResult>
}

export interface ClassifyInput {
  /** data: URL or remote URL of the crop image. */
  imageDataUrl: string
  cropName: string
  contextNote?: string
}

/** Contextual evidence bundle fed into the Evidence Fusion Engine alongside the image result (Section 8). */
export interface EvidenceBundle {
  image: ImageAnalysisResult
  cropStage?: string
  soil?: {
    soilType?: string
    ph?: number
    ec?: number
    organicCarbon?: number
    n?: number
    p?: number
    k?: number
  }
  irrigation?: {
    waterSource?: string
    method?: string
    frequency?: string
    waterStress?: 'Dry' | 'Normal' | 'Waterlogged'
  }
  treatmentHistory?: {
    recentTreatment?: string
    pastIssues?: string
    budgetLevel?: 'Low' | 'Medium' | 'High'
  }
  weather?: {
    temperatureC?: number
    humidityPct?: number
    rainfallMm?: number
    windKmh?: number
    soilMoisturePct?: number
    forecastNote?: string
    source: 'mock' | 'api'
  }
  regional?: {
    nearbyReports: number
    radiusKm: number
    dominantIssue?: string
    hotspotStatus: 'Low Activity' | 'Watch' | 'Elevated Activity' | 'Outbreak Alert'
    advisory?: string
    isDemo: boolean
  }
  seed?: {
    authenticity?: 'Trusted' | 'Needs Verification' | 'Not Trusted'
  }
  similarCases?: SimilarCase[]
}

export interface SimilarCase {
  caseId: string
  cropName: string
  cause: string
  similarityPct: number
  outcome?: string
}

/** Final fused diagnosis produced by the Evidence Fusion Engine (Section 12). */
export interface FusedDiagnosis {
  primaryType: IssueType
  primaryCause: string
  primaryScientificName?: string
  overallConfidence: number
  severity: Severity
  disease: CategoryAssessment
  pest: CategoryAssessment
  abiotic: CategoryAssessment
  uncertain: boolean
  uncertaintyMessage?: string
  reasoningNotes: string[] // human-readable explanation of which evidence influenced the result
  similarCases: SimilarCase[]
}

/** Output of the Risk Engine (Section 10). Always carries the "prototype" label per Section 62. */
export interface RiskAssessment {
  riskScore: number // 0-100
  riskLevel: RiskLevel
  factors: RiskFactor[]
  modelLabel: string
}

export interface RiskFactor {
  name: string
  contribution: number // signed points contributed to the 0-100 score
  note: string
}
