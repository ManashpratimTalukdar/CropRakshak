# CropRakshak — Crop Health Early Detection & Management System

**Tagline:** Detect Early • Diagnose Right • Advise Smart • Act in Time • Protect Yield

A Smart India Hackathon–style prototype: an AI-powered agritech platform for Indian smallholder and marginal farmers. Built as a complete, navigable multi-page website with realistic mock data for most of the ecosystem — but `/scan` photo submissions now run through a **real Cloudflare Workers AI vision model** (see "Live AI Image Classification" below), with weather/regional/dashboard/admin data still mocked.

## Project Overview
- **Goal**: Give farmers an early, honest, and specific crop-health diagnosis (disease vs. pest vs. abiotic stress kept separate) with plain-language, actionable advice — plus dashboards for Agriculture Officers and Input Dealers/Labs.
- **Key differentiators baked into the product**:
  1. **Disease vs. Pest separation** — most competing tools bundle them into one guess; this system evaluates three parallel tracks (🌿 Disease, 🐛 Pest, 🌾 Abiotic/Other Stress).
  2. **Early / subtle-signs focus** — tuned to flag faint early indicators worth monitoring, not just obvious advanced damage.
  3. **Honest confidence scoring** — every result shows a visible confidence meter; low-confidence results trigger an explicit "we need a clearer photo" prompt instead of a falsely confident label.

## Tech Stack
- **Backend**: Hono (TypeScript) on Cloudflare Workers/Pages — routes, services, and mock data now live under `backend/src/` (see `docs/ARCHITECTURE.md`)
- **AI**: Cloudflare Workers AI (`@cf/meta/llama-3.2-11b-vision-instruct`) via the native `AI` binding for real `/scan` photo classification — see `backend/src/services/ai.ts`
- **Frontend**: Server-rendered JSX (Hono/jsx) + Tailwind CDN + vanilla JS (`frontend/public/static/app.js`) + Chart.js (admin analytics) — page components, shared Header/Footer/Layout, and the Tailwind theme now live under `frontend/src/`
- **Data**: Seeded demo cases (Wheat/Leaf Rust, Tomato/Whitefly, Rice/Nutrient-uncertain) in `backend/src/lib/data.ts`; live-scanned cases are built at request time from the AI model's output into the same shape and held in an in-memory runtime map (see "Known limitation" below).

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
- No live database — all data is defined as typed mock objects in `backend/src/lib/data.ts` (diagnosis cases, help-provider directory, portfolio/history, seed batches, admin analytics, dealer referrals).
- Clearly labeled as simulated/demo data throughout the UI footer and analysis screen.
- In a production build this would be backed by Cloudflare D1 (structured case/farmer data) + R2 (photo storage) + a real inference service.

## User Guide
- **Farmers**: Start at `/scan`, choose a crop (Wheat/Tomato/Rice — each maps to a different demo outcome), step through the flow (or hit "Skip optional details"), then "Analyze My Crop" to see the animated AI screen → diagnosis → recommendations. Visit `/dashboard` to see portfolio/history and give feedback.
- **Officers**: Visit `/admin` for hotspots, escalation queue, and analytics charts.
- **Dealers/Labs**: Visit `/dealer` to see referral cards routed from the recommendation engine.

## Live AI Image Classification (NEW)
The `/scan` flow now wires real photo submissions to **Cloudflare Workers AI**:
- **Binding**: `wrangler.jsonc` declares `ai: { binding: "AI" }`. No API keys/secrets needed — Workers AI is billed to your Cloudflare account per-request once deployed.
- **Model**: `@cf/meta/llama-3.2-11b-vision-instruct` (Meta's vision-language model) is called with a strict JSON schema asking it to independently score disease / pest / abiotic likelihoods — matching this app's existing 3-way split data model exactly (see `backend/src/services/ai.ts`).
- **Flow**: On the scan review step, uploading a real photo and clicking "Analyze My Crop" POSTs a `multipart/form-data` request to `POST /api/scan` (`backend/src/routes/scan.tsx`), which converts the photo to a base64 data URL, calls `env.AI.run(...)`, and builds a full `DiagnosisCase` (`buildCaseFromAssessment` in `backend/src/lib/data.ts`) from the model's structured output — rendered by the exact same `/diagnosis/:caseId` and `/action/:caseId` pages used for the seeded demo cases.
- **Graceful fallback**: If the AI binding is unavailable (e.g. local dev without a Cloudflare account, or a transient model error), the endpoint falls back to a clearly-labeled, deliberately low-confidence heuristic response rather than breaking the flow or faking certainty — consistent with the app's "honest confidence scoring" principle.
- **"Use a sample photo" shortcut** still routes to the original static demo cases (`wheat-rust` / `tomato-whitefly` / `rice-nutrient`), since there's no real photo to send to the model in that path.
- **Known limitation**: live-scanned cases are kept in an in-memory `Map` for the life of the Worker isolate (see `RUNTIME_CASES` in `backend/src/lib/data.ts`) — there is no durable storage yet, so a case can disappear if the isolate recycles. See "Recommended Next Steps" below for wiring this to D1.

## Not Yet Implemented (by design, for hackathon scope)
- Live weather API and live geolocation/map picker (still simulated).
- Real multilingual translation (language selector present in header, wired to English only — shows a "coming soon" toast for other languages).
- Persistent/durable storage (D1/R2) for live-scanned cases — they live in Worker-isolate memory only (see limitation above); seeded demo cases remain in-memory mock data as before.
- Real SMS/IVR integration (connectivity chip is a visual simulation only).

## Recommended Next Steps
1. ~~Wire `/scan` photo submission to a real image-classification model (or Cloudflare AI binding).~~ ✅ Done — see "Live AI Image Classification" above.
2. Add Cloudflare D1 for persisting farmer scans, feedback, and admin case review state (would also make live-scanned cases durable across isolate recycles — see known limitation above).
3. Integrate a real weather API (e.g., OpenWeatherMap) for the auto-pulled context card (currently placeholder text for live scans, mock data for seeded demo cases).
4. Add real map picker (Leaflet/Mapbox) for field location in the scan flow and hotspot map in `/admin`.
5. Build out full i18n (Hindi/Marathi/Telugu/Odia) for farmer-facing screens.
6. Add real regional outbreak-signal aggregation (currently placeholder for live scans).

## Local Development
```bash
npm install
npm run build
pm2 start ecosystem.config.cjs   # or: npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```
**Note on the `ai` binding locally**: Workers AI has no local simulation — `wrangler pages dev` / `vite dev` always try to open a *remote* proxy session for the `AI` binding, which requires `wrangler login` (or a `CLOUDFLARE_API_TOKEN` env var) to succeed. Without Cloudflare credentials in your local/sandbox environment, the dev server will fail to boot with the `ai` binding present. Options:
- Run `npx wrangler login` once, then `npm run dev` / `pm2 start ecosystem.config.cjs` as usual — `/api/scan` will call the real model even locally.
- Or temporarily comment out the `ai` block in `wrangler.jsonc` while doing unrelated local UI work — `/api/scan` will then use the clearly-labeled heuristic fallback in `backend/src/services/ai.ts` instead of failing to boot. Restore it before deploying.

## Folder Structure
The repo is split into `frontend/` (JSX page components, shared Header/Footer/Layout, Tailwind theme, static assets) and `backend/` (Hono route handlers, the Workers AI service, and the mock data layer). See **`docs/ARCHITECTURE.md`** for the full breakdown, path-alias setup (`@frontend/*`, `@backend/*`), and how the Cloudflare Pages build/deploy flow maps onto it.

## Deployment
- **Platform**: Cloudflare Pages (Hono + Workers runtime)
- **Status**: Ready for deploy. `wrangler.jsonc` declares the `ai` binding (`AI`) used by `POST /api/scan` — Cloudflare Pages provisions this automatically on deploy, no extra dashboard configuration, secrets, or API keys required. No D1/KV/R2 bindings are required for this prototype (all other data is mocked in-code).
