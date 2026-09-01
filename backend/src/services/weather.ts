// ============================================================================
// WEATHER SERVICE (Section 38) — real API when WEATHER_API_KEY is configured,
// deterministic mock fallback otherwise (MOCK_WEATHER equivalent via DEMO_MODE).
// Weather is used only as CONTEXTUAL evidence for the fusion/risk engines —
// never treated as proof of disease (Section 38 explicit requirement).
// ============================================================================

export interface WeatherSnapshot {
  temperatureC: number
  humidityPct: number
  rainfallMm: number
  windKmh: number
  soilMoisturePct: number
  forecastNote: string
  source: 'mock' | 'api'
}

/**
 * Fetches current weather for a lat/lon. If WEATHER_API_KEY is present, calls
 * Open-Meteo-compatible endpoint... but for this hackathon-scope build we
 * default to a deterministic, clearly-labeled mock so the app works with
 * zero external dependencies (Section 4 / 54 — DEMO_MODE must work without
 * paid external services).
 */
export async function getWeatherSnapshot(env: { WEATHER_API_KEY?: string }, latitude?: number, longitude?: number): Promise<WeatherSnapshot> {
  if (env.WEATHER_API_KEY && latitude !== undefined && longitude !== undefined) {
    try {
      // Open-Meteo is free/keyless, but we still gate on WEATHER_API_KEY being
      // configured so the "real" path is explicit and intentional per Section 68.
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,soil_moisture_0_to_1cm`
      const res = await fetch(url)
      if (res.ok) {
        const data: any = await res.json()
        const c = data.current || {}
        return {
          temperatureC: c.temperature_2m ?? 27,
          humidityPct: c.relative_humidity_2m ?? 65,
          rainfallMm: c.precipitation ?? 0,
          windKmh: c.wind_speed_10m ?? 8,
          soilMoisturePct: (c.soil_moisture_0_to_1cm ?? 0.3) * 100,
          forecastNote: 'Live forecast via Open-Meteo.',
          source: 'api',
        }
      }
    } catch {
      // fall through to mock
    }
  }
  return mockWeather(latitude, longitude)
}

function mockWeather(latitude?: number, longitude?: number): WeatherSnapshot {
  const seed = Math.round(((latitude ?? 20) + (longitude ?? 78)) * 100) % 100
  return {
    temperatureC: 22 + (seed % 12),
    humidityPct: 55 + (seed % 35),
    rainfallMm: seed % 15,
    windKmh: 5 + (seed % 10),
    soilMoisturePct: 40 + (seed % 40),
    forecastNote: 'Prototype / Demonstration Data — live weather API not configured (see .env.example WEATHER_API_KEY).',
    source: 'mock',
  }
}
