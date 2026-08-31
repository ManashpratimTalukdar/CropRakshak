import { HOTSPOTS, FARMER_DIRECTORY, ANALYTICS, riskColor, statusColor } from '@backend/lib/data'

export const AdminPage = () => {
  const escalated = FARMER_DIRECTORY.filter((f) => f.status === 'Escalated')

  return (
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 text-xs font-bold text-tech-600 uppercase tracking-wide">
            <i class="fa-solid fa-user-shield"></i> Agriculture Officer / Admin View
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-agri-900 mt-1">Regional Crop Health Overview</h1>
          <p class="text-gray-500 mt-1 text-sm">Analytics are aggregated from <b>approved farmer scans only</b> — not raw unreviewed submissions.</p>
        </div>
        <span class="status-chip bg-tech-100 text-tech-700"><i class="fa-solid fa-database mr-1"></i> Nashik · Anantapur · Khordha Divisions</span>
      </div>

      {/* KPI cards */}
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Approved Cases', val: '1,284', icon: 'fa-folder-open', color: 'agri' },
          { label: 'Escalation Queue', val: escalated.length, icon: 'fa-triangle-exclamation', color: 'red' },
          { label: 'Active Hotspots', val: HOTSPOTS.filter(h=>h.riskLevel==='High'||h.riskLevel==='Critical').length, icon: 'fa-map-location-dot', color: 'orange' },
          { label: 'Avg. Model Confidence', val: ANALYTICS.confidenceTrend[ANALYTICS.confidenceTrend.length-1] + '%', icon: 'fa-gauge-high', color: 'tech' },
        ].map((k) => (
          <div class="card p-4 sm:p-5">
            <div class={`w-9 h-9 rounded-lg bg-${k.color}-100 text-${k.color}-600 flex items-center justify-center text-sm mb-2`}><i class={`fa-solid ${k.icon}`}></i></div>
            <p class="text-xl sm:text-2xl font-extrabold text-gray-900">{k.val}</p>
            <p class="text-xs text-gray-500">{k.label}</p>
          </div>
        ))}
      </div>

      <div class="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Hotspot grid (map substitute) */}
        <div class="lg:col-span-2 card p-5 sm:p-6">
          <h2 class="font-display font-bold text-agri-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-map-location-dot text-orange-600"></i> Risk hotspots by block</h2>
          <div class="grid sm:grid-cols-2 gap-3">
            {HOTSPOTS.map((h) => {
              const rc = riskColor(h.riskLevel)
              return (
                <div class={`rounded-md p-4 border ${rc.ring} ${rc.bg}`}>
                  <div class="flex justify-between items-start">
                    <p class="font-bold text-sm text-gray-900">{h.region}</p>
                    <span class={`status-chip ${rc.bg} ${rc.text} ring-1 ${rc.ring}`}>{h.riskLevel}</span>
                  </div>
                  <p class="text-xs text-gray-600 mt-1">{h.crop} · {h.dominantIssue}</p>
                  <p class="text-xs font-semibold text-gray-500 mt-2">{h.cases} approved cases</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Escalation queue */}
        <div class="card p-5 sm:p-6">
          <h2 class="font-display font-bold text-agri-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-bell text-red-500"></i> Escalation queue</h2>
          <div class="space-y-3">
            {escalated.map((f) => {
              const rc = riskColor(f.riskLevel)
              return (
                <a href={`/diagnosis/${f.caseId}`} class="block rounded-md border border-gray-100 p-3 hover:border-red-200 hover:bg-red-50/50 transition">
                  <div class="flex justify-between items-start">
                    <p class="font-semibold text-sm text-gray-900">{f.name}</p>
                    <span class={`status-chip ${rc.bg} ${rc.text}`}>{f.riskLevel}</span>
                  </div>
                  <p class="text-xs text-gray-500">{f.cropEmoji} {f.crop} · {f.issue}</p>
                  <p class="text-xs text-gray-400 mt-1">{f.village} · {f.date}</p>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* Analytics charts */}
      <div class="grid lg:grid-cols-2 gap-6 mb-8">
        <div class="card p-5 sm:p-6">
          <h2 class="font-display font-bold text-agri-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-chart-column text-agri-600"></i> Disease vs Pest split over time</h2>
          <canvas id="chart-split" height="220"></canvas>
        </div>
        <div class="card p-5 sm:p-6">
          <h2 class="font-display font-bold text-agri-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-chart-line text-tech-600"></i> Confidence trend (avg. monthly)</h2>
          <canvas id="chart-confidence" height="220"></canvas>
        </div>
        <div class="card p-5 sm:p-6 lg:col-span-2">
          <h2 class="font-display font-bold text-agri-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-cloud-bolt text-amber-600"></i> Outbreak risk vs. humidity correlation</h2>
          <canvas id="chart-weather" height="180"></canvas>
        </div>
      </div>

      {/* Continuous learning panel */}
      <div class="card p-5 sm:p-6 mb-8 bg-eco-50 border-eco-200">
        <h2 class="font-display font-bold text-agri-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-arrows-spin text-eco-600"></i> Continuous learning loop</h2>
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          {[
            { icon: 'fa-users', label: 'Farmer Feedback', color: 'agri' },
            { icon: 'fa-database', label: 'Labeled Case Data', color: 'tech' },
            { icon: 'fa-brain', label: 'Model Retraining', color: 'amber' },
            { icon: 'fa-rocket', label: 'Improved Accuracy', color: 'eco' },
          ].map((s, i, arr) => (
            <>
              <div class="flex flex-col items-center gap-2 flex-1 min-w-[100px]">
                <div class={`w-12 h-12 rounded-full bg-${s.color}-100 text-${s.color}-600 flex items-center justify-center text-lg`}><i class={`fa-solid ${s.icon}`}></i></div>
                <p class="text-[11px] font-semibold text-gray-600 text-center">{s.label}</p>
              </div>
              {i < arr.length - 1 && <i class="fa-solid fa-arrow-right text-gray-300"></i>}
            </>
          ))}
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-eco-100 pt-4">
          <div><p class="text-lg font-extrabold text-gray-900">{ANALYTICS.modelStats.totalFeedback.toLocaleString()}</p><p class="text-xs text-gray-500">Feedback signals</p></div>
          <div><p class="text-lg font-extrabold text-agri-600">{ANALYTICS.modelStats.positiveFeedbackPct}%</p><p class="text-xs text-gray-500">Found helpful</p></div>
          <div><p class="text-lg font-extrabold text-tech-600">+{ANALYTICS.modelStats.accuracyGainPct}%</p><p class="text-xs text-gray-500">Accuracy gain</p></div>
          <div><p class="text-lg font-extrabold text-gray-900">{ANALYTICS.modelStats.version}</p><p class="text-xs text-gray-500">Last retrain: {ANALYTICS.modelStats.lastRetrain}</p></div>
        </div>
      </div>

      {/* Farmer directory table */}
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display font-bold text-lg text-agri-900 flex items-center gap-2"><i class="fa-solid fa-address-book text-agri-600"></i> Farmer directory &amp; case status</h2>
      </div>
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full data-table">
            <thead class="bg-gray-50">
              <tr><th>Farmer</th><th>Crop</th><th>Issue</th><th>Confidence</th><th>Risk</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {FARMER_DIRECTORY.map((f) => {
                const rc = riskColor(f.riskLevel)
                const sc = statusColor(f.status)
                return (
                  <tr>
                    <td class="font-semibold text-gray-800">{f.name}<br/><span class="text-xs text-gray-400 font-normal">{f.village}</span></td>
                    <td>{f.cropEmoji} {f.crop}</td>
                    <td class="text-gray-600">{f.issue}</td>
                    <td class="font-semibold">{f.confidence}%</td>
                    <td><span class={`status-chip ${rc.bg} ${rc.text}`}>{f.riskLevel}</span></td>
                    <td><span class={`status-chip ${sc.bg} ${sc.text}`}>{f.status}</span></td>
                    <td class="text-gray-400 text-xs">{f.date}</td>
                    <td><a href={`/diagnosis/${f.caseId}`} class="text-tech-600 font-semibold text-xs">Review <i class="fa-solid fa-arrow-right ml-0.5"></i></a></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `window.__ANALYTICS__ = ${JSON.stringify(ANALYTICS)};` }}></script>
    </main>
  )
}
