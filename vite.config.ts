import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const rootDir = import.meta.dirname

// Entry point now lives under backend/src (Hono route handlers), per the
// frontend/backend reorg. Static assets (frontend/public/static/*) are
// served via Hono's serveStatic middleware, same as before — just moved.
const ENTRY = 'backend/src/index.tsx'

export default defineConfig({
  // Vite's publicDir (copied as-is into the build output) now lives under
  // frontend/public instead of the project-root public/.
  publicDir: 'frontend/public',
  resolve: {
    alias: {
      '@frontend': resolve(rootDir, 'frontend/src'),
      '@backend': resolve(rootDir, 'backend/src'),
    },
  },
  plugins: [
    build({
      entry: ENTRY,
    }),
    devServer({
      adapter,
      entry: ENTRY,
    }),
  ],
})
