// ============================================================================
// ACTION & RECOMMENDATION ENGINE (Section 14/15/63)
//
// SAFETY RULES enforced here:
//   - Never invents pesticide dosage or specific product/brand names.
//   - Never fabricates agricultural regulations.
//   - Always defers exact chemical choice/dose to a local dealer/KVK/officer.
//   - Uncertain diagnoses get a "hold off, don't treat yet" recommendation
//     set instead of a treatment plan (Section 13/63).
//   - Recommendations are crop/disease/severity-aware, curated text — not
//     LLM-generated dosage advice.
// ============================================================================

import type { FusedDiagnosis, IssueType } from '../inference/types'

export interface RecommendationSet {
  immediateActions: string[]
  treatmentGuidance: string[]
  culturalPractices: string[]
  safeUsage: string[]
  purchaseOptions: { label: string; detail: string; icon: string }[]
  followUp: { rescanAfterDays: number; monitorNotes: string[]; escalateWhen: string }
}

const GENERIC_PURCHASE_OPTIONS = [
  { label: 'Buy Locally', detail: 'Check with a verified dealer near you before purchasing any input.', icon: 'fa-store' },
  { label: 'Order Online', detail: 'Trusted agri-input partner — delivery in 2-3 days.', icon: 'fa-truck-fast' },
  { label: 'Call / SMS to Order', detail: 'SMS "HELP" to the Crop Rakshak helpline for a dealer callback.', icon: 'fa-comment-sms' },
  { label: 'Assisted Procurement', detail: 'Ask your nearest KVK about subsidised stock.', icon: 'fa-handshake-angle' },
]

const UNCERTAIN_SET: RecommendationSet = {
  immediateActions: [
    'Take 2-3 more close-up photos in good daylight (no shadows) and re-scan — this result is not confident enough to act on yet.',
    'Avoid spraying or applying fertilizer until the diagnosis is confirmed — acting on a low-confidence guess can do more harm than good.',
    'Check the surrounding plants — is the symptom spreading, isolated, or uniform across the field?',
  ],
  treatmentGuidance: [
    'Hold off on any chemical or fertilizer treatment until confidence improves with a clearer photo or officer visit.',
    'If symptoms worsen quickly (within 1-2 days), treat that as a signal to escalate immediately rather than wait.',
    'Follow locally approved agricultural guidance once a confirmed cause is available — consult an agricultural expert for the exact product and dose.',
  ],
  culturalPractices: [
    'Maintain good field hygiene and drainage while waiting for a clearer diagnosis.',
    'Avoid introducing any new chemical inputs that could complicate a future diagnosis.',
  ],
  safeUsage: ['No treatment is recommended yet — safe-usage guidance will appear once the diagnosis is confirmed.'],
  purchaseOptions: GENERIC_PURCHASE_OPTIONS,
  followUp: {
    rescanAfterDays: 2,
    monitorNotes: ['Re-scan within 2 days with a clearer, closer photo of the affected area.', 'Track whether the symptom spreads or stays the same.'],
    escalateWhen: 'Given the uncertainty, consider an Agriculture Officer visit within 2-3 days rather than waiting for further spread.',
  },
}

const BY_TYPE: Record<IssueType, Omit<RecommendationSet, 'purchaseOptions'>> = {
  disease: {
    immediateActions: [
      'Isolate and closely inspect nearby plants for similar symptoms — many diseases spread fast in humid conditions.',
      'Remove and destroy heavily infected leaves or plant parts if less than 10% of the field is affected.',
      'Avoid overhead irrigation for a few days to reduce leaf wetness, which favours most fungal/bacterial spread.',
    ],
    treatmentGuidance: [
      'Consult a local Krishi Vigyan Kendra (KVK) or agri-input dealer for the correct fungicide/bactericide for this specific finding — dosage and product depend on crop stage and local regulations.',
      'Spray during early morning or late evening; avoid spraying right before rain.',
      'Follow locally approved agricultural guidance and label instructions — do not exceed the recommended number of sprays per season without officer advice.',
    ],
    culturalPractices: [
      'Maintain balanced nutrition — excess nitrogen can increase susceptibility to some diseases.',
      'Ensure recommended plant spacing for good airflow.',
      'Consider crop rotation next season to break the disease cycle.',
    ],
    safeUsage: [
      'Wear gloves and a mask while spraying; wash hands and equipment after use.',
      'Keep children and animals away from the field for 24 hours post-spray.',
      'Store unused chemical in its original container, away from food and water sources.',
    ],
    followUp: {
      rescanAfterDays: 5,
      monitorNotes: ['Photograph the same plants each re-scan for consistent comparison.', 'Watch for the symptom spreading to new leaves or plants.'],
      escalateWhen: 'If more than 25% of the field is affected, or spread continues after treatment — escalate to your Agriculture Officer.',
    },
  },
  pest: {
    immediateActions: [
      'Check leaf undersides and stems across 5+ spots in the field for the pest described.',
      'Install yellow/blue sticky traps to monitor and reduce adult pest population where applicable.',
      'Remove and destroy heavily infested leaves to reduce pest load.',
    ],
    treatmentGuidance: [
      'Consult a local dealer or KVK for the right neem-based or chemical control for this specific pest — rotate chemical groups every 2 sprays to avoid resistance build-up.',
      'Avoid spraying during peak sun hours (11 AM-3 PM); early morning or evening is best.',
      'Prefer targeted, threshold-based spraying over blanket application, per locally approved guidance.',
    ],
    culturalPractices: [
      'Avoid planting the same crop next to an already-infested plot this season.',
      'Maintain field hygiene — remove weeds that can host the pest.',
      'Encourage natural predators where possible instead of broad-spectrum sprays.',
    ],
    safeUsage: [
      'Wear gloves and eye protection while spraying.',
      'Re-entry into a sprayed field only after 4-6 hours.',
      'Do not mix chemical and neem-based sprays together unless the label permits.',
    ],
    followUp: {
      rescanAfterDays: 4,
      monitorNotes: ['Count pests on traps every 2 days to track the population trend.', 'Watch new growth closely for continued or new damage.'],
      escalateWhen: 'If infestation spreads to more than 15% of plants despite treatment — escalate for expert guidance.',
    },
  },
  abiotic: {
    immediateActions: [
      'Check field drainage and irrigation — this issue is often linked to water or nutrient balance.',
      'Avoid any spraying until the cause is confirmed — treating the wrong issue can waste money and worsen the real problem.',
      'Compare affected vs. unaffected patches in the field for clues (e.g., low-lying vs. raised areas).',
    ],
    treatmentGuidance: [
      'If nutrient deficiency is confirmed, apply the relevant nutrient in split doses as per your state package of practice.',
      'If water stress is confirmed, adjust irrigation frequency accordingly rather than adding fertilizer.',
      'A soil test is the most reliable way to confirm before spending on inputs — consult an agricultural expert.',
    ],
    culturalPractices: [
      'Improve field drainage to avoid prolonged waterlogging.',
      'Avoid excess or uneven irrigation — consistency matters more than volume.',
      'Keep field bunds/edges clean and well-maintained.',
    ],
    safeUsage: [
      'If applying fertilizer, do so in dry field conditions, not standing water, to reduce nutrient loss.',
      'Store fertilizer bags off the ground and away from moisture.',
    ],
    followUp: {
      rescanAfterDays: 3,
      monitorNotes: ['Re-scan after any correction (irrigation/fertilizer change) to confirm improvement.', 'Track whether the pattern spreads to younger leaves (would suggest a different cause).'],
      escalateWhen: 'If there is no improvement after correction within a week, escalate to your Agriculture Officer or request a soil test.',
    },
  },
}

export function generateRecommendations(diagnosis: FusedDiagnosis): RecommendationSet {
  if (diagnosis.uncertain) return UNCERTAIN_SET
  return { ...BY_TYPE[diagnosis.primaryType], purchaseOptions: GENERIC_PURCHASE_OPTIONS }
}
