import type { DiagnosisCase, CategoryAssessment } from '@backend/lib/data'

const sevColor = (sev: string) => (sev === 'Severe' ? 'red' : sev === 'Moderate' ? 'amber' : 'agri')
const riskChip = (risk: string) => {
  switch (risk) {
    case 'Low': return { bg: 'bg-agri-100', text: 'text-agri-700', dot: 'bg-agri-500' }
    case 'Moderate': return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' }
    case 'High': return { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' }
    default: return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' }
  }
}

const CategoryCard = ({ a, accentIcon, accentColor }: { a: CategoryAssessment; accentIcon: string; accentColor: string }) => {
  const risk = riskChip(a.riskLevel)
  const fillColor = a.confidence >= 70 ? accentColor : a.confidence >= 40 ? 'amber' : 'gray'
  return (
    <div class={`card p-5 relative ${a.isPrimary ? `ring-2 ring-${accentColor}-400` : 'opacity-90'}`}>
      {a.isPrimary && (
        <span class={`absolute -top-3 left-4 status-chip bg-${accentColor}-600 text-white`}>MOST LIKELY</span>
      )}
      <div class="flex items-center gap-2.5 mb-3">
        <div class={`w-10 h-10 rounded-md bg-${accentColor}-100 text-${accentColor}-600 flex items-center justify-center text-lg shrink-0`}>
          <i class={`fa-solid ${accentIcon}`}></i>
        </div>
        <div>
          <p class="text-xs font-bold text-gray-400 uppercase">{a.label}</p>
          <p class="font-bold text-gray-900 leading-tight">{a.cause}</p>
        </div>
      </div>
      {a.scientificName && <p class="text-xs italic text-gray-400 mb-3">{a.scientificName}</p>}

      <div class="mb-3">
        <div class="flex justify-between text-xs font-semibold text-gray-500 mb-1">
          <span>Confidence</span><span class="text-gray-800">{a.confidence}%</span>
        </div>
        <div class="meter-track">
          <div class={`meter-fill bg-${fillColor}-500`} style={`width:${a.confidence}%`}></div>
        </div>
      </div>

      <div class="flex items-center gap-2 flex-wrap mb-3">
        <span class={`status-chip ${risk.bg} ${risk.text}`}><span class={`w-1.5 h-1.5 rounded-full ${risk.dot}`}></span>{a.riskLevel} Risk</span>
        <span class="status-chip bg-gray-100 text-gray-600">Severity: {a.severity}</span>
      </div>

      {a.alternatives.length > 0 && (
        <div class="text-xs text-gray-500 border-t border-gray-100 pt-2.5 mt-2">
          <span class="font-semibold text-gray-600">Could also be:</span> {a.alternatives.join(', ')}
        </div>
      )}
    </div>
  )
}

export const DiagnosisPage = ({ c }: { c: DiagnosisCase }) => {
  const primary = c.primaryType === 'disease' ? c.disease : c.primaryType === 'pest' ? c.pest : c.abiotic
  const risk = riskChip(primary.riskLevel)

  return (
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header / summary */}
      <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2 text-xs font-bold text-tech-600 uppercase tracking-wide">
            <i class="fa-solid fa-file-medical"></i> Diagnosis Result <span class="text-gray-300">·</span> {c.scanId}
          </div>
          <h1 class="text-2xl sm:text-3xl font-display font-bold text-agri-900 mt-1 flex items-center gap-2">
            <span>{c.cropEmoji}</span> {c.cropName} — {c.variety}
          </h1>
          <p class="text-gray-500 text-sm mt-1">{c.stage} · {c.village}, {c.district} · Scanned {c.date}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-gray-400 font-semibold uppercase mb-1">Overall confidence</p>
          <p class={`text-3xl font-extrabold ${c.overallConfidence >= 70 ? 'text-agri-600' : c.overallConfidence >= 45 ? 'text-amber-600' : 'text-red-600'}`}>{c.overallConfidence}%</p>
        </div>
      </div>

      {/* Uncertainty banner */}
      {c.uncertain && (
        <div class="card p-5 mb-6 border-2 border-amber-300 bg-amber-50">
          <div class="flex gap-3">
            <i class="fa-solid fa-triangle-exclamation text-amber-500 text-xl mt-0.5"></i>
            <div>
              <p class="font-bold text-amber-800">We're not confident enough to give you a firm answer yet</p>
              <p class="text-sm text-amber-700 mt-1 leading-relaxed">{c.uncertaintyMessage}</p>
              <a href="/scan" class="inline-flex items-center gap-1.5 text-sm font-bold text-amber-800 mt-3 underline"><i class="fa-solid fa-camera"></i> Retake a clearer photo</a>
            </div>
          </div>
        </div>
      )}

      {/* Primary result banner */}
      <div class={`card p-5 sm:p-6 mb-6 border-l-4 border-${sevColor(primary.severity)}-500`}>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs font-bold text-gray-400 uppercase mb-1">Primary finding · {primary.label}</p>
            <p class="text-xl font-extrabold text-gray-900">{primary.cause}</p>
          </div>
          <span class={`status-chip text-sm px-4 py-2 ${risk.bg} ${risk.text}`}><span class={`w-2 h-2 rounded-full ${risk.dot}`}></span>{primary.riskLevel} Risk Level</span>
        </div>
      </div>

      {/* 3-way split cards */}
      <p class="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Full assessment — kept separate on purpose</p>
      <div class="grid sm:grid-cols-3 gap-4 mb-8">
        <CategoryCard a={c.disease} accentIcon="fa-leaf" accentColor="agri" />
        <CategoryCard a={c.pest} accentIcon="fa-bug" accentColor="tech" />
        <CategoryCard a={c.abiotic} accentIcon="fa-droplet" accentColor="amber" />
      </div>

      {/* Context used */}
      <div class="grid sm:grid-cols-2 gap-4 mb-8">
        <div class="card p-5">
          <p class="text-xs font-bold text-tech-700 uppercase mb-3 flex items-center gap-1.5"><i class="fa-solid fa-cloud-sun"></i> Weather context used</p>
          <ul class="text-sm text-gray-700 space-y-1.5">
            <li class="flex justify-between"><span class="text-gray-500">Temperature</span><span class="font-semibold">{c.weather.temp}</span></li>
            <li class="flex justify-between"><span class="text-gray-500">Humidity</span><span class="font-semibold">{c.weather.humidity}</span></li>
            <li class="flex justify-between"><span class="text-gray-500">Rainfall</span><span class="font-semibold">{c.weather.rainfall}</span></li>
            <li class="flex justify-between"><span class="text-gray-500">Soil moisture</span><span class="font-semibold">{c.weather.soilMoisture}</span></li>
            <li class="flex justify-between"><span class="text-gray-500">Forecast</span><span class="font-semibold text-right max-w-[60%]">{c.weather.forecast}</span></li>
          </ul>
        </div>
        <div class="card p-5">
          <p class="text-xs font-bold text-eco-700 uppercase mb-3 flex items-center gap-1.5"><i class="fa-solid fa-map-location-dot"></i> Regional signal used</p>
          <ul class="text-sm text-gray-700 space-y-1.5 mb-2">
            <li class="flex justify-between"><span class="text-gray-500">Hotspot status</span><span class="font-semibold">{c.regional.hotspotStatus}</span></li>
            <li class="flex justify-between"><span class="text-gray-500">Nearby reports</span><span class="font-semibold">{c.regional.nearbyReports} within {c.regional.radiusKm} km</span></li>
          </ul>
          <p class="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">{c.regional.advisory}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-3 justify-between items-center">
        <a href="/scan" class="btn-ghost bg-gray-100"><i class="fa-solid fa-rotate-left mr-1.5"></i>Scan Again</a>
        <a href={`/action/${c.id}`} class="btn-primary inline-flex items-center gap-2"><i class="fa-solid fa-clipboard-check"></i> See Recommendations</a>
      </div>
    </main>
  )
}
