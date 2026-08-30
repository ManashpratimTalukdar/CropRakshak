export const HomePage = () => {
  return (
    <main>
      {/* ============== HERO ============== */}
      <section class="relative overflow-hidden bg-gradient-to-br from-agri-50 via-white to-tech-50">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-agri-200/40 rounded-full blur-3xl"></div>
        <div class="absolute top-40 -left-24 w-80 h-80 bg-tech-200/40 rounded-full blur-3xl"></div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div class="fade-up">
            <span class="inline-flex items-center gap-2 bg-white border border-agri-200 text-agri-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-soft">
              <i class="fa-solid fa-satellite-dish text-tech-500"></i> Smart India Hackathon Prototype
            </span>
            <h1 class="mt-5 text-4xl sm:text-5xl font-extrabold leading-[1.1] text-gray-900">
              Catch crop problems <span class="text-agri-600">early</span> — before they cost you the harvest.
            </h1>
            <p class="mt-3 text-lg font-semibold text-gray-500">
              Detect Early <span class="text-gray-300">•</span> Diagnose Right <span class="text-gray-300">•</span> Advise Smart <span class="text-gray-300">•</span> Act in Time <span class="text-gray-300">•</span> Protect Yield
            </p>
            <p class="mt-5 text-gray-600 text-base leading-relaxed max-w-lg">
              Snap a photo of your crop. Our AI separates <b class="text-agri-700">disease</b> from <b class="text-tech-700">pest</b> signs — most tools mix them up — and flags <b>subtle, early-stage symptoms</b>, not just obvious damage, with an honest confidence score every time.
            </p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
              <a href="/scan" class="btn-primary text-base inline-flex items-center gap-2">
                <i class="fa-solid fa-camera"></i> Scan Your Crop
              </a>
              <a href="/dashboard" class="btn-secondary text-base inline-flex items-center gap-2">
                <i class="fa-solid fa-chart-simple"></i> View Sample Dashboard
              </a>
            </div>
            <div class="mt-8 flex items-center gap-6 text-sm text-gray-500">
              <div class="flex items-center gap-2"><i class="fa-solid fa-signal text-agri-500"></i> Works on slow networks</div>
              <div class="flex items-center gap-2"><i class="fa-solid fa-language text-tech-500"></i> Multilingual by design</div>
            </div>
          </div>

          <div class="relative fade-up">
            <div class="relative rounded-3xl overflow-hidden shadow-soft border border-white/60 aspect-[4/3]">
              <img
                src="https://sspark.genspark.ai/cfimages?u1=fjIQ%2Fn9vGXtqXKKPlsk1%2B%2B9ICNWXv1xgbZjUnOVVfYM3Cc5X3LyAxU3iwp27OG%2B6iwXK1P0S0FMOP4VBC33xPgheNntU%2F3OHaktlORQ3&u2=6CJWRBhK9z6MaqfS&width=1200"
                alt="Farmer using a smartphone to check crop health in a field"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4 card px-4 py-3 flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-agri-100 flex items-center justify-center text-agri-600 shrink-0">
                  <i class="fa-solid fa-leaf"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-500">Latest scan result</p>
                  <p class="text-sm font-bold text-gray-900 truncate">Leaf Rust detected — early stage</p>
                </div>
                <span class="status-chip bg-amber-100 text-amber-700 shrink-0">82% confident</span>
              </div>
            </div>
            <div class="absolute -top-5 -right-5 card px-4 py-2.5 hidden sm:flex items-center gap-2 fade-up">
              <span class="w-2.5 h-2.5 rounded-full bg-agri-500 pulse-ring"></span>
              <span class="text-xs font-bold text-gray-700">Live regional monitoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============== HOW IT WORKS ============== */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-tech-600 font-bold text-sm tracking-wide uppercase">How it works</span>
          <h2 class="text-3xl font-extrabold text-gray-900 mt-2">One photo. A complete health check.</h2>
          <p class="text-gray-500 mt-3">Five simple stages take you from a worried glance at your field to a clear action plan.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {[
            { icon: 'fa-camera', title: 'Scan', desc: 'Photo + basic crop info', color: 'agri', href: '/scan' },
            { icon: 'fa-microchip', title: 'AI Analysis', desc: 'Image, weather & history fused', color: 'tech', href: '/scan' },
            { icon: 'fa-stethoscope', title: 'Diagnosis', desc: 'Disease, pest & stress split apart', color: 'amber', href: '/diagnosis/wheat-rust' },
            { icon: 'fa-clipboard-check', title: 'Recommendation', desc: 'Clear, safe next steps', color: 'orange', href: '/action/wheat-rust' },
            { icon: 'fa-arrows-rotate', title: 'Monitor', desc: 'Re-scan & track progress', color: 'eco', href: '/dashboard' },
          ].map((s, i) => (
            <a href={s.href} class="card card-hover p-5 text-center relative z-10">
              <div class={`w-12 h-12 mx-auto rounded-2xl bg-${s.color}-100 text-${s.color}-600 flex items-center justify-center text-lg mb-3`}>
                <i class={`fa-solid ${s.icon}`}></i>
              </div>
              <p class="text-xs font-bold text-gray-400 mb-1">STEP {i + 1}</p>
              <p class="font-bold text-gray-900">{s.title}</p>
              <p class="text-xs text-gray-500 mt-1">{s.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* ============== DIFFERENTIATOR STRIP ============== */}
      <section class="bg-gray-900 py-14">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          <div class="text-white">
            <div class="w-10 h-10 rounded-xl bg-agri-500/20 text-agri-400 flex items-center justify-center mb-4"><i class="fa-solid fa-code-compare"></i></div>
            <h3 class="font-bold text-lg mb-1">Disease ≠ Pest — kept separate</h3>
            <p class="text-gray-400 text-sm leading-relaxed">Most tools bundle disease and pest signs into one guess. We assess them as two distinct tracks, plus a third for abiotic stress — so your treatment actually matches the real cause.</p>
          </div>
          <div class="text-white">
            <div class="w-10 h-10 rounded-xl bg-tech-500/20 text-tech-400 flex items-center justify-center mb-4"><i class="fa-solid fa-magnifying-glass-chart"></i></div>
            <h3 class="font-bold text-lg mb-1">Built for early, subtle signs</h3>
            <p class="text-gray-400 text-sm leading-relaxed">We're tuned to flag faint early indicators worth monitoring — not only advanced, obvious damage that's already too late to act on cheaply.</p>
          </div>
          <div class="text-white">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4"><i class="fa-solid fa-gauge-high"></i></div>
            <h3 class="font-bold text-lg mb-1">Honest confidence, always</h3>
            <p class="text-gray-400 text-sm leading-relaxed">No overconfident single label. Every result ships with a visible confidence score, and if it's low, we say so — and ask for a better photo instead of guessing.</p>
          </div>
        </div>
      </section>

      {/* ============== IMPACT STRIP ============== */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-agri-600 font-bold text-sm tracking-wide uppercase">Impact</span>
          <h2 class="text-3xl font-extrabold text-gray-900 mt-2">Why early detection pays off</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: 'fa-stopwatch', title: 'Early Detection & Timely Action', desc: 'Spot problems days to weeks before visible damage spreads.', color: 'agri' },
            { icon: 'fa-wheat-awn', title: 'Reduced Crop Loss & Higher Yield', desc: 'Act while intervention is still cheap and effective.', color: 'tech' },
            { icon: 'fa-flask-vial', title: 'Reduced Unnecessary Pesticide Use', desc: 'Right diagnosis means fewer wasted, unneeded sprays.', color: 'amber' },
            { icon: 'fa-coins', title: 'Lower Cost & Higher Profit', desc: 'Fewer inputs wasted, less yield lost — better margins.', color: 'orange' },
            { icon: 'fa-database', title: 'Data-Driven Decisions', desc: 'Weather, soil & regional data combine with the image.', color: 'eco' },
            { icon: 'fa-people-group', title: 'Stronger Agricultural Ecosystem', desc: 'Farmers, officers, dealers & labs connected in one loop.', color: 'agri' },
          ].map((s) => (
            <div class="card card-hover p-6">
              <div class={`w-11 h-11 rounded-xl bg-${s.color}-100 text-${s.color}-600 flex items-center justify-center text-lg mb-4`}>
                <i class={`fa-solid ${s.icon}`}></i>
              </div>
              <p class="font-bold text-gray-900">{s.title}</p>
              <p class="text-sm text-gray-500 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============== ECOSYSTEM / ROLE PICKER ============== */}
      <section class="bg-eco-50 py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-10">
            <span class="text-eco-600 font-bold text-sm tracking-wide uppercase">One platform, every role</span>
            <h2 class="text-3xl font-extrabold text-gray-900 mt-2">Built for the whole ecosystem</h2>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            <a href="/scan" class="card card-hover p-6 border-t-4 border-agri-500">
              <div class="w-11 h-11 rounded-xl bg-agri-100 text-agri-600 flex items-center justify-center text-lg mb-4"><i class="fa-solid fa-user"></i></div>
              <p class="font-bold text-gray-900">Farmer</p>
              <p class="text-sm text-gray-500 mt-1.5">Scan crops, get plain-language advice, track your fields and re-scan over time.</p>
              <p class="text-sm font-semibold text-agri-700 mt-3">Start scanning <i class="fa-solid fa-arrow-right ml-1 text-xs"></i></p>
            </a>
            <a href="/admin" class="card card-hover p-6 border-t-4 border-tech-500">
              <div class="w-11 h-11 rounded-xl bg-tech-100 text-tech-600 flex items-center justify-center text-lg mb-4"><i class="fa-solid fa-user-shield"></i></div>
              <p class="font-bold text-gray-900">Agriculture Officer / Admin</p>
              <p class="text-sm text-gray-500 mt-1.5">Review escalated cases, monitor regional outbreak risk, and track model performance.</p>
              <p class="text-sm font-semibold text-tech-700 mt-3">Open officer view <i class="fa-solid fa-arrow-right ml-1 text-xs"></i></p>
            </a>
            <a href="/dealer" class="card card-hover p-6 border-t-4 border-amber-500">
              <div class="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-lg mb-4"><i class="fa-solid fa-store"></i></div>
              <p class="font-bold text-gray-900">Input Dealer / Diagnostic Lab</p>
              <p class="text-sm text-gray-500 mt-1.5">Receive referrals straight from the recommendation engine and fulfil farmer requests.</p>
              <p class="text-sm font-semibold text-amber-700 mt-3">Open dealer view <i class="fa-solid fa-arrow-right ml-1 text-xs"></i></p>
            </a>
          </div>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="rounded-3xl bg-gradient-to-br from-agri-600 to-tech-600 px-8 py-14 text-center relative overflow-hidden">
          <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white,transparent_35%)]"></div>
          <h2 class="text-white text-3xl font-extrabold relative">Don't wait for damage you can already see.</h2>
          <p class="text-agri-50 mt-3 max-w-xl mx-auto relative">A 2-minute scan today can save your whole season. Try the full flow with realistic demo data right now.</p>
          <a href="/scan" class="btn-primary bg-white text-agri-700 hover:bg-agri-50 mt-7 inline-flex items-center gap-2 relative shadow-none">
            <i class="fa-solid fa-camera"></i> Scan Your Crop Now
          </a>
        </div>
      </section>
    </main>
  )
}
