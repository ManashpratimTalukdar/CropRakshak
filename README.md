# AgriSense AI — Crop Health Early Detection & Management System

**Tagline:** Detect Early • Diagnose Right • Advise Smart • Act in Time • Protect Yield

A Smart India Hackathon–style prototype: an AI-powered agritech platform for Indian smallholder and marginal farmers. Built as a complete, navigable multi-page website with realistic mock data — no live ML/weather backend required to demo the full flow.

## Project Overview
- **Goal**: Give farmers an early, honest, and specific crop-health diagnosis (disease vs. pest vs. abiotic stress kept separate) with plain-language, actionable advice — plus dashboards for Agriculture Officers and Input Dealers/Labs.
- **Key differentiators baked into the product**:
  1. **Disease vs. Pest separation** — most competing tools bundle them into one guess; this system evaluates three parallel tracks (🌿 Disease, 🐛 Pest, 🌾 Abiotic/Other Stress).
  2. **Early / subtle-signs focus** — tuned to flag faint early indicators worth monitoring, not just obvious advanced damage.
  3. **Honest confidence scoring** — every result shows a visible confidence meter; low-confidence results trigger an explicit "we need a clearer photo" prompt instead of a falsely confident label.

## Tech Stack
- **Backend**: Hono (TypeScript) on Cloudflare Workers/Pages
- **Frontend**: Server-rendered JSX (Hono/jsx) + Tailwind CDN + vanilla JS (`public/static/app.js`) + Chart.js (admin analytics)
- **Data**: All mock/simulated, defined in `src/lib/data.ts` — 3 demo crops (Wheat/Leaf Rust, Tomato/Whitefly, Rice/Nutrient-uncertain) covering a confident disease case, a confident pest case, and a deliberately low-confidence/uncertain abiotic case.

## Site Map / Routes
| Route | Description |
|---|---|
| `/` | Landing page — hero, "How it works", differentiator strip, impact stats, role picker |
| `/scan` | Farmer-facing 6-step guided scan flow (Photo → Crop/Field → Soil* → Irrigation* → History* → Review). *optional steps, skippable |
| `/analysis/:caseId` | Animated "AI is analyzing" screen — engine convergence diagram, checklist, simulated connectivity-mode chip (Good Internet / Low Bandwidth / Offline / SMS-IVR) |
| `/diagnosis/:caseId` | Results page — 3-way Disease/Pest/Abiotic split, confidence meters, risk levels, alternatives, uncertainty banner when confidence is low |
| `/action/:caseId` | Recommendations — immediate actions, treatment guidance, cultural practices, safe-usage, purchase options, help directory, follow-up plan, Ecosystem Connect panel |
| `/dashboard` | Farmer dashboard — feedback loop visual, crop portfolio, scan history with thumbs-up/down feedback |
| `/seed` | Seed Verification & QA tool — batch lookup, authenticity badge (Trusted/Caution/Not Trusted), quality meters, traceability timeline. Try `?batch=SB-WH-88123`, `SB-TM-51042`, or `SB-RC-30099` |
| `/admin` | Agriculture Officer/Admin dashboard — regional hotspots, escalation queue, disease-vs-pest & confidence-trend charts, continuous-learning panel, farmer directory |
| `/dealer` | Input Dealer / Diagnostic Lab view — incoming referrals from the recommendation engine |

Demo case IDs used across routes: `wheat-rust`, `tomato-whitefly`, `rice-nutrient`.

## Data Architecture
- No live database — all data is defined as typed mock objects in `src/lib/data.ts` (diagnosis cases, help-provider directory, portfolio/history, seed batches, admin analytics, dealer referrals).
- Clearly labeled as simulated/demo data throughout the UI footer and analysis screen.
- In a production build this would be backed by Cloudflare D1 (structured case/farmer data) + R2 (photo storage) + a real inference service.

## User Guide
- **Farmers**: Start at `/scan`, choose a crop (Wheat/Tomato/Rice — each maps to a different demo outcome), step through the flow (or hit "Skip optional details"), then "Analyze My Crop" to see the animated AI screen → diagnosis → recommendations. Visit `/dashboard` to see portfolio/history and give feedback.
- **Officers**: Visit `/admin` for hotspots, escalation queue, and analytics charts.
- **Dealers/Labs**: Visit `/dealer` to see referral cards routed from the recommendation engine.

## Not Yet Implemented (by design, for hackathon scope)
- Real ML inference, live weather API, and live geolocation/map picker (all simulated).
- Real multilingual translation (language selector present in header, wired to English only — shows a "coming soon" toast for other languages).
- Persistent storage (D1/R2) — everything is in-memory mock data per page load.
- Real SMS/IVR integration (connectivity chip is a visual simulation only).

## Recommended Next Steps
1. Wire `/scan` photo submission to a real image-classification model (or Cloudflare AI binding).
2. Add Cloudflare D1 for persisting farmer scans, feedback, and admin case review state.
3. Integrate a real weather API (e.g., OpenWeatherMap) for the auto-pulled context card.
4. Add real map picker (Leaflet/Mapbox) for field location in the scan flow and hotspot map in `/admin`.
5. Build out full i18n (Hindi/Marathi/Telugu/Odia) for farmer-facing screens.

## Local Development
```bash
npm install
npm run build
pm2 start ecosystem.config.cjs   # or: npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

## Deployment
- **Platform**: Cloudflare Pages (Hono + Workers runtime)
- **Status**: Ready for deploy — no D1/KV/R2 bindings required for this prototype (all data is mocked in-code).
