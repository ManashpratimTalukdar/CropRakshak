# CropRakshak — Architecture

This document describes the `frontend/` / `backend/` folder split introduced
by the repository reorganization, what lives where, and how the Cloudflare
Pages build/deploy flow works. **No routes, behavior, the AI binding, or
mock data shape changed** — this was a pure file-move + import-path fix.

## Folder layout

```
CropRakshak/
├── frontend/
│   ├── public/
│   │   └── static/          # Static assets served verbatim at /static/*
│   │       ├── app.js        #   vanilla JS (mobile menu, scan wizard, charts, etc.)
│   │       └── style.css     #   custom CSS (cards, buttons, meters, nav, animations)
│   └── src/
│       ├── components/       # Reusable JSX fragments
│       │   ├── Header.tsx    #   top nav (desktop + mobile drawer)
│       │   ├── Footer.tsx    #   site footer
│       │   └── Layout.tsx    #   jsxRenderer: <html> shell + Tailwind CDN config,
│       │                     #   wraps every page with Header/Footer
│       ├── pages/            # One file per route's server-rendered JSX page
│       │   ├── home.tsx
│       │   ├── scan.tsx
│       │   ├── analysis.tsx
│       │   ├── diagnosis.tsx
│       │   ├── action.tsx
│       │   ├── dashboard.tsx
│       │   ├── seed.tsx
│       │   ├── admin.tsx
│       │   └── dealer.tsx
│       └── styles/
│           └── tailwind.config.ts  # Custom Tailwind theme (agri/tech/eco palette),
│                                   # injected into Layout.tsx's <head> for the
│                                   # Tailwind CDN script
│
├── backend/
│   └── src/
│       ├── index.tsx          # Hono app entry point — mounts all route modules
│       │                      # + the /static/* serveStatic middleware + Layout renderer
│       ├── routes/            # Hono route handlers, split by resource
│       │   ├── pages.tsx      #   GET / , /scan , /analysis/:caseId? , /dashboard
│       │   ├── diagnosis.tsx  #   GET /diagnosis/:caseId
│       │   ├── action.tsx     #   GET /action/:caseId
│       │   ├── scan.tsx       #   POST /api/scan (live AI inference)
│       │   ├── seed.tsx       #   GET /seed
│       │   ├── admin.tsx      #   GET /admin
│       │   └── dealer.tsx     #   GET /dealer
│       ├── services/
│       │   └── ai.ts          # Cloudflare Workers AI binding logic — calls
│       │                      # @cf/meta/llama-3.2-11b-vision-instruct, with a
│       │                      # transparent heuristic fallback if the AI binding
│       │                      # is unavailable
│       └── lib/
│           ├── data.ts        # Seeded demo cases, RUNTIME_CASES map,
│           │                  # buildCaseFromAssessment(), help-provider
│           │                  # directory, dealer referrals, admin analytics
│           │                  # mock data — the app's whole mock data layer
│           └── types.ts       # Shared Bindings type (env.AI)
│
├── docs/
│   └── ARCHITECTURE.md        # This file
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.jsonc
└── ecosystem.config.cjs
```

## Why this split

- **`frontend/`** owns everything that produces HTML/CSS/JS delivered to the
  browser: JSX page components, shared JSX fragments (Header/Footer/Layout),
  the Tailwind theme config, and static assets (`app.js`, `style.css`).
- **`backend/`** owns everything that runs on the Cloudflare Worker at
  request time: Hono route wiring, the `/api/scan` handler, the Workers AI
  service wrapper, and the mock/seeded data layer.
- Pages under `frontend/src/pages` are still plain functions that return
  Hono/JSX (`hono/jsx`) — they have **no server logic**, only presentation.
  All actual request handling (param parsing, data lookup, `c.render(...)`)
  lives in `backend/src/routes/*`, which import the page components from
  `frontend/src/pages/*`.

## Path aliases

Because pages now live under `frontend/` but are imported from route
handlers under `backend/`, and route handlers need the data layer that lives
under `backend/src/lib`, two path aliases are configured in **both**
`tsconfig.json` (for the TypeScript compiler/editor) and `vite.config.ts`
(for the actual bundler resolution):

| Alias         | Resolves to        |
|---------------|---------------------|
| `@frontend/*` | `frontend/src/*`    |
| `@backend/*`  | `backend/src/*`     |

Example: `backend/src/routes/diagnosis.tsx` imports
`import { DiagnosisPage } from '@frontend/pages/diagnosis'` and
`import { CASES, getCase } from '../lib/data'` (relative, since both files
are inside `backend/src`).

## Build & deploy flow (Cloudflare Pages)

Nothing about the actual build/deploy mechanics changed — only the source
paths that feed into it:

1. `vite.config.ts` sets:
   - `publicDir: 'frontend/public'` — Vite copies this directory verbatim
     into the build output (`dist/static/*`), same behavior as the old
     project-root `public/` directory.
   - The `@hono/vite-build/cloudflare-pages` and `@hono/vite-dev-server`
     plugins are pointed at the new entry point, `backend/src/index.tsx`
     (previously `src/index.tsx`).
   - `resolve.alias` wires up `@frontend/*` and `@backend/*` for the actual
     module resolution during build/dev.
2. `npm run build` (→ `vite build`) bundles `backend/src/index.tsx` (which
   pulls in all routes, services, lib, and — transitively — the frontend
   pages/components) into a single `dist/_worker.js`, and writes
   `dist/_routes.json` excluding `/static/*` so Cloudflare Pages serves
   those files as static assets instead of invoking the Worker.
3. `wrangler.jsonc` still points `pages_build_output_dir` at `./dist` (this
   didn't need to change — Vite's build output directory is unaffected by
   where the *source* files live) and preserves the `ai: { binding: "AI" }`
   block exactly as before, giving `backend/src/services/ai.ts` access to
   `c.env.AI` (the real `@cf/meta/llama-3.2-11b-vision-instruct` model) once
   deployed to Cloudflare.
4. `npx wrangler pages dev dist --ip 0.0.0.0 --port 3000` serves the built
   `dist/` output locally, exactly as before the reorg.

## What did *not* change

- Route URLs (`/`, `/scan`, `/analysis/:caseId?`, `/diagnosis/:caseId`,
  `/action/:caseId`, `POST /api/scan`, `/dashboard`, `/seed`, `/admin`,
  `/dealer`).
- The Cloudflare Workers AI model call, request/response shape, or the
  heuristic fallback logic in `backend/src/services/ai.ts` (formerly
  `src/lib/ai.ts`).
- Any mock data shape in `backend/src/lib/data.ts` (formerly
  `src/lib/data.ts`) — cases, directory, portfolio, seed batches, hotspots,
  analytics, referrals, `buildCaseFromAssessment`, `RUNTIME_CASES`, etc.
- The `ai: { binding: "AI" }` block in `wrangler.jsonc`.
- `pages_build_output_dir: "./dist"` in `wrangler.jsonc`.
