export const ScanPage = () => {
  return (
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div class="mb-6">
        <div class="flex items-center gap-2 text-xs font-bold text-agri-600 uppercase tracking-wide">
          <i class="fa-solid fa-camera"></i> Crop Scan
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">Let's check your crop</h1>
        <p class="text-gray-500 mt-1 text-sm sm:text-base">Answer what you can — everything except the photo is optional. A fast scan takes under a minute.</p>
      </div>

      {/* Progress indicator */}
      <div class="flex items-center mb-8" id="progress-track">
        {['Photo', 'Crop Info', 'Soil', 'Water', 'History', 'Review'].map((label, i) => (
          <>
            <div class="flex flex-col items-center gap-1.5 shrink-0" data-step-indicator={i}>
              <div class={`step-dot ${i === 0 ? 'active' : ''}`}>{i + 1}</div>
              <span class="text-[10px] font-semibold text-gray-400 hidden sm:block whitespace-nowrap">{label}</span>
            </div>
            {i < 5 && <div class="step-line" data-step-line={i}></div>}
          </>
        ))}
      </div>

      <form id="scan-form" class="space-y-6">
        {/* ============ STEP 1: PHOTO ============ */}
        <section class="step-panel active" data-step="0">
          <div class="card p-5 sm:p-6">
            <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2"><i class="fa-solid fa-camera text-agri-600"></i> Crop image</h2>
            <p class="text-sm text-gray-500 mt-1 mb-4">Make sure the affected area is clearly visible — get close, use daylight, and include the underside of the leaf if possible.</p>

            <label for="photo-input" class="block relative rounded-2xl border-2 border-dashed border-agri-300 bg-agri-50 hover:bg-agri-100 transition cursor-pointer overflow-hidden" style="min-height: 220px;">
              <div id="photo-placeholder" class="absolute inset-0 flex flex-col items-center justify-center text-agri-600 gap-2">
                <i class="fa-solid fa-camera text-3xl"></i>
                <p class="font-semibold text-sm">Tap to take a photo or upload</p>
                <p class="text-xs text-agri-500">JPG/PNG • camera or gallery</p>
              </div>
              <img id="photo-preview" class="hidden w-full h-full object-cover" style="max-height:320px" />
            </label>
            <input id="photo-input" type="file" accept="image/*" capture="environment" class="hidden" />

            <div class="mt-3 flex gap-2 flex-wrap">
              <button type="button" id="use-sample-photo" class="btn-ghost text-xs bg-gray-100"><i class="fa-solid fa-image mr-1.5"></i>Use a sample photo instead</button>
            </div>

            <div class="mt-4 bg-tech-50 border border-tech-100 rounded-xl p-3 flex gap-2.5 text-xs text-tech-800">
              <i class="fa-solid fa-circle-info mt-0.5"></i>
              <p>Tip: photograph 2–3 leaves showing different stages of the symptom, plus one wider shot of the plant for context.</p>
            </div>
          </div>
        </section>

        {/* ============ STEP 2: CROP & FIELD INFO ============ */}
        <section class="step-panel" data-step="1">
          <div class="card p-5 sm:p-6 space-y-5">
            <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2"><i class="fa-solid fa-wheat-awn text-agri-600"></i> Crop &amp; field information</h2>

            <div>
              <label class="field-label">Which crop?</label>
              <div class="grid grid-cols-3 gap-2" id="crop-select">
                <div class="chip-option selected" data-crop="wheat">🌾 Wheat</div>
                <div class="chip-option" data-crop="tomato">🍅 Tomato</div>
                <div class="chip-option" data-crop="rice">🌱 Rice</div>
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="field-label">Variety (optional)</label>
                <input type="text" placeholder="e.g., HD-2967" class="field-input" />
              </div>
              <div>
                <label class="field-label">Sowing date</label>
                <input type="date" class="field-input" />
              </div>
            </div>

            <div>
              <label class="field-label">Crop growth stage</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Seedling', 'Vegetative', 'Flowering', 'Maturity'].map((s, i) => (
                  <div class={`chip-option ${i === 1 ? 'selected' : ''}`}>{s}</div>
                ))}
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="field-label">Field size (acres)</label>
                <input type="number" placeholder="e.g., 2.5" step="0.1" class="field-input" value="2.5" />
              </div>
              <div>
                <label class="field-label">Field location</label>
                <div class="relative">
                  <input type="text" placeholder="Village, District" class="field-input pl-9" value="Sonewadi, Nashik" />
                  <i class="fa-solid fa-location-dot absolute left-3 top-3.5 text-gray-400"></i>
                </div>
              </div>
            </div>
            <button type="button" class="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 font-medium hover:border-tech-300 hover:text-tech-600 transition">
              <i class="fa-solid fa-map-location-dot mr-1.5"></i> Or pick location on map
            </button>
          </div>
        </section>

        {/* ============ STEP 3: SOIL (optional) ============ */}
        <section class="step-panel" data-step="2">
          <div class="card p-5 sm:p-6 space-y-5">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2"><i class="fa-solid fa-mound text-agri-600"></i> Soil information</h2>
              <span class="status-chip bg-gray-100 text-gray-500">Optional</span>
            </div>
            <p class="text-sm text-gray-500">Skip this if you don't have soil test data — we'll still analyze your photo.</p>

            <div>
              <label class="field-label">Soil type</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Alluvial', 'Black (Regur)', 'Red', 'Laterite'].map((s, i) => (
                  <div class={`chip-option ${i === 1 ? 'selected' : ''}`}>{s}</div>
                ))}
              </div>
            </div>

            {[
              { label: 'Soil pH', id: 'ph', min: 3, max: 10, val: 6.8, unit: '' },
              { label: 'EC (electrical conductivity, dS/m)', id: 'ec', min: 0, max: 4, val: 1.1, unit: '' },
              { label: 'Organic Carbon (%)', id: 'oc', min: 0, max: 2, val: 0.6, unit: '%' },
            ].map((s) => (
              <div>
                <div class="flex justify-between mb-1">
                  <label class="field-label mb-0">{s.label}</label>
                  <span class="text-sm font-bold text-agri-700 slider-value" data-for={s.id}>{s.val}{s.unit}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step="0.1" value={s.val} data-slider={s.id} class="w-full" />
              </div>
            ))}

            <div class="grid grid-cols-3 gap-3">
              {['N', 'P', 'K'].map((s) => (
                <div>
                  <label class="field-label">{s} (kg/ha)</label>
                  <input type="number" placeholder="—" class="field-input text-center" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ STEP 4: IRRIGATION (optional) ============ */}
        <section class="step-panel" data-step="3">
          <div class="card p-5 sm:p-6 space-y-5">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2"><i class="fa-solid fa-droplet text-tech-600"></i> Irrigation &amp; water</h2>
              <span class="status-chip bg-gray-100 text-gray-500">Optional</span>
            </div>

            <div>
              <label class="field-label">Water source</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['Borewell', 'Canal', 'River', 'Rain-fed'].map((s, i) => (
                  <div class={`chip-option ${i === 0 ? 'selected' : ''}`}>{s}</div>
                ))}
              </div>
            </div>
            <div>
              <label class="field-label">Irrigation method</label>
              <div class="grid grid-cols-3 gap-2">
                {['Flood', 'Drip', 'Sprinkler'].map((s, i) => (
                  <div class={`chip-option ${i === 0 ? 'selected' : ''}`}>{s}</div>
                ))}
              </div>
            </div>
            <div>
              <label class="field-label">Irrigation frequency</label>
              <div class="grid grid-cols-3 gap-2">
                {['Weekly', 'Bi-weekly', 'As needed'].map((s, i) => (
                  <div class={`chip-option ${i === 0 ? 'selected' : ''}`}>{s}</div>
                ))}
              </div>
            </div>
            <div>
              <div class="flex justify-between mb-1">
                <label class="field-label mb-0">Water stress — how dry has it felt lately?</label>
                <span class="text-sm font-bold text-tech-700 slider-value" data-for="stress">Normal</span>
              </div>
              <input type="range" min="0" max="2" step="1" value="1" data-slider="stress" data-labels="Dry,Normal,Waterlogged" class="w-full" />
            </div>
          </div>
        </section>

        {/* ============ STEP 5: TREATMENT & HISTORY (optional) ============ */}
        <section class="step-panel" data-step="4">
          <div class="card p-5 sm:p-6 space-y-5">
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2"><i class="fa-solid fa-clock-rotate-left text-amber-600"></i> Treatment &amp; history</h2>
              <span class="status-chip bg-gray-100 text-gray-500">Optional</span>
            </div>

            <div>
              <label class="field-label">Pesticides/fertilizers used recently</label>
              <input type="text" placeholder="e.g., Urea top-dress 2 weeks ago" class="field-input" />
            </div>
            <div>
              <label class="field-label">Past diseases or pests on this field</label>
              <input type="text" placeholder="e.g., Aphids last season" class="field-input" />
            </div>
            <div>
              <label class="field-label">Previous season's yield (optional)</label>
              <input type="text" placeholder="e.g., ~18 quintals/acre" class="field-input" />
            </div>
            <div>
              <label class="field-label">Rough budget for treatment this season</label>
              <div class="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map((s, i) => (
                  <div class={`chip-option ${i === 0 ? 'selected' : ''}`}>{s}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ STEP 6: REVIEW + AUTO-CONTEXT ============ */}
        <section class="step-panel" data-step="5">
          <div class="space-y-4">
            <div class="card p-5 sm:p-6">
              <h2 class="font-bold text-lg text-gray-900 flex items-center gap-2"><i class="fa-solid fa-clipboard-check text-agri-600"></i> Review &amp; auto-pulled context</h2>
              <p class="text-sm text-gray-500 mt-1">We've automatically pulled this in — no input needed from you.</p>

              <div class="grid sm:grid-cols-2 gap-4 mt-4">
                <div class="rounded-xl bg-tech-50 border border-tech-100 p-4">
                  <p class="text-xs font-bold text-tech-700 uppercase mb-2 flex items-center gap-1.5"><i class="fa-solid fa-cloud-sun"></i> Weather &amp; environment</p>
                  <ul class="text-sm text-gray-700 space-y-1.5">
                    <li class="flex justify-between"><span class="text-gray-500">Temperature</span><span class="font-semibold">24°C (18–27°C)</span></li>
                    <li class="flex justify-between"><span class="text-gray-500">Humidity</span><span class="font-semibold">78%</span></li>
                    <li class="flex justify-between"><span class="text-gray-500">Rainfall (48h)</span><span class="font-semibold">4 mm</span></li>
                    <li class="flex justify-between"><span class="text-gray-500">Soil moisture</span><span class="font-semibold">62%</span></li>
                    <li class="flex justify-between"><span class="text-gray-500">Forecast</span><span class="font-semibold">Light showers in 2 days</span></li>
                  </ul>
                </div>
                <div class="rounded-xl bg-eco-50 border border-eco-100 p-4">
                  <p class="text-xs font-bold text-eco-700 uppercase mb-2 flex items-center gap-1.5"><i class="fa-solid fa-map-location-dot"></i> Regional data</p>
                  <ul class="text-sm text-gray-700 space-y-1.5">
                    <li class="flex justify-between"><span class="text-gray-500">Nearby reports (8 km)</span><span class="font-semibold">14 cases</span></li>
                    <li class="flex justify-between"><span class="text-gray-500">Hotspot status</span><span class="font-semibold text-orange-600">Elevated Activity</span></li>
                  </ul>
                  <p class="text-xs text-gray-600 mt-2 leading-relaxed">District advisory: monitor wheat for rust pustules through early Sept; humid mornings increase risk.</p>
                </div>
              </div>
            </div>

            <div class="card p-5 sm:p-6 bg-agri-50/60 border-agri-100">
              <p class="text-sm text-gray-600"><i class="fa-solid fa-circle-check text-agri-600 mr-1.5"></i> Ready to analyze. This usually takes under 10 seconds.</p>
            </div>
          </div>
        </section>

        {/* ============ NAV BUTTONS ============ */}
        <div class="flex items-center justify-between gap-3 pt-2">
          <button type="button" id="btn-back" class="btn-ghost bg-gray-100 hidden"><i class="fa-solid fa-arrow-left mr-1.5"></i>Back</button>
          <div class="flex-1"></div>
          <button type="button" id="btn-skip" class="btn-ghost text-sm text-gray-500 underline">Skip optional details</button>
          <button type="button" id="btn-next" class="btn-primary"><i class="fa-solid fa-arrow-right mr-1.5"></i>Next</button>
          <button type="button" id="btn-analyze" class="btn-primary hidden bg-tech-600 hover:bg-tech-700"><i class="fa-solid fa-wand-magic-sparkles mr-1.5"></i>Analyze My Crop</button>
        </div>
      </form>
    </main>
  )
}
