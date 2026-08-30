import { REFERRALS, riskColor, statusColor } from '../lib/data'

export const DealerPage = () => {
  const stats = {
    new: REFERRALS.filter((r) => r.status === 'New').length,
    contacted: REFERRALS.filter((r) => r.status === 'Contacted').length,
    fulfilled: REFERRALS.filter((r) => r.status === 'Fulfilled').length,
  }
  return (
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wide">
            <i class="fa-solid fa-store"></i> Input Dealer / Diagnostic Lab View
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Referrals from the recommendation engine</h1>
          <p class="text-gray-500 mt-1 text-sm">Farmers are automatically routed to verified partners like you when a treatment or test is recommended.</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="card p-4 text-center"><p class="text-2xl font-extrabold text-blue-600">{stats.new}</p><p class="text-xs text-gray-500">New Referrals</p></div>
        <div class="card p-4 text-center"><p class="text-2xl font-extrabold text-amber-600">{stats.contacted}</p><p class="text-xs text-gray-500">Contacted</p></div>
        <div class="card p-4 text-center"><p class="text-2xl font-extrabold text-agri-600">{stats.fulfilled}</p><p class="text-xs text-gray-500">Fulfilled</p></div>
      </div>

      <div class="space-y-4">
        {REFERRALS.map((r) => {
          const rc = riskColor(r.riskLevel)
          const sc = statusColor(r.status)
          return (
            <div class="card p-5 flex flex-wrap items-center gap-4">
              <div class="w-11 h-11 rounded-xl bg-agri-100 flex items-center justify-center text-xl shrink-0">{r.cropEmoji}</div>
              <div class="flex-1 min-w-[200px]">
                <div class="flex items-center gap-2">
                  <p class="font-bold text-gray-900">{r.farmerName}</p>
                  <span class={`status-chip ${rc.bg} ${rc.text}`}>{r.riskLevel}</span>
                </div>
                <p class="text-sm text-gray-500">{r.cropName} · {r.issue} · {r.village} ({r.distanceKm} km)</p>
                <p class="text-sm font-semibold text-tech-700 mt-1"><i class="fa-solid fa-box mr-1.5"></i>{r.requestedItem}</p>
              </div>
              <div class="flex flex-col items-end gap-2 shrink-0">
                <span class={`status-chip ${sc.bg} ${sc.text}`}>{r.status}</span>
                <p class="text-xs text-gray-400">{r.date}</p>
              </div>
              <div class="flex gap-2 w-full sm:w-auto">
                <button class="btn-ghost bg-gray-100 text-xs flex-1 sm:flex-none"><i class="fa-solid fa-phone mr-1.5"></i>Call</button>
                <button class="btn-primary text-xs px-4 py-2 flex-1 sm:flex-none">Mark Fulfilled</button>
              </div>
            </div>
          )
        })}
      </div>

      <div class="card p-5 mt-8 bg-eco-50 border-eco-100">
        <p class="text-sm text-eco-800 flex items-center gap-2"><i class="fa-solid fa-circle-info"></i> This is a lightweight view — full inventory management and order fulfillment tracking would be built out in a production version.</p>
      </div>
    </main>
  )
}
