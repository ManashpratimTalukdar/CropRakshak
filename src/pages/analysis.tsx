export const AnalysisPage = ({ caseId }: { caseId: string }) => {
  const isLiveScan = caseId.startsWith('live-')
  return (
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-agri-500 to-tech-500 flex items-center justify-center text-white text-2xl mx-auto shadow-soft spin-slow">
          <i class="fa-solid fa-microchip"></i>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-4">Analyzing your crop…</h1>
        <p class="text-gray-500 mt-1">Fusing image, weather, history &amp; regional data into one diagnosis.</p>
      </div>

      {/* Connectivity chip */}
      <div class="flex justify-center mb-8">
        <div id="connectivity-chip" class="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-soft text-sm font-semibold">
          <span class="w-2.5 h-2.5 rounded-full bg-agri-500 pulse-ring"></span>
          <span id="connectivity-label">Good Internet — Full Features</span>
          <i class="fa-solid fa-chevron-down text-xs text-gray-400"></i>
        </div>
      </div>

      {/* Engine convergence diagram */}
      <div class="card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <svg viewBox="0 0 400 220" class="w-full h-auto max-w-md mx-auto">
          {/* connecting lines */}
          <line x1="70" y1="40" x2="200" y2="110" stroke="#8ed693" stroke-width="2" class="dash-flow" />
          <line x1="70" y1="110" x2="200" y2="110" stroke="#57a8ff" stroke-width="2" class="dash-flow" />
          <line x1="70" y1="180" x2="200" y2="110" stroke="#fbbf24" stroke-width="2" class="dash-flow" />
          <line x1="330" y1="110" x2="200" y2="110" stroke="#a377fa" stroke-width="2" class="dash-flow" />

          {/* nodes */}
          <g class="node-glow">
            <circle cx="70" cy="40" r="26" fill="#dcf3dd" stroke="#3aa843" stroke-width="2" />
            <text x="70" y="45" text-anchor="middle" font-size="18">🖼️</text>
          </g>
          <g class="node-glow" style="animation-delay:.3s">
            <circle cx="70" cy="110" r="26" fill="#d9ecff" stroke="#3186f5" stroke-width="2" />
            <text x="70" y="115" text-anchor="middle" font-size="18">🌦️</text>
          </g>
          <g class="node-glow" style="animation-delay:.6s">
            <circle cx="70" cy="180" r="26" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" />
            <text x="70" y="185" text-anchor="middle" font-size="18">🧠</text>
          </g>
          <g class="node-glow" style="animation-delay:.9s">
            <circle cx="330" cy="110" r="26" fill="#ede6ff" stroke="#8a52ef" stroke-width="2" />
            <text x="330" y="115" text-anchor="middle" font-size="18">🔎</text>
          </g>

          {/* center result node */}
          <circle cx="200" cy="110" r="34" fill="#215a27" />
          <text x="200" y="105" text-anchor="middle" font-size="11" fill="white" font-weight="700">AI</text>
          <text x="200" y="120" text-anchor="middle" font-size="9" fill="#dcf3dd">Result</text>
        </svg>
      </div>

      {/* Checklist */}
      <div class="card p-5 sm:p-6 space-y-3" id="analysis-checklist">
        {[
          { icon: 'fa-image', title: 'Image Analysis', desc: 'Detecting visual patterns on leaf surface & texture' },
          { icon: 'fa-cloud-sun-rain', title: 'Risk Prediction', desc: 'Combining weather, crop stage & field history' },
          { icon: 'fa-brain', title: 'Contextual Reasoning', desc: 'Cross-checking against regional outbreak data' },
          { icon: 'fa-magnifying-glass', title: 'Similarity Search', desc: 'Comparing against known disease & pest patterns' },
        ].map((s, i) => (
          <div class="flex items-center gap-4 p-3 rounded-xl analysis-step" data-idx={i}>
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 step-icon shrink-0">
              <i class={`fa-solid ${s.icon}`}></i>
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-800 text-sm">{s.title}</p>
              <p class="text-xs text-gray-500">{s.desc}</p>
            </div>
            <div class="step-status shrink-0">
              <i class="fa-solid fa-circle-notch text-gray-300"></i>
            </div>
          </div>
        ))}
      </div>

      <p class="text-center text-xs text-gray-400 mt-6">
        {isLiveScan
          ? 'This result came from a live Cloudflare Workers AI vision model call on your photo — weather & regional context shown alongside it are still simulated for this demo.'
          : 'Demo mode — showing a pre-seeded illustrative result. Upload your own photo on /scan to run the real AI model.'}
      </p>

      <div class="text-center mt-8" id="analysis-cta" style="display:none">
        <a href={`/diagnosis/${caseId}`} class="btn-primary inline-flex items-center gap-2"><i class="fa-solid fa-file-medical"></i> View Diagnosis</a>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.__ANALYSIS_REDIRECT__ = "/diagnosis/${caseId}";` }}></script>
    </main>
  )
}
