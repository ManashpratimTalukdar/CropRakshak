import { PORTFOLIO, SCAN_HISTORY, riskColor } from '../lib/data'

export const DashboardPage = () => {
  return (
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 text-xs font-bold text-eco-600 uppercase tracking-wide">
            <i class="fa-solid fa-chart-simple"></i> My Dashboard
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Welcome back, Ramesh 👋</h1>
          <p class="text-gray-500 mt-1 text-sm">Track your fields, re-scan crops, and see how your feedback improves the system.</p>
        </div>
        <a href="/scan" class="btn-primary inline-flex items-center gap-2"><i class="fa-solid fa-camera"></i> New Scan</a>
      </div>

      {/* Feedback loop visual */}
      <div class="card p-5 sm:p-6 mb-8 bg-gradient-to-r from-eco-50 to-tech-50 border-eco-100">
        <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-arrows-spin text-eco-600"></i> How your feedback helps</h2>
        <div class="flex items-center justify-between flex-wrap gap-3 text-center">
          {[
            { icon: 'fa-hand-holding-hand', label: 'You implement action', color: 'agri' },
            { icon: 'fa-camera-retro', label: 'Re-scan crop health', color: 'tech' },
            { icon: 'fa-magnifying-glass-chart', label: 'System checks improvement', color: 'amber' },
            { icon: 'fa-comment-dots', label: 'You give feedback', color: 'eco' },
            { icon: 'fa-brain', label: 'Model improves over time', color: 'agri' },
          ].map((s, i, arr) => (
            <>
              <div class="flex flex-col items-center gap-2 w-28">
                <div class={`w-12 h-12 rounded-full bg-${s.color}-100 text-${s.color}-600 flex items-center justify-center text-lg`}><i class={`fa-solid ${s.icon}`}></i></div>
                <p class="text-[11px] font-semibold text-gray-600 leading-tight">{s.label}</p>
              </div>
              {i < arr.length - 1 && <i class="fa-solid fa-arrow-right text-gray-300 hidden sm:block"></i>}
            </>
          ))}
        </div>
      </div>

      {/* Crop portfolio */}
      <h2 class="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-layer-group text-agri-600"></i> Your crop portfolio</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {PORTFOLIO.map((f) => {
          const rc = riskColor(f.riskStatus)
          return (
            <a href={`/diagnosis/${f.caseId}`} class="card card-hover p-5">
              <div class="flex items-center justify-between mb-3">
                <span class="text-2xl">{f.cropEmoji}</span>
                <span class={`status-chip ${rc.bg} ${rc.text}`}><span class={`w-1.5 h-1.5 rounded-full ${rc.dot}`}></span>{f.riskStatus}</span>
              </div>
              <p class="font-bold text-gray-900">{f.cropName}</p>
              <p class="text-xs text-gray-500">{f.fieldName} · {f.acres} acres</p>
              <p class="text-xs text-gray-400 mt-3 border-t border-gray-100 pt-2">Last scanned: {f.lastScanned}</p>
            </a>
          )
        })}
      </div>

      {/* Scan history */}
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2"><i class="fa-solid fa-clock-rotate-left text-tech-600"></i> Scan history</h2>
      </div>
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full data-table">
            <thead class="bg-gray-50">
              <tr><th>Date</th><th>Crop</th><th>Result</th><th>Risk</th><th>Feedback</th><th></th></tr>
            </thead>
            <tbody>
              {SCAN_HISTORY.map((h) => {
                const rc = riskColor(h.riskLevel)
                return (
                  <tr>
                    <td class="text-gray-500">{h.date}</td>
                    <td><span class="mr-1.5">{h.cropEmoji}</span>{h.cropName}</td>
                    <td class="text-gray-700">{h.result}</td>
                    <td><span class={`status-chip ${rc.bg} ${rc.text}`}>{h.riskLevel}</span></td>
                    <td>
                      {h.feedback === 'helped' && <span class="text-agri-600 text-sm"><i class="fa-solid fa-thumbs-up mr-1"></i>Helped</span>}
                      {h.feedback === 'not-helped' && <span class="text-red-500 text-sm"><i class="fa-solid fa-thumbs-down mr-1"></i>Not helpful</span>}
                      {h.feedback === 'pending' && (
                        <div class="flex gap-2 feedback-widget">
                          <button class="feedback-btn w-7 h-7 rounded-full bg-gray-100 hover:bg-agri-100 text-gray-500 hover:text-agri-600 text-xs" data-val="up"><i class="fa-solid fa-thumbs-up"></i></button>
                          <button class="feedback-btn w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 text-xs" data-val="down"><i class="fa-solid fa-thumbs-down"></i></button>
                        </div>
                      )}
                    </td>
                    <td><a href={`/diagnosis/${h.caseId}`} class="text-tech-600 font-semibold text-xs">View <i class="fa-solid fa-arrow-right ml-0.5"></i></a></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-3 flex items-center gap-1.5"><i class="fa-solid fa-circle-info"></i> Your "did this help?" feedback is anonymized and used only to improve future recommendations.</p>
    </main>
  )
}
