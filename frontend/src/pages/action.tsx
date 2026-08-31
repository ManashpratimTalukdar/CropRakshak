import type { DiagnosisCase } from '@backend/lib/data'
import { DIRECTORY } from '@backend/lib/data'

const providerIcon = (type: string) => {
  switch (type) {
    case 'Dealer': return 'fa-store'
    case 'KVK / Agri Office': return 'fa-landmark'
    case 'Soil Lab / Clinic': return 'fa-vial'
    case 'Expert': return 'fa-user-graduate'
    default: return 'fa-location-dot'
  }
}

export const ActionPage = ({ c }: { c: DiagnosisCase }) => {
  const primary = c.primaryType === 'disease' ? c.disease : c.primaryType === 'pest' ? c.pest : c.abiotic
  return (
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="mb-6">
        <div class="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wide">
          <i class="fa-solid fa-clipboard-check"></i> Action &amp; Recommendation
        </div>
        <h1 class="text-2xl sm:text-3xl font-display font-bold text-agri-900 mt-1">What to do for your {c.cropName.toLowerCase()}</h1>
        <p class="text-gray-500 mt-1 text-sm">Based on: <b class="text-gray-700">{primary.cause}</b> · Field size {c.fieldSizeAcres} acres · Budget: {c.budgetLevel}</p>
      </div>

      <div class="grid lg:grid-cols-3 gap-6">
        {/* LEFT: Recommendations */}
        <div class="lg:col-span-2 space-y-6">
          <div class="card p-5 sm:p-6">
            <h2 class="font-display font-bold text-agri-900 flex items-center gap-2 mb-3"><i class="fa-solid fa-bolt text-red-500"></i> Immediate actions</h2>
            <ul class="space-y-2.5">
              {c.recommendations.immediateActions.map((t) => (
                <li class="flex gap-3 text-sm text-gray-700">
                  <input type="checkbox" class="mt-1 w-4 h-4 rounded accent-agri-600 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div class="card p-5 sm:p-6">
            <h2 class="font-display font-bold text-agri-900 flex items-center gap-2 mb-3"><i class="fa-solid fa-flask-vial text-tech-600"></i> Treatment guidance</h2>
            <ul class="space-y-2.5">
              {c.recommendations.treatmentGuidance.map((t) => (
                <li class="flex gap-3 text-sm text-gray-700">
                  <input type="checkbox" class="mt-1 w-4 h-4 rounded accent-agri-600 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div class="card p-5 sm:p-6">
            <h2 class="font-display font-bold text-agri-900 flex items-center gap-2 mb-3"><i class="fa-solid fa-seedling text-agri-600"></i> Cultural practices</h2>
            <ul class="space-y-2.5">
              {c.recommendations.culturalPractices.map((t) => (
                <li class="flex gap-3 text-sm text-gray-700">
                  <input type="checkbox" class="mt-1 w-4 h-4 rounded accent-agri-600 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div class="card p-5 sm:p-6 bg-red-50 border-red-100">
            <h2 class="font-bold text-red-800 flex items-center gap-2 mb-3"><i class="fa-solid fa-shield-halved"></i> Safe-usage advice</h2>
            <ul class="space-y-2 text-sm text-red-700">
              {c.recommendations.safeUsage.map((t) => (
                <li class="flex gap-2.5"><i class="fa-solid fa-check mt-1 shrink-0"></i><span>{t}</span></li>
              ))}
            </ul>
          </div>

          {/* Access & purchase */}
          <div class="card p-5 sm:p-6">
            <h2 class="font-display font-bold text-agri-900 flex items-center gap-2 mb-4"><i class="fa-solid fa-cart-shopping text-amber-600"></i> Access &amp; purchase options</h2>
            <div class="grid sm:grid-cols-2 gap-3">
              {c.recommendations.purchaseOptions.map((p) => (
                <div class="rounded-md border border-gray-200 p-4 flex gap-3 hover:border-agri-300 transition">
                  <div class="w-10 h-10 rounded-lg bg-agri-100 text-agri-600 flex items-center justify-center shrink-0"><i class={`fa-solid ${p.icon}`}></i></div>
                  <div>
                    <p class="font-semibold text-sm text-gray-900">{p.label}</p>
                    <p class="text-xs text-gray-500 mt-0.5">{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up plan */}
          <div class="card p-5 sm:p-6">
            <h2 class="font-display font-bold text-agri-900 flex items-center gap-2 mb-4"><i class="fa-solid fa-calendar-check text-eco-600"></i> Follow-up plan</h2>
            <div class="relative pl-6 space-y-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              <div class="relative">
                <span class="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-agri-500 ring-4 ring-agri-100"></span>
                <p class="font-semibold text-sm text-gray-900">Today — implement actions above</p>
              </div>
              <div class="relative">
                <span class="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-tech-500 ring-4 ring-tech-100"></span>
                <p class="font-semibold text-sm text-gray-900">Re-scan in {c.recommendations.followUp.rescanAfterDays} days</p>
                <ul class="text-xs text-gray-500 mt-1 space-y-0.5">
                  {c.recommendations.followUp.monitorNotes.map((n) => <li>• {n}</li>)}
                </ul>
              </div>
              <div class="relative">
                <span class="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-red-500 ring-4 ring-red-100"></span>
                <p class="font-semibold text-sm text-gray-900">Escalate if…</p>
                <p class="text-xs text-gray-500 mt-1">{c.recommendations.followUp.escalateWhen}</p>
              </div>
            </div>
            <a href="/dashboard" class="btn-secondary mt-5 w-full text-center inline-block text-sm"><i class="fa-solid fa-bell mr-1.5"></i> Set re-scan reminder</a>
          </div>
        </div>

        {/* RIGHT: Where to get help + ecosystem */}
        <div class="space-y-6">
          <div class="card p-5">
            <h2 class="font-display font-bold text-agri-900 flex items-center gap-2 mb-4"><i class="fa-solid fa-location-dot text-tech-600"></i> Where to get help</h2>
            <div class="space-y-3" id="help">
              {DIRECTORY.slice(0, 4).map((p) => (
                <div class="flex gap-3 items-start pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div class="w-9 h-9 rounded-lg bg-tech-100 text-tech-600 flex items-center justify-center shrink-0 text-sm"><i class={`fa-solid ${providerIcon(p.type)}`}></i></div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <p class="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                      {p.verified && <i class="fa-solid fa-circle-check text-tech-500 text-xs" title="Verified"></i>}
                    </div>
                    <p class="text-xs text-gray-500">{p.type} · {p.distanceKm} km · {p.village}</p>
                    <a href={`tel:${p.phone}`} class="text-xs font-semibold text-agri-600 mt-0.5 inline-block"><i class="fa-solid fa-phone mr-1"></i>{p.phone}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div class="card p-5 bg-eco-50 border-eco-100">
            <h2 class="font-bold text-eco-800 flex items-center gap-2 mb-4"><i class="fa-solid fa-diagram-project"></i> Ecosystem Connect</h2>
            <div class="grid grid-cols-2 gap-2.5">
              {[
                { icon: 'fa-user-graduate', label: 'Experts & Officers', href: '/admin' },
                { icon: 'fa-vial', label: 'Diagnostic Labs', href: '/dealer' },
                { icon: 'fa-store', label: 'Verified Dealers', href: '/dealer' },
                { icon: 'fa-landmark', label: 'Govt. Extension', href: '#help' },
                { icon: 'fa-cloud-sun', label: 'Weather & Advisory', href: '/scan' },
                { icon: 'fa-seedling', label: 'Seed Verification', href: '/seed' },
              ].map((e) => (
                <a href={e.href} class="bg-white rounded-lg p-3 text-center hover:shadow-soft transition">
                  <i class={`fa-solid ${e.icon} text-eco-600 mb-1.5 block text-lg`}></i>
                  <p class="text-[11px] font-semibold text-gray-700 leading-tight">{e.label}</p>
                </a>
              ))}
            </div>
          </div>

          <a href={`/diagnosis/${c.id}`} class="btn-ghost bg-gray-100 w-full text-center block text-sm"><i class="fa-solid fa-arrow-left mr-1.5"></i> Back to diagnosis</a>
        </div>
      </div>
    </main>
  )
}
