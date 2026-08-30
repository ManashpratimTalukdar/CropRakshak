import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }, c) => {
  const path = c.req.path
  const active = (p: string) => (path === p ? 'nav-link-active' : 'nav-link')

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>AgriSense AI — Crop Health Early Detection &amp; Management</title>
        <meta
          name="description"
          content="AI-powered crop health early detection and management system for Indian smallholder farmers. Separates disease vs pest detection, catches early-stage issues, and gives honest confidence scores."
        />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌿</text></svg>" />

        {/* Tailwind CDN + custom palette matching flowchart stage colors */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    agri: {
                      50:'#f1faf1',100:'#dcf3dd',200:'#b8e6bb',300:'#8ed693',400:'#5cc164',
                      500:'#3aa843',600:'#2b8a35',700:'#256f2d',800:'#215a27',900:'#1c4a22'
                    },
                    tech: {
                      50:'#eef6ff',100:'#d9ecff',200:'#b7dcff',300:'#8ac6ff',400:'#57a8ff',
                      500:'#3186f5',600:'#2166d1',700:'#1c52a8',800:'#1c4585',900:'#1a3b6e'
                    },
                    eco: {
                      50:'#f6f3ff',100:'#ede6ff',200:'#dccdff',300:'#c1a4ff',400:'#a377fa',
                      500:'#8a52ef',600:'#7638d6',700:'#6329b0',800:'#52258f',900:'#421f74'
                    }
                  },
                  fontFamily: { sans: ['Inter','ui-sans-serif','system-ui','sans-serif'] },
                  boxShadow: { soft: '0 2px 10px -2px rgba(16,24,32,0.08), 0 8px 24px -8px rgba(16,24,32,0.10)' }
                }
              }
            }
          `,
          }}
        ></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
      </head>
      <body class="bg-gray-50 text-gray-800 font-sans antialiased">
        {/* ===================== HEADER ===================== */}
        <header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
              <a href="/" class="flex items-center gap-2 shrink-0">
                <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-agri-500 to-tech-500 flex items-center justify-center text-white text-lg shadow-soft">🌿</span>
                <span class="font-extrabold text-lg text-gray-900 leading-tight">AgriSense <span class="text-agri-600">AI</span></span>
              </a>

              <nav class="hidden lg:flex items-center gap-1 text-sm font-medium">
                <a href="/" class={active('/')}>Home</a>
                <a href="/scan" class={active('/scan')}>Scan Crop</a>
                <a href="/dashboard" class={active('/dashboard')}>My Dashboard</a>
                <a href="/seed" class={active('/seed')}>Seed Check</a>
                <div class="w-px h-5 bg-gray-200 mx-1"></div>
                <a href="/admin" class={active('/admin') + ' flex items-center gap-1.5'}><i class="fa-solid fa-user-shield text-xs"></i> Officer View</a>
                <a href="/dealer" class={active('/dealer') + ' flex items-center gap-1.5'}><i class="fa-solid fa-store text-xs"></i> Dealer/Lab View</a>
              </nav>

              <div class="flex items-center gap-2">
                <div class="relative hidden sm:block">
                  <select id="lang-select" class="appearance-none text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 pl-8 pr-7 py-2 rounded-full cursor-pointer border-0 focus:ring-2 focus:ring-agri-400">
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="te">తెలుగు (Telugu)</option>
                    <option value="or">ଓଡ଼ିଆ (Odia)</option>
                  </select>
                  <i class="fa-solid fa-globe absolute left-2.5 top-2.5 text-gray-400 text-xs pointer-events-none"></i>
                  <i class="fa-solid fa-chevron-down absolute right-2.5 top-3 text-gray-400 text-[10px] pointer-events-none"></i>
                </div>
                <a href="/scan" class="hidden sm:inline-flex items-center gap-2 bg-agri-600 hover:bg-agri-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-soft transition">
                  <i class="fa-solid fa-camera"></i> Scan Your Crop
                </a>
                <button id="mobile-menu-btn" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                  <i class="fa-solid fa-bars text-gray-700"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile nav drawer */}
          <div id="mobile-menu" class="hidden lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            <a href="/" class="mobile-nav-link"><i class="fa-solid fa-house w-5"></i> Home</a>
            <a href="/scan" class="mobile-nav-link"><i class="fa-solid fa-camera w-5"></i> Scan Crop</a>
            <a href="/dashboard" class="mobile-nav-link"><i class="fa-solid fa-chart-simple w-5"></i> My Dashboard</a>
            <a href="/seed" class="mobile-nav-link"><i class="fa-solid fa-seedling w-5"></i> Seed Check</a>
            <a href="/admin" class="mobile-nav-link"><i class="fa-solid fa-user-shield w-5"></i> Officer View</a>
            <a href="/dealer" class="mobile-nav-link"><i class="fa-solid fa-store w-5"></i> Dealer/Lab View</a>
          </div>
        </header>

        {children}

        {/* ===================== FOOTER ===================== */}
        <footer class="bg-gray-900 text-gray-300 mt-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div class="col-span-1 sm:col-span-2 lg:col-span-1">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-agri-500 to-tech-500 flex items-center justify-center text-white text-sm">🌿</span>
                <span class="font-bold text-white">AgriSense AI</span>
              </div>
              <p class="text-sm text-gray-400 leading-relaxed">Detect Early • Diagnose Right • Advise Smart • Act in Time • Protect Yield.</p>
              <p class="text-xs text-gray-500 mt-3">A Smart India Hackathon prototype for smallholder &amp; marginal farmers.</p>
            </div>
            <div>
              <h4 class="text-white font-semibold text-sm mb-3">Farmer Tools</h4>
              <ul class="space-y-2 text-sm">
                <li><a href="/scan" class="hover:text-agri-400">Scan Your Crop</a></li>
                <li><a href="/dashboard" class="hover:text-agri-400">My Dashboard</a></li>
                <li><a href="/seed" class="hover:text-agri-400">Seed Verification</a></li>
                <li><a href="/action/wheat-rust" class="hover:text-agri-400">Sample Recommendation</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-white font-semibold text-sm mb-3">Ecosystem</h4>
              <ul class="space-y-2 text-sm">
                <li><a href="/admin" class="hover:text-agri-400">Officer / Admin View</a></li>
                <li><a href="/dealer" class="hover:text-agri-400">Dealer &amp; Lab View</a></li>
                <li><a href="#help" class="hover:text-agri-400">KVK &amp; Extension Services</a></li>
                <li><a href="#help" class="hover:text-agri-400">Weather &amp; Advisory</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-white font-semibold text-sm mb-3">Connectivity Modes</h4>
              <ul class="space-y-2 text-sm text-gray-400">
                <li><i class="fa-solid fa-wifi text-agri-400 mr-1.5"></i> Full features on good internet</li>
                <li><i class="fa-solid fa-signal text-amber-400 mr-1.5"></i> Compressed mode on low bandwidth</li>
                <li><i class="fa-solid fa-plane-slash text-eco-400 mr-1.5"></i> Offline local inference</li>
                <li><i class="fa-solid fa-comment-sms text-tech-400 mr-1.5"></i> SMS / IVR fallback</li>
              </ul>
            </div>
          </div>
          <div class="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
            © 2026 AgriSense AI — Hackathon prototype. All crop/pest data shown is simulated for demonstration.
          </div>
        </footer>

        <script src="/static/app.js"></script>
      </body>
    </html>
  )
})
