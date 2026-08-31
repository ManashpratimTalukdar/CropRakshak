// ============================================================================
// HEADER — top navigation bar (desktop + mobile drawer)
// Extracted from the old renderer.tsx as a reusable JSX fragment.
// ============================================================================

export const Header = ({ path }: { path: string }) => {
  const active = (p: string) => (path === p ? 'nav-link-active' : 'nav-link')

  return (
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <a href="/" class="flex items-center gap-2 shrink-0">
            <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-agri-500 to-tech-500 flex items-center justify-center text-white text-lg shadow-soft">🌿</span>
            <span class="font-extrabold text-lg text-gray-900 leading-tight">Crop<span class="text-agri-600">Rakshak</span></span>
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
  )
}
