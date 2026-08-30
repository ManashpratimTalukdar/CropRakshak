// ============================================================================
// MOCK / SIMULATED DATA LAYER
// AI-Powered Crop Health Early Detection & Management System
// All data below is illustrative demo data for the hackathon prototype.
// No live ML / weather / geolocation backend is wired up.
// ============================================================================

export type Severity = 'Mild' | 'Moderate' | 'Severe'
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical'
export type IssueType = 'disease' | 'pest' | 'abiotic'

export interface CategoryAssessment {
  type: IssueType
  icon: string
  label: string
  cause: string
  scientificName?: string
  confidence: number // 0-100
  severity: Severity
  riskLevel: RiskLevel
  alternatives: string[]
  isPrimary?: boolean
}

export interface WeatherSnapshot {
  temp: string
  humidity: string
  rainfall: string
  forecast: string
  soilMoisture: string
  windSpeed: string
}

export interface RegionalSnapshot {
  hotspotStatus: 'Low Activity' | 'Watch' | 'Elevated Activity' | 'Outbreak Alert'
  nearbyReports: number
  radiusKm: number
  dominantIssue: string
  advisory: string
}

export interface HelpProvider {
  name: string
  type: 'Dealer' | 'KVK / Agri Office' | 'Soil Lab / Clinic' | 'Expert'
  distanceKm: number
  phone: string
  village: string
  verified: boolean
  rating: number
}

export interface FollowUp {
  rescanAfterDays: number
  monitorNotes: string[]
  escalateWhen: string
}

export interface CaseRecommendations {
  immediateActions: string[]
  treatmentGuidance: string[]
  culturalPractices: string[]
  safeUsage: string[]
  purchaseOptions: { label: string; detail: string; icon: string }[]
  followUp: FollowUp
}

export interface DiagnosisCase {
  id: string
  scanId: string
  cropName: string
  cropEmoji: string
  variety: string
  stage: string
  farmerName: string
  village: string
  district: string
  date: string
  fieldSizeAcres: number
  budgetLevel: 'Low' | 'Medium' | 'High'
  primaryType: IssueType
  overallConfidence: number
  uncertain: boolean
  uncertaintyMessage?: string
  disease: CategoryAssessment
  pest: CategoryAssessment
  abiotic: CategoryAssessment
  weather: WeatherSnapshot
  regional: RegionalSnapshot
  recommendations: CaseRecommendations
  helpProviders: HelpProvider[]
  status: 'Pending Review' | 'Approved' | 'Escalated' | 'Resolved'
}

// ---------------------------------------------------------------------------
// DIAGNOSIS CASES — 3 crops, 3 distinct outcome archetypes
// ---------------------------------------------------------------------------

export const CASES: Record<string, DiagnosisCase> = {
  'wheat-rust': {
    id: 'wheat-rust',
    scanId: 'SCN-2026-04471',
    cropName: 'Wheat',
    cropEmoji: '🌾',
    variety: 'HD-2967',
    stage: 'Tillering to Booting',
    farmerName: 'Ramesh Patil',
    village: 'Sonewadi',
    district: 'Nashik, Maharashtra',
    date: '28 Aug 2026, 7:42 AM',
    fieldSizeAcres: 2.5,
    budgetLevel: 'Low',
    primaryType: 'disease',
    overallConfidence: 82,
    uncertain: false,
    disease: {
      type: 'disease',
      icon: 'fa-leaf',
      label: 'Disease Detection',
      cause: 'Leaf Rust (early pustule stage)',
      scientificName: 'Puccinia triticina',
      confidence: 82,
      severity: 'Moderate',
      riskLevel: 'High',
      alternatives: ['Yellow / Stripe Rust', 'Septoria Leaf Blotch'],
      isPrimary: true,
    },
    pest: {
      type: 'pest',
      icon: 'fa-bug',
      label: 'Pest Detection',
      cause: 'No significant pest activity detected',
      confidence: 12,
      severity: 'Mild',
      riskLevel: 'Low',
      alternatives: ['Aphid colonies (trace, non-threshold)'],
    },
    abiotic: {
      type: 'abiotic',
      icon: 'fa-droplet',
      label: 'Abiotic / Other Stress',
      cause: 'Minor nitrogen mottling on older leaves',
      confidence: 21,
      severity: 'Mild',
      riskLevel: 'Low',
      alternatives: ['Early-stage moisture stress'],
    },
    weather: {
      temp: '24°C (18°–27°C)',
      humidity: '78% — favourable for rust spread',
      rainfall: '4 mm in last 48 hrs',
      forecast: 'Cloudy, light showers expected in 2 days',
      soilMoisture: '62% (adequate)',
      windSpeed: '11 km/h',
    },
    regional: {
      hotspotStatus: 'Elevated Activity',
      nearbyReports: 14,
      radiusKm: 8,
      dominantIssue: 'Leaf Rust reported in 6 nearby wheat fields',
      advisory: 'District advisory: monitor wheat for rust pustules through early Sept; humid mornings increase risk.',
    },
    helpProviders: [],
    recommendations: {
      immediateActions: [
        'Isolate and closely inspect nearby wheat plots — rust spreads fast in humid mornings.',
        'Avoid overhead irrigation for the next 3–4 days to reduce leaf wetness.',
        'Remove and destroy heavily infected lower leaves if less than 10% of the field is affected.',
      ],
      treatmentGuidance: [
        'Apply a triazole-group fungicide (e.g., Propiconazole 25% EC) at recommended label dose.',
        'Spray during early morning or late evening; avoid spraying before rain.',
        'Repeat application after 10–12 days if pustules persist — do not exceed 2 sprays per season without officer advice.',
      ],
      culturalPractices: [
        'Ensure balanced nitrogen — avoid excess urea which increases leaf tenderness.',
        'Maintain recommended row spacing for airflow between plants.',
        'Rotate with a non-cereal crop next season to break the rust cycle.',
      ],
      safeUsage: [
        'Wear gloves and a mask while spraying; wash hands and equipment after use.',
        'Keep children and animals away from the field for 24 hours post-spray.',
        'Store unused chemical in original container, away from food and water sources.',
      ],
      purchaseOptions: [
        { label: 'Buy Locally', detail: 'Available at 2 verified dealers within 6 km', icon: 'fa-store' },
        { label: 'Order Online', detail: 'Trusted agri-input partner — delivery in 2 days', icon: 'fa-truck-fast' },
        { label: 'Call / SMS to Order', detail: 'SMS "RUST" to 56070 for dealer callback', icon: 'fa-comment-sms' },
        { label: 'Assisted Procurement', detail: 'Ask KVK Nashik to arrange subsidised stock', icon: 'fa-handshake-angle' },
      ],
      followUp: {
        rescanAfterDays: 5,
        monitorNotes: [
          'Photograph the same 3 plants every re-scan for consistent comparison.',
          'Watch for pustules turning from orange to black (a sign of disease progressing).',
        ],
        escalateWhen: 'If more than 25% of the field shows pustules, or spread continues after 2nd spray — escalate to your Agriculture Officer.',
      },
    },
    status: 'Approved',
  },

  'tomato-whitefly': {
    id: 'tomato-whitefly',
    scanId: 'SCN-2026-04512',
    cropName: 'Tomato',
    cropEmoji: '🍅',
    variety: 'Arka Rakshak',
    stage: 'Flowering',
    farmerName: 'Lakshmi Devi',
    village: 'Kotturu',
    district: 'Anantapur, Andhra Pradesh',
    date: '29 Aug 2026, 6:15 PM',
    fieldSizeAcres: 1.2,
    budgetLevel: 'Medium',
    primaryType: 'pest',
    overallConfidence: 76,
    uncertain: false,
    disease: {
      type: 'disease',
      icon: 'fa-leaf',
      label: 'Disease Detection',
      cause: 'Possible early Leaf Curl Virus (secondary to pest)',
      scientificName: 'ToLCV (suspected)',
      confidence: 34,
      severity: 'Mild',
      riskLevel: 'Moderate',
      alternatives: ['Early blight (not yet visible)'],
    },
    pest: {
      type: 'pest',
      icon: 'fa-bug',
      label: 'Pest Detection',
      cause: 'Whitefly infestation on leaf undersides',
      scientificName: 'Bemisia tabaci',
      confidence: 76,
      severity: 'Moderate',
      riskLevel: 'Moderate',
      alternatives: ['Aphid colonies', 'Thrips (minor co-presence)'],
      isPrimary: true,
    },
    abiotic: {
      type: 'abiotic',
      icon: 'fa-droplet',
      label: 'Abiotic / Other Stress',
      cause: 'No significant abiotic stress detected',
      confidence: 9,
      severity: 'Mild',
      riskLevel: 'Low',
      alternatives: ['Mild heat stress on top leaves'],
    },
    weather: {
      temp: '32°C (26°–35°C)',
      humidity: '54% — warm & dry',
      rainfall: '0 mm in last 5 days',
      forecast: 'Hot & dry for the next 4 days — favours whitefly buildup',
      soilMoisture: '38% (slightly low)',
      windSpeed: '7 km/h',
    },
    regional: {
      hotspotStatus: 'Watch',
      nearbyReports: 7,
      radiusKm: 5,
      dominantIssue: 'Whitefly & early leaf curl noted in 3 nearby tomato plots',
      advisory: 'Dry, warm spells over the past week are boosting whitefly populations regionally — inspect leaf undersides.',
    },
    helpProviders: [],
    recommendations: {
      immediateActions: [
        'Check the undersides of leaves in 5 different spots in the field for whitefly nymphs.',
        'Install yellow sticky traps (10–12 per acre) to monitor and reduce adult population.',
        'Remove and destroy any leaves showing early curling to reduce virus-carrying pest load.',
      ],
      treatmentGuidance: [
        'Spray Neem oil (1500 ppm) or Imidacloprid as per label dose, focused on leaf undersides.',
        'Rotate chemical groups every 2 sprays to avoid resistance build-up.',
        'Avoid spraying during peak sun hours (11 AM–3 PM) — early morning is best.',
      ],
      culturalPractices: [
        'Avoid planting new tomato/chilli near an already infested plot this season.',
        'Maintain field hygiene — remove weeds that can host whitefly.',
        'Use reflective mulch between rows to disrupt whitefly landing behaviour.',
      ],
      safeUsage: [
        'Wear gloves and eye protection while spraying oil-based solutions.',
        'Re-entry into sprayed field only after 4–6 hours.',
        'Do not mix chemical and neem-based sprays together unless label permits.',
      ],
      purchaseOptions: [
        { label: 'Buy Locally', detail: 'Yellow traps & neem oil at 1 verified dealer, 3 km away', icon: 'fa-store' },
        { label: 'Order Online', detail: 'Bulk sticky traps — delivery in 3 days', icon: 'fa-truck-fast' },
        { label: 'Call / SMS to Order', detail: 'SMS "WHITEFLY" to 56070 for dealer callback', icon: 'fa-comment-sms' },
        { label: 'Assisted Procurement', detail: 'FPO group-buy discount available this week', icon: 'fa-handshake-angle' },
      ],
      followUp: {
        rescanAfterDays: 4,
        monitorNotes: [
          'Count whitefly on 3 sticky traps every 2 days to track population trend.',
          'Watch new leaves closely for curling — early sign of virus transmission.',
        ],
        escalateWhen: 'If leaf curling spreads to more than 15% of plants — escalate immediately, as this may indicate virus spread.',
      },
    },
    status: 'Pending Review',
  },

  'rice-nutrient': {
    id: 'rice-nutrient',
    scanId: 'SCN-2026-04528',
    cropName: 'Rice',
    cropEmoji: '🌱',
    variety: 'Swarna (MTU-7029)',
    stage: 'Vegetative',
    farmerName: 'Anil Kumar Sahu',
    village: 'Balipatna',
    district: 'Khordha, Odisha',
    date: '30 Aug 2026, 9:08 AM',
    fieldSizeAcres: 3.0,
    budgetLevel: 'Low',
    primaryType: 'abiotic',
    overallConfidence: 58,
    uncertain: true,
    uncertaintyMessage:
      'Confidence is below our reliable threshold. The yellowing pattern is consistent with nitrogen deficiency, but early bacterial leaf blight can look similar. We need a clearer, closer photo of the leaf tip and margin — ideally in daylight, without shadows — before we can raise confidence.',
    disease: {
      type: 'disease',
      icon: 'fa-leaf',
      label: 'Disease Detection',
      cause: 'Cannot rule out early Bacterial Leaf Blight',
      scientificName: 'Xanthomonas oryzae (unconfirmed)',
      confidence: 41,
      severity: 'Mild',
      riskLevel: 'Moderate',
      alternatives: ['Bacterial leaf streak'],
    },
    pest: {
      type: 'pest',
      icon: 'fa-bug',
      label: 'Pest Detection',
      cause: 'No pest damage pattern detected',
      confidence: 8,
      severity: 'Mild',
      riskLevel: 'Low',
      alternatives: ['Minor leafhopper presence (non-threshold)'],
    },
    abiotic: {
      type: 'abiotic',
      icon: 'fa-droplet',
      label: 'Abiotic / Other Stress',
      cause: 'Likely Nitrogen deficiency (interveinal yellowing, older leaves first)',
      confidence: 58,
      severity: 'Moderate',
      riskLevel: 'Moderate',
      alternatives: ['Waterlogging stress', 'Sulphur deficiency'],
      isPrimary: true,
    },
    weather: {
      temp: '29°C (25°–33°C)',
      humidity: '84% — humid, monsoon conditions',
      rainfall: '38 mm in last 3 days',
      forecast: 'Intermittent heavy showers for next 3 days',
      soilMoisture: '91% (waterlogged risk)',
      windSpeed: '9 km/h',
    },
    regional: {
      hotspotStatus: 'Watch',
      nearbyReports: 5,
      radiusKm: 10,
      dominantIssue: 'Nutrient stress commonly reported this week due to heavy rainfall leaching',
      advisory: 'Heavy monsoon rainfall this week may be leaching nitrogen from paddy fields across the block.',
    },
    helpProviders: [],
    recommendations: {
      immediateActions: [
        'Take 2–3 more close-up photos of leaf tips and margins in good daylight and re-scan for a clearer result.',
        'Check field drainage — standing water above 5 cm for more than 2 days can worsen both nutrient loss and disease risk.',
        'Avoid any spraying until the diagnosis is confirmed with a clearer photo or officer visit.',
      ],
      treatmentGuidance: [
        'If confirmed as nitrogen deficiency: apply top-dress Urea in 2 split doses as per state package of practice.',
        'If bacterial blight is confirmed instead: avoid nitrogen top-dressing and consult officer for Copper-based bactericide guidance.',
        'Do not mix fertilizer decisions until confidence improves — wrong action here can worsen either issue.',
      ],
      culturalPractices: [
        'Improve field drainage to avoid prolonged waterlogging during monsoon.',
        'Avoid excess standing water — alternate wetting and drying where possible.',
        'Keep bunds clean to reduce disease carryover from field edges.',
      ],
      safeUsage: [
        'If applying urea, do so in dry field conditions, not standing water, to reduce nutrient loss.',
        'Store fertilizer bags off the ground and away from moisture.',
      ],
      purchaseOptions: [
        { label: 'Buy Locally', detail: 'Hold off purchase until diagnosis is confirmed', icon: 'fa-store' },
        { label: 'Order Online', detail: 'Soil test kit available — recommended before fertilizer purchase', icon: 'fa-truck-fast' },
        { label: 'Call / SMS to Order', detail: 'SMS "SOILTEST" to 56070 to book a field visit', icon: 'fa-comment-sms' },
        { label: 'Assisted Procurement', detail: 'KVK Khordha offers free soil testing this month', icon: 'fa-handshake-angle' },
      ],
      followUp: {
        rescanAfterDays: 2,
        monitorNotes: [
          'Re-scan within 2 days with a clearer, closer photo — this case needs confirmation.',
          'Track whether yellowing spreads to younger leaves (would suggest disease, not deficiency).',
        ],
        escalateWhen: 'Given the uncertainty, we recommend an Agriculture Officer visit within 3 days rather than waiting for further spread.',
      },
    },
    status: 'Escalated',
  },
}

export const CASE_LIST = Object.values(CASES)

// ---------------------------------------------------------------------------
// HELP PROVIDERS / ECOSYSTEM DIRECTORY
// ---------------------------------------------------------------------------

export const DIRECTORY: HelpProvider[] = [
  { name: 'Krishi Seva Kendra', type: 'Dealer', distanceKm: 2.1, phone: '+91 98230 11234', village: 'Sonewadi Bazar', verified: true, rating: 4.6 },
  { name: 'Nashik KVK (Krishi Vigyan Kendra)', type: 'KVK / Agri Office', distanceKm: 6.4, phone: '+91 253 225 1010', village: 'Nashik Road', verified: true, rating: 4.8 },
  { name: 'AgroCare Soil & Leaf Testing Lab', type: 'Soil Lab / Clinic', distanceKm: 8.9, phone: '+91 98220 55678', village: 'Niphad', verified: true, rating: 4.4 },
  { name: 'Dr. S. Kulkarni — Plant Pathologist', type: 'Expert', distanceKm: 9.5, phone: '+91 90210 33445', village: 'Nashik City', verified: true, rating: 4.9 },
  { name: 'Anantapur AgriMart', type: 'Dealer', distanceKm: 3.0, phone: '+91 94901 22110', village: 'Kotturu Cross', verified: true, rating: 4.3 },
  { name: 'District Extension Office', type: 'KVK / Agri Office', distanceKm: 11.2, phone: '+91 8554 234 556', village: 'Anantapur Town', verified: true, rating: 4.5 },
]

// ---------------------------------------------------------------------------
// FARMER DASHBOARD — crop portfolio & scan history
// ---------------------------------------------------------------------------

export interface PortfolioField {
  id: string
  cropName: string
  cropEmoji: string
  fieldName: string
  acres: number
  riskStatus: RiskLevel
  lastScanned: string
  caseId: string
}

export const PORTFOLIO: PortfolioField[] = [
  { id: 'f1', cropName: 'Wheat', cropEmoji: '🌾', fieldName: 'North Plot', acres: 2.5, riskStatus: 'High', lastScanned: '28 Aug 2026', caseId: 'wheat-rust' },
  { id: 'f2', cropName: 'Tomato', cropEmoji: '🍅', fieldName: 'Backyard Plot', acres: 1.2, riskStatus: 'Moderate', lastScanned: '29 Aug 2026', caseId: 'tomato-whitefly' },
  { id: 'f3', cropName: 'Rice', cropEmoji: '🌱', fieldName: 'Low-lying Field', acres: 3.0, riskStatus: 'Moderate', lastScanned: '30 Aug 2026', caseId: 'rice-nutrient' },
  { id: 'f4', cropName: 'Onion', cropEmoji: '🧅', fieldName: 'South Strip', acres: 0.8, riskStatus: 'Low', lastScanned: '21 Aug 2026', caseId: 'wheat-rust' },
]

export interface HistoryEntry {
  date: string
  cropName: string
  cropEmoji: string
  result: string
  riskLevel: RiskLevel
  caseId: string
  feedback: 'helped' | 'not-helped' | 'pending'
}

export const SCAN_HISTORY: HistoryEntry[] = [
  { date: '30 Aug 2026', cropName: 'Rice', cropEmoji: '🌱', result: 'Likely Nitrogen deficiency (low confidence)', riskLevel: 'Moderate', caseId: 'rice-nutrient', feedback: 'pending' },
  { date: '29 Aug 2026', cropName: 'Tomato', cropEmoji: '🍅', result: 'Whitefly infestation detected', riskLevel: 'Moderate', caseId: 'tomato-whitefly', feedback: 'pending' },
  { date: '28 Aug 2026', cropName: 'Wheat', cropEmoji: '🌾', result: 'Leaf Rust — early stage', riskLevel: 'High', caseId: 'wheat-rust', feedback: 'helped' },
  { date: '21 Aug 2026', cropName: 'Onion', cropEmoji: '🧅', result: 'Healthy — no issue detected', riskLevel: 'Low', caseId: 'wheat-rust', feedback: 'helped' },
  { date: '14 Aug 2026', cropName: 'Wheat', cropEmoji: '🌾', result: 'Minor nitrogen mottling', riskLevel: 'Low', caseId: 'wheat-rust', feedback: 'not-helped' },
]

// ---------------------------------------------------------------------------
// SEED VERIFICATION MOCK BATCHES
// ---------------------------------------------------------------------------

export interface SeedBatch {
  batchCode: string
  cropName: string
  variety: string
  brand: string
  certBody: string
  germinationPct: number
  purityPct: number
  treated: boolean
  geneticPurityPct: number
  labTestDate: string
  authenticity: 'Trusted' | 'Use with Caution' | 'Not Trusted'
  traceability: { stage: string; date: string; note: string }[]
}

export const SEED_BATCHES: Record<string, SeedBatch> = {
  'SB-WH-88123': {
    batchCode: 'SB-WH-88123',
    cropName: 'Wheat',
    variety: 'HD-2967',
    brand: 'NSC Certified Seeds',
    certBody: 'National Seeds Corporation',
    germinationPct: 94,
    purityPct: 98.5,
    treated: true,
    geneticPurityPct: 99.1,
    labTestDate: '02 Jun 2026',
    authenticity: 'Trusted',
    traceability: [
      { stage: 'Seed Production', date: '10 Mar 2026', note: 'Certified seed farm, Nashik Division' },
      { stage: 'Lab Testing', date: '02 Jun 2026', note: 'Germination & purity test passed at State Seed Lab' },
      { stage: 'Certification Tagging', date: '05 Jun 2026', note: 'Blue tag issued — Certified Seed class' },
      { stage: 'Dealer Stocking', date: '18 Jun 2026', note: 'Received at Krishi Seva Kendra, Sonewadi' },
      { stage: 'Farmer Purchase', date: '02 Jul 2026', note: 'Sold with valid bill & batch tag intact' },
    ],
  },
  'SB-TM-51042': {
    batchCode: 'SB-TM-51042',
    cropName: 'Tomato',
    variety: 'Arka Rakshak',
    brand: 'AgriGrow Hybrid Seeds',
    certBody: 'ICAR-IIHR Licensed',
    germinationPct: 88,
    purityPct: 95.2,
    treated: true,
    geneticPurityPct: 96.4,
    labTestDate: '14 May 2026',
    authenticity: 'Use with Caution',
    traceability: [
      { stage: 'Seed Production', date: '02 Feb 2026', note: 'Licensed hybrid seed producer, Kurnool' },
      { stage: 'Lab Testing', date: '14 May 2026', note: 'Germination slightly below ideal (88%); purity acceptable' },
      { stage: 'Certification Tagging', date: '20 May 2026', note: 'Truthfully-labelled tag (not fully certified)' },
      { stage: 'Dealer Stocking', date: '02 Jun 2026', note: 'Received at Anantapur AgriMart' },
    ],
  },
  'SB-RC-30099': {
    batchCode: 'SB-RC-30099',
    cropName: 'Rice',
    variety: 'Swarna (MTU-7029)',
    brand: 'Unbranded — loose stock',
    certBody: 'No certification found',
    germinationPct: 61,
    purityPct: 79.0,
    treated: false,
    geneticPurityPct: 82.0,
    labTestDate: 'Not available',
    authenticity: 'Not Trusted',
    traceability: [
      { stage: 'Seed Production', date: 'Unknown', note: 'No verifiable production record' },
      { stage: 'Lab Testing', date: 'Not conducted', note: 'No lab test certificate provided by seller' },
      { stage: 'Dealer Stocking', date: '25 Jun 2026', note: 'Sold loose, without batch tag, by local vendor' },
    ],
  },
}

// ---------------------------------------------------------------------------
// ADMIN / OFFICER DASHBOARD DATA
// ---------------------------------------------------------------------------

export interface Hotspot {
  region: string
  crop: string
  dominantIssue: string
  riskLevel: RiskLevel
  cases: number
}

export const HOTSPOTS: Hotspot[] = [
  { region: 'Nashik – Niphad Block', crop: 'Wheat', dominantIssue: 'Leaf Rust', riskLevel: 'High', cases: 23 },
  { region: 'Anantapur – Kotturu Block', crop: 'Tomato', dominantIssue: 'Whitefly', riskLevel: 'Moderate', cases: 14 },
  { region: 'Khordha – Balipatna Block', crop: 'Rice', dominantIssue: 'Nutrient Stress', riskLevel: 'Moderate', cases: 9 },
  { region: 'Nashik – Sinnar Block', crop: 'Onion', dominantIssue: 'Thrips', riskLevel: 'Low', cases: 4 },
  { region: 'Anantapur – Rayadurg Block', crop: 'Groundnut', dominantIssue: 'Leaf Spot', riskLevel: 'High', cases: 19 },
  { region: 'Khordha – Bolagarh Block', crop: 'Rice', dominantIssue: 'Bacterial Blight (watch)', riskLevel: 'Critical', cases: 6 },
]

export interface FarmerRecord {
  name: string
  village: string
  crop: string
  cropEmoji: string
  issue: string
  riskLevel: RiskLevel
  status: 'Pending Review' | 'Approved' | 'Escalated' | 'Resolved'
  confidence: number
  date: string
  caseId: string
}

export const FARMER_DIRECTORY: FarmerRecord[] = [
  { name: 'Ramesh Patil', village: 'Sonewadi', crop: 'Wheat', cropEmoji: '🌾', issue: 'Leaf Rust', riskLevel: 'High', status: 'Approved', confidence: 82, date: '28 Aug 2026', caseId: 'wheat-rust' },
  { name: 'Lakshmi Devi', village: 'Kotturu', crop: 'Tomato', cropEmoji: '🍅', issue: 'Whitefly infestation', riskLevel: 'Moderate', status: 'Pending Review', confidence: 76, date: '29 Aug 2026', caseId: 'tomato-whitefly' },
  { name: 'Anil Kumar Sahu', village: 'Balipatna', crop: 'Rice', cropEmoji: '🌱', issue: 'Suspected Nutrient / Blight (low confidence)', riskLevel: 'Moderate', status: 'Escalated', confidence: 58, date: '30 Aug 2026', caseId: 'rice-nutrient' },
  { name: 'Suresh Yadav', village: 'Niphad', crop: 'Wheat', cropEmoji: '🌾', issue: 'Leaf Rust (severe)', riskLevel: 'Critical', status: 'Escalated', confidence: 91, date: '27 Aug 2026', caseId: 'wheat-rust' },
  { name: 'Meena Kumari', village: 'Rayadurg', crop: 'Groundnut', cropEmoji: '🥜', issue: 'Late Leaf Spot', riskLevel: 'High', status: 'Approved', confidence: 79, date: '26 Aug 2026', caseId: 'tomato-whitefly' },
  { name: 'Joseph K.', village: 'Bolagarh', crop: 'Rice', cropEmoji: '🌱', issue: 'Bacterial Leaf Blight (watch)', riskLevel: 'Critical', status: 'Escalated', confidence: 64, date: '30 Aug 2026', caseId: 'rice-nutrient' },
  { name: 'Farida Sheikh', village: 'Sinnar', crop: 'Onion', cropEmoji: '🧅', issue: 'Thrips — mild', riskLevel: 'Low', status: 'Resolved', confidence: 71, date: '19 Aug 2026', caseId: 'wheat-rust' },
]

export const ANALYTICS = {
  months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  diseaseCounts: [22, 28, 31, 40, 52, 61],
  pestCounts: [14, 18, 26, 33, 30, 38],
  abioticCounts: [9, 11, 10, 15, 18, 21],
  confidenceTrend: [71, 73, 75, 77, 79, 81],
  outbreakVsWeather: {
    labels: ['Wk1', 'Wk2', 'Wk3', 'Wk4', 'Wk5', 'Wk6', 'Wk7', 'Wk8'],
    humidity: [58, 62, 65, 70, 74, 80, 83, 78],
    outbreakRisk: [30, 35, 38, 47, 55, 68, 74, 66],
  },
  modelStats: {
    version: 'v2.3-early-detect',
    totalFeedback: 4820,
    positiveFeedbackPct: 87,
    accuracyGainPct: 6.4,
    lastRetrain: '18 Aug 2026',
  },
}

// ---------------------------------------------------------------------------
// DEALER / LAB VIEW — incoming referrals
// ---------------------------------------------------------------------------

export interface Referral {
  caseId: string
  farmerName: string
  village: string
  cropEmoji: string
  cropName: string
  issue: string
  riskLevel: RiskLevel
  requestedItem: string
  distanceKm: number
  status: 'New' | 'Contacted' | 'Fulfilled'
  date: string
}

export const REFERRALS: Referral[] = [
  { caseId: 'wheat-rust', farmerName: 'Ramesh Patil', village: 'Sonewadi', cropEmoji: '🌾', cropName: 'Wheat', issue: 'Leaf Rust', riskLevel: 'High', requestedItem: 'Propiconazole 25% EC', distanceKm: 2.1, status: 'New', date: '28 Aug 2026' },
  { caseId: 'tomato-whitefly', farmerName: 'Lakshmi Devi', village: 'Kotturu', cropEmoji: '🍅', cropName: 'Tomato', issue: 'Whitefly infestation', riskLevel: 'Moderate', requestedItem: 'Yellow sticky traps + Neem oil', distanceKm: 3.0, status: 'Contacted', date: '29 Aug 2026' },
  { caseId: 'rice-nutrient', farmerName: 'Anil Kumar Sahu', village: 'Balipatna', cropEmoji: '🌱', cropName: 'Rice', issue: 'Suspected Nutrient Deficiency', riskLevel: 'Moderate', requestedItem: 'Soil test kit (pre-purchase)', distanceKm: 5.4, status: 'New', date: '30 Aug 2026' },
  { caseId: 'wheat-rust', farmerName: 'Suresh Yadav', village: 'Niphad', cropEmoji: '🌾', cropName: 'Wheat', issue: 'Leaf Rust (severe)', riskLevel: 'Critical', requestedItem: 'Propiconazole 25% EC (urgent)', distanceKm: 7.8, status: 'Fulfilled', date: '27 Aug 2026' },
]

export function riskColor(risk: RiskLevel) {
  switch (risk) {
    case 'Low':
      return { bg: 'bg-agri-100', text: 'text-agri-700', ring: 'ring-agri-300', dot: 'bg-agri-500' }
    case 'Moderate':
      return { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300', dot: 'bg-amber-500' }
    case 'High':
      return { bg: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-300', dot: 'bg-orange-500' }
    case 'Critical':
      return { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-300', dot: 'bg-red-500' }
  }
}

export function statusColor(status: string) {
  switch (status) {
    case 'Approved':
    case 'Resolved':
    case 'Fulfilled':
      return { bg: 'bg-agri-100', text: 'text-agri-700' }
    case 'Pending Review':
    case 'New':
      return { bg: 'bg-blue-100', text: 'text-blue-700' }
    case 'Escalated':
      return { bg: 'bg-red-100', text: 'text-red-700' }
    case 'Contacted':
      return { bg: 'bg-amber-100', text: 'text-amber-700' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700' }
  }
}
