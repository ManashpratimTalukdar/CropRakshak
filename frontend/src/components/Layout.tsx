// ============================================================================
// PAGE LAYOUT — jsxRenderer that wraps every route's page component with the
// shared <html> shell, <head> (Tailwind CDN + theme, fonts, icons, styles),
// Header and Footer. This replaces the old top-level src/renderer.tsx; the
// Header/Footer JSX was split out into their own components per the
// frontend/backend reorg.
// ============================================================================

import { jsxRenderer } from 'hono/jsx-renderer'
import { Header } from './Header'
import { Footer } from './Footer'
import { tailwindConfig } from '../styles/tailwind.config'

export const renderer = jsxRenderer(({ children }, c) => {
  const path = c.req.path

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CropRakshak — Crop Health Early Detection &amp; Management</title>
        <meta
          name="description"
          content="AI-powered crop health early detection and management system for Indian smallholder farmers. Separates disease vs pest detection, catches early-stage issues, and gives honest confidence scores."
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌿</text></svg>" />

        {/* Tailwind CDN + custom palette matching flowchart stage colors */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `tailwind.config = ${JSON.stringify(tailwindConfig)}`,
          }}
        ></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
      </head>
      <body class="bg-gray-50 text-gray-800 font-sans antialiased">
        <Header path={path} />

        {children}

        <Footer />

        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
