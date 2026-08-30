// ============================================================================
// AgriSense AI — Frontend interactivity (vanilla JS, no build step needed)
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu()
  initLangSelector()
  initChipOptions()
  initSliders()
  initScanFlow()
  initPhotoUpload()
  initAnalysisPage()
  initFeedbackWidgets()
  initAdminCharts()
})

// ---------------------------------------------------------------------------
function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn')
  const menu = document.getElementById('mobile-menu')
  if (!btn || !menu) return
  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden')
    const icon = btn.querySelector('i')
    icon.classList.toggle('fa-bars')
    icon.classList.toggle('fa-xmark')
  })
}

// ---------------------------------------------------------------------------
function initLangSelector() {
  const sel = document.getElementById('lang-select')
  if (!sel) return
  sel.addEventListener('change', () => {
    if (sel.value !== 'en') {
      showToast('Multilingual support is coming soon — demo is in English for now.')
      sel.value = 'en'
    }
  })
}

// ---------------------------------------------------------------------------
function initChipOptions() {
  // Generic single-select chip groups (siblings within same parent toggle "selected")
  document.querySelectorAll('.chip-option').forEach((chip) => {
    chip.addEventListener('click', () => {
      const parent = chip.parentElement
      parent.querySelectorAll('.chip-option').forEach((c) => c.classList.remove('selected'))
      chip.classList.add('selected')
    })
  })
}

// ---------------------------------------------------------------------------
function initSliders() {
  document.querySelectorAll('input[type="range"][data-slider]').forEach((slider) => {
    const id = slider.getAttribute('data-slider')
    const labelsAttr = slider.getAttribute('data-labels')
    const out = document.querySelector(`.slider-value[data-for="${id}"]`)
    if (!out) return
    const labels = labelsAttr ? labelsAttr.split(',') : null
    slider.addEventListener('input', () => {
      if (labels) {
        out.textContent = labels[parseInt(slider.value)]
      } else {
        out.textContent = slider.value + (out.textContent.replace(/[0-9.\-]/g, '').trim() || '')
      }
    })
  })
}

// ---------------------------------------------------------------------------
function initPhotoUpload() {
  const input = document.getElementById('photo-input')
  const preview = document.getElementById('photo-preview')
  const placeholder = document.getElementById('photo-placeholder')
  const sampleBtn = document.getElementById('use-sample-photo')
  if (!input) return

  input.addEventListener('change', () => {
    const file = input.files && input.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    preview.src = url
    preview.classList.remove('hidden')
    placeholder.classList.add('hidden')
  })

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      preview.src = 'https://sspark.genspark.ai/cfimages?u1=%2BvvQcabkxEmQqgAjcs%2FxNa%2B9hW2FY0OKOkUWm35ePY1f2HYfJf7pa4rylZJS06%2FXBmgwgqChv81d8KgxHo7Age3tASObsW2E4leByGjX&u2=WPM48YMD1OSiX8Fc&width=800'
      preview.classList.remove('hidden')
      placeholder.classList.add('hidden')
    })
  }
}

// ---------------------------------------------------------------------------
function initScanFlow() {
  const form = document.getElementById('scan-form')
  if (!form) return

  const panels = Array.from(document.querySelectorAll('.step-panel'))
  const dots = Array.from(document.querySelectorAll('[data-step-indicator]'))
  const lines = Array.from(document.querySelectorAll('[data-step-line]'))
  const btnBack = document.getElementById('btn-back')
  const btnNext = document.getElementById('btn-next')
  const btnSkip = document.getElementById('btn-skip')
  const btnAnalyze = document.getElementById('btn-analyze')
  const total = panels.length
  let current = 0

  // Selected crop -> determines which demo case we route to
  const cropCaseMap = { wheat: 'wheat-rust', tomato: 'tomato-whitefly', rice: 'rice-nutrient' }
  let selectedCrop = 'wheat'
  const cropSelect = document.getElementById('crop-select')
  if (cropSelect) {
    cropSelect.querySelectorAll('.chip-option').forEach((chip) => {
      chip.addEventListener('click', () => { selectedCrop = chip.getAttribute('data-crop') })
    })
  }

  function render() {
    panels.forEach((p, i) => p.classList.toggle('active', i === current))
    dots.forEach((d, i) => {
      const dot = d.querySelector('.step-dot')
      dot.classList.remove('active', 'done')
      if (i < current) dot.classList.add('done')
      else if (i === current) dot.classList.add('active')
    })
    lines.forEach((l, i) => l.classList.toggle('done', i < current))

    btnBack.classList.toggle('hidden', current === 0)
    const isLast = current === total - 1
    btnNext.classList.toggle('hidden', isLast)
    btnAnalyze.classList.toggle('hidden', !isLast)
    btnSkip.classList.toggle('hidden', isLast)

    window.scrollTo({ top: document.getElementById('progress-track').offsetTop - 90, behavior: 'smooth' })
  }

  btnNext.addEventListener('click', () => {
    if (current < total - 1) { current++; render() }
  })
  btnBack.addEventListener('click', () => {
    if (current > 0) { current--; render() }
  })
  btnSkip.addEventListener('click', () => {
    current = total - 1
    render()
  })
  btnAnalyze.addEventListener('click', () => {
    const caseId = cropCaseMap[selectedCrop] || 'wheat-rust'
    window.location.href = `/analysis/${caseId}`
  })

  render()
}

// ---------------------------------------------------------------------------
function initAnalysisPage() {
  const checklist = document.getElementById('analysis-checklist')
  if (!checklist) return

  const steps = Array.from(document.querySelectorAll('.analysis-step'))
  const cta = document.getElementById('analysis-cta')
  const redirectTo = window.__ANALYSIS_REDIRECT__ || '/diagnosis/wheat-rust'

  // Connectivity mode cycling — simulated, purely visual
  const modes = [
    { label: 'Good Internet — Full Features', color: 'bg-agri-500', icon: null },
    { label: 'Low Bandwidth — Compressed Mode', color: 'bg-amber-500', icon: null },
    { label: 'No Internet — Offline Local Inference', color: 'bg-eco-500', icon: null },
    { label: 'SMS / IVR Fallback Active', color: 'bg-tech-500', icon: null },
  ]
  const chip = document.getElementById('connectivity-chip')
  const dotEl = chip ? chip.querySelector('span.pulse-ring, span.w-2\\.5') : null
  const labelEl = document.getElementById('connectivity-label')
  let modeIdx = 0
  if (chip) {
    chip.addEventListener('click', () => {
      modeIdx = (modeIdx + 1) % modes.length
      const m = modes[modeIdx]
      labelEl.textContent = m.label
      const dot = chip.querySelector('span')
      dot.className = `w-2.5 h-2.5 rounded-full ${m.color} pulse-ring`
    })
  }

  let i = 0
  function runStep() {
    if (i > 0) {
      const prev = steps[i - 1]
      prev.querySelector('.step-status').innerHTML = '<i class="fa-solid fa-circle-check text-agri-500"></i>'
      prev.querySelector('.step-icon').classList.remove('bg-gray-100', 'text-gray-400')
      prev.querySelector('.step-icon').classList.add('bg-agri-100', 'text-agri-600')
    }
    if (i < steps.length) {
      const cur = steps[i]
      cur.querySelector('.step-status').innerHTML = '<i class="fa-solid fa-circle-notch fa-spin text-tech-500"></i>'
      cur.querySelector('.step-icon').classList.remove('bg-gray-100', 'text-gray-400')
      cur.querySelector('.step-icon').classList.add('bg-tech-100', 'text-tech-600')
      i++
      setTimeout(runStep, 750 + Math.random() * 400)
    } else {
      if (cta) cta.style.display = 'block'
      setTimeout(() => { window.location.href = redirectTo }, 900)
    }
  }
  setTimeout(runStep, 500)
}

// ---------------------------------------------------------------------------
function initFeedbackWidgets() {
  document.querySelectorAll('.feedback-widget').forEach((widget) => {
    widget.querySelectorAll('.feedback-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val')
        widget.innerHTML =
          val === 'up'
            ? '<span class="text-agri-600 text-sm"><i class="fa-solid fa-thumbs-up mr-1"></i>Thanks for your feedback!</span>'
            : '<span class="text-red-500 text-sm"><i class="fa-solid fa-thumbs-down mr-1"></i>Noted — we\'ll review this case.</span>'
        showToast('Feedback recorded — this helps improve future recommendations.')
      })
    })
  })
}

// ---------------------------------------------------------------------------
function showToast(msg) {
  let toast = document.getElementById('app-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.id = 'app-toast'
    toast.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg z-[999] transition-opacity duration-300'
    document.body.appendChild(toast)
  }
  toast.textContent = msg
  toast.style.opacity = '1'
  clearTimeout(toast._timer)
  toast._timer = setTimeout(() => { toast.style.opacity = '0' }, 2600)
}

// ---------------------------------------------------------------------------
function initAdminCharts() {
  if (!window.__ANALYTICS__ || typeof Chart === 'undefined') return
  const A = window.__ANALYTICS__

  const splitEl = document.getElementById('chart-split')
  if (splitEl) {
    new Chart(splitEl, {
      type: 'bar',
      data: {
        labels: A.months,
        datasets: [
          { label: 'Disease', data: A.diseaseCounts, backgroundColor: '#3aa843', borderRadius: 6 },
          { label: 'Pest', data: A.pestCounts, backgroundColor: '#3186f5', borderRadius: 6 },
          { label: 'Abiotic', data: A.abioticCounts, backgroundColor: '#f59e0b', borderRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: { y: { beginAtZero: true, grid: { color: '#f1f2f4' } }, x: { grid: { display: false } } },
      },
    })
  }

  const confEl = document.getElementById('chart-confidence')
  if (confEl) {
    new Chart(confEl, {
      type: 'line',
      data: {
        labels: A.months,
        datasets: [{
          label: 'Avg. Confidence %', data: A.confidenceTrend, borderColor: '#3186f5',
          backgroundColor: 'rgba(49,134,245,0.12)', fill: true, tension: 0.35, pointRadius: 4, pointBackgroundColor: '#3186f5',
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { min: 50, max: 100, grid: { color: '#f1f2f4' } }, x: { grid: { display: false } } },
      },
    })
  }

  const weatherEl = document.getElementById('chart-weather')
  if (weatherEl) {
    new Chart(weatherEl, {
      type: 'line',
      data: {
        labels: A.outbreakVsWeather.labels,
        datasets: [
          { label: 'Humidity %', data: A.outbreakVsWeather.humidity, borderColor: '#57a8ff', tension: 0.35, pointRadius: 3, yAxisID: 'y' },
          { label: 'Outbreak Risk Index', data: A.outbreakVsWeather.outbreakRisk, borderColor: '#f59e0b', tension: 0.35, pointRadius: 3, yAxisID: 'y' },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
        scales: { y: { grid: { color: '#f1f2f4' } }, x: { grid: { display: false } } },
      },
    })
  }
}
