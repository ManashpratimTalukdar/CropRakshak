import { SEED_BATCHES } from '../lib/data'

const authBadge = (a: string) => {
  switch (a) {
    case 'Trusted': return { bg: 'bg-agri-100', text: 'text-agri-700', icon: 'fa-shield-check', ring: 'ring-agri-300' }
    case 'Use with Caution': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'fa-triangle-exclamation', ring: 'ring-amber-300' }
    default: return { bg: 'bg-red-100', text: 'text-red-700', icon: 'fa-circle-xmark', ring: 'ring-red-300' }
  }
}

export const SeedPage = ({ batchCode }: { batchCode?: string }) => {
  const batch = batchCode ? SEED_BATCHES[batchCode] : undefined

  return (
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div class="mb-6">
        <div class="flex items-center gap-2 text-xs font-bold text-eco-600 uppercase tracking-wide">
          <i class="fa-solid fa-seedling"></i> Seed Verification &amp; Quality Assurance
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Check your seed before you sow</h1>
        <p class="text-gray-500 mt-1 text-sm">Enter a batch code from your seed bag tag, or try one of the sample batches below.</p>
      </div>

      {/* Input */}
      <div class="card p-5 sm:p-6 mb-6">
        <form method="get" action="/seed" class="flex flex-wrap gap-3 items-end">
          <div class="flex-1 min-w-[200px]">
            <label class="field-label">Seed batch code</label>
            <input type="text" name="batch" placeholder="e.g., SB-WH-88123" class="field-input" value={batchCode || ''} />
          </div>
          <button class="btn-primary shrink-0"><i class="fa-solid fa-magnifying-glass mr-1.5"></i>Verify</button>
        </form>
        <div class="flex gap-2 mt-3 flex-wrap">
          <span class="text-xs text-gray-400 font-semibold">Try:</span>
          {Object.keys(SEED_BATCHES).map((code) => (
            <a href={`/seed?batch=${code}`} class="text-xs font-semibold text-tech-600 bg-tech-50 px-2.5 py-1 rounded-full hover:bg-tech-100">{code}</a>
          ))}
        </div>
      </div>

      {!batch && batchCode && (
        <div class="card p-6 text-center text-gray-500">
          <i class="fa-solid fa-magnifying-glass text-2xl text-gray-300 mb-2"></i>
          <p>No record found for "{batchCode}". Try one of the sample codes above.</p>
        </div>
      )}

      {batch && (
        <div class="space-y-6 fade-up">
          {/* Authenticity badge */}
          {(() => {
            const b = authBadge(batch.authenticity)
            return (
              <div class={`card p-6 text-center ring-2 ${b.ring}`}>
                <div class={`w-16 h-16 rounded-full ${b.bg} ${b.text} flex items-center justify-center text-2xl mx-auto mb-3`}>
                  <i class={`fa-solid ${b.icon}`}></i>
                </div>
                <p class={`text-xl font-extrabold ${b.text}`}>{batch.authenticity}</p>
                <p class="text-sm text-gray-500 mt-1">{batch.brand} · {batch.certBody}</p>
              </div>
            )
          })()}

          {/* Farmer alert - plain language */}
          <div class="card p-5 bg-tech-50 border-tech-100">
            <h2 class="font-bold text-tech-800 flex items-center gap-2 mb-2"><i class="fa-solid fa-comment-dots"></i> Plain-language guidance</h2>
            <p class="text-sm text-tech-700 leading-relaxed">
              {batch.authenticity === 'Trusted' && `This ${batch.cropName} seed batch (${batch.variety}) passed germination, purity and certification checks. Safe to sow — expect good, uniform germination.`}
              {batch.authenticity === 'Use with Caution' && `This ${batch.cropName} seed batch (${batch.variety}) is genuine but germination is slightly below ideal (${batch.germinationPct}%). You can sow it, but consider a slightly higher seed rate to compensate, and keep the receipt.`}
              {batch.authenticity === 'Not Trusted' && `This ${batch.cropName} seed batch has no verifiable certification or lab test, and germination is low (${batch.germinationPct}%). We recommend NOT sowing this batch — ask your dealer for a certified alternative or get it lab-tested first.`}
            </p>
          </div>

          {/* Quality assessment */}
          <div class="card p-5 sm:p-6">
            <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-vial-circle-check text-agri-600"></i> Quality assessment</h2>
            <div class="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Germination rate', val: batch.germinationPct, unit: '%', good: 85 },
                { label: 'Genetic purity', val: batch.geneticPurityPct, unit: '%', good: 95 },
                { label: 'Physical purity', val: batch.purityPct, unit: '%', good: 95 },
              ].map((m) => (
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-600">{m.label}</span>
                    <span class="font-bold text-gray-900">{m.val}{m.unit}</span>
                  </div>
                  <div class="meter-track">
                    <div class={`meter-fill ${m.val >= m.good ? 'bg-agri-500' : m.val >= m.good - 15 ? 'bg-amber-500' : 'bg-red-500'}`} style={`width:${m.val}%`}></div>
                  </div>
                </div>
              ))}
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Seed treatment applied</span>
                <span class={`status-chip ${batch.treated ? 'bg-agri-100 text-agri-700' : 'bg-gray-100 text-gray-500'}`}>{batch.treated ? 'Yes' : 'No'}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Lab test date</span>
                <span class="font-semibold text-gray-900">{batch.labTestDate}</span>
              </div>
            </div>
          </div>

          {/* Traceability timeline */}
          <div class="card p-5 sm:p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-bold text-gray-900 flex items-center gap-2"><i class="fa-solid fa-timeline text-eco-600"></i> Traceability &amp; records</h2>
              <span class="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded-lg">{batch.batchCode}</span>
            </div>
            <div class="relative pl-6 space-y-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {batch.traceability.map((t, i) => (
                <div class="relative">
                  <span class="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-eco-500 ring-4 ring-eco-100"></span>
                  <p class="font-semibold text-sm text-gray-900">{t.stage} <span class="text-gray-400 font-normal">· {t.date}</span></p>
                  <p class="text-xs text-gray-500 mt-0.5">{t.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* QR-style record card */}
          <div class="card p-5 flex items-center gap-4 bg-gray-900 text-white">
            <div class="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl shrink-0">
              <i class="fa-solid fa-qrcode text-gray-800"></i>
            </div>
            <div>
              <p class="font-bold text-sm">Digital Record Card</p>
              <p class="text-xs text-gray-400">Scan this QR at point of sale to instantly pull up this batch's verification record.</p>
            </div>
          </div>
        </div>
      )}

      {!batch && !batchCode && (
        <div class="grid sm:grid-cols-3 gap-4">
          {[
            { icon: 'fa-file-shield', title: 'Seed source input', desc: 'Enter batch/certification details from your seed bag.' },
            { icon: 'fa-magnifying-glass-chart', title: 'Verification', desc: 'We check certification, batch record & lab tests.' },
            { icon: 'fa-award', title: 'Authenticity score', desc: 'Clear Trusted / Caution / Not Trusted badge — no jargon.' },
          ].map((s) => (
            <div class="card p-5 text-center">
              <div class="w-11 h-11 rounded-xl bg-eco-100 text-eco-600 flex items-center justify-center text-lg mx-auto mb-3"><i class={`fa-solid ${s.icon}`}></i></div>
              <p class="font-bold text-sm text-gray-900">{s.title}</p>
              <p class="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
