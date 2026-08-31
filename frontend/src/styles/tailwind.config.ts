// ============================================================================
// TAILWIND CDN THEME CONFIG
// Earthy, balanced agriculture palette — moss/olive green (crop), harvest
// gold (wheat/grain), clay terracotta (soil), and a warm stone neutral
// (replacing cold slate gray) so the whole site reads like a grounded farm
// product rather than a generic tech/SaaS dashboard.
// This is the custom Tailwind palette/theme extension consumed by
// frontend/src/components/Layout.tsx, which stringifies it and injects it
// as `tailwind.config = {...}` for the Tailwind CDN script.
// ============================================================================

export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        // Primary — moss/olive crop green
        agri: {
          50: '#f5f7ec', 100: '#e7edd2', 200: '#cddba3', 300: '#adc571', 400: '#8cab49',
          500: '#6d8f34', 600: '#54722a', 700: '#425923', 800: '#36471f', 900: '#2d3a1c',
        },
        // Secondary — harvest / ripe-wheat gold (replaces the old cool "tech" blue)
        tech: {
          50: '#fbf6e9', 100: '#f5e7bf', 200: '#eccd82', 300: '#e0b04e', 400: '#cf962f',
          500: '#b17c20', 600: '#8f631b', 700: '#734f1a', 800: '#5f421c', 900: '#50381c',
        },
        // Accent — clay / terracotta soil (replaces the old violet "eco")
        eco: {
          50: '#faf1ec', 100: '#f2ddce', 200: '#e3b89e', 300: '#d1936e', 400: '#ba7148',
          500: '#9f5730', 600: '#814527', 700: '#673922', 800: '#552f1f', 900: '#47291c',
        },
        // Warm stone neutral — overrides Tailwind's default cold slate "gray"
        // so every gray-* utility already used across the pages (text, bg,
        // borders) automatically reads as warm sand/soil instead of clinical
        // SaaS gray, with no need to touch each page individually.
        gray: {
          50: '#faf8f4', 100: '#f2eee5', 200: '#e5ddce', 300: '#cdc0a8', 400: '#a4936f',
          500: '#847357', 600: '#685a43', 700: '#544936', 800: '#413828', 900: '#332b1e',
        },
      },
      fontFamily: {
        // Humanist, grounded body face — replaces the ubiquitous "Inter"
        sans: ['Karla', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Warm display serif for headings/wordmark — gives the brand an
        // organic, editorial character instead of a generic app font
        serif: ['Fraunces', 'Georgia', 'ui-serif', 'serif'],
      },
      boxShadow: { soft: '0 2px 10px -2px rgba(65,48,28,0.10), 0 8px 22px -8px rgba(65,48,28,0.14)' },
    },
  },
}
