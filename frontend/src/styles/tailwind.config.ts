// ============================================================================
// TAILWIND CDN THEME CONFIG
// This is the custom Tailwind palette/theme extension previously inlined as
// a <script> in the renderer's <head>. Extracted here so the design tokens
// live under frontend/src/styles/ alongside the rest of the frontend's
// presentation layer. It is consumed by frontend/src/components/Layout.tsx,
// which stringifies it and injects it as `tailwind.config = {...}` for the
// Tailwind CDN script — identical behavior to before the reorg.
// ============================================================================

export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f1faf1', 100: '#dcf3dd', 200: '#b8e6bb', 300: '#8ed693', 400: '#5cc164',
          500: '#3aa843', 600: '#2b8a35', 700: '#256f2d', 800: '#215a27', 900: '#1c4a22',
        },
        tech: {
          50: '#eef6ff', 100: '#d9ecff', 200: '#b7dcff', 300: '#8ac6ff', 400: '#57a8ff',
          500: '#3186f5', 600: '#2166d1', 700: '#1c52a8', 800: '#1c4585', 900: '#1a3b6e',
        },
        eco: {
          50: '#f6f3ff', 100: '#ede6ff', 200: '#dccdff', 300: '#c1a4ff', 400: '#a377fa',
          500: '#8a52ef', 600: '#7638d6', 700: '#6329b0', 800: '#52258f', 900: '#421f74',
        },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: { soft: '0 2px 10px -2px rgba(16,24,32,0.08), 0 8px 24px -8px rgba(16,24,32,0.10)' },
    },
  },
}
