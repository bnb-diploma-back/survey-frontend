<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSurveyById } from '../api/survey.js'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id ?? '')

const data = ref(null)
const loading = ref(true)
const error = ref(null)

const METRIC_LABELS = {
  lifeSatisfaction: 'Life Satisfaction',
  digitalSelfRegulation: 'Digital Self-Regulation',
  onlinePrivacyAndControl: 'Online Privacy & Control',
  emotionalResilience: 'Emotional Resilience',
  problematicInternetUseAnxiety: 'Problematic Internet Use & Anxiety',
  communityEngagement: 'Community Engagement',
  socialPressure: 'Social Pressure',
  recommendationSatisfaction: 'Recommendation Satisfaction'
}

/** Mock result for development/demo: different percentage per category (use route /survey/mock) */
const MOCK_RESULT = {
  lifeSatisfaction: 72,
  digitalSelfRegulation: 45,
  onlinePrivacyAndControl: 58,
  emotionalResilience: 81,
  problematicInternetUseAnxiety: 34,
  communityEngagement: 67,
  socialPressure: 52,
  recommendationSatisfaction: 63
}

const metricEntries = computed(() => {
  const source = id.value === 'mock' ? MOCK_RESULT : data.value
  return Object.entries(METRIC_LABELS).map(([key, label]) => ({
    key,
    label,
    value: source?.[key] ?? null
  }))
})

const hasAnyValues = computed(() =>
  metricEntries.value.some((e) => e.value != null && !Number.isNaN(Number(e.value)))
)

async function fetchResult() {
  if (!id.value) return
  if (id.value === 'mock') {
    data.value = MOCK_RESULT
    loading.value = false
    error.value = null
    return
  }
  loading.value = true
  error.value = null
  try {
    data.value = await getSurveyById(id.value)
  } catch (e) {
    const msg = e?.message ?? 'Failed to load results'
    error.value = typeof msg === 'string' ? msg.split('\n')[0].trim() : 'Failed to load results'
  } finally {
    loading.value = false
  }
}

watch(id, fetchResult, { immediate: true })

function goHome() {
  router.push('/')
}

function takeTestAgain() {
  router.push('/survey')
}

// Semi-circle gauge: arc length = π * radius
const GAUGE_R = 45
const GAUGE_HALF_LENGTH = Math.PI * GAUGE_R

function gaugeDash(value) {
  const p = Math.min(1, Math.max(0, value / 100))
  return `${p * GAUGE_HALF_LENGTH} ${GAUGE_HALF_LENGTH}`
}

function gaugeColor(value) {
  if (value <= 33) return 'var(--gauge-green)'
  if (value <= 66) return 'var(--gauge-yellow)'
  return 'var(--gauge-red)'
}
</script>

<template>
  <div class="result-page">
    <header class="result-header">
      <h1 class="result-title">Your Survey Results</h1>
      <p v-if="id" class="result-id">ID: {{ id === 'mock' ? 'Mock results (demo)' : id }}</p>
      <div class="result-actions">
        <button type="button" class="btn secondary" @click="goHome">Home</button>
        <button type="button" class="btn primary" @click="takeTestAgain">Take test again</button>
      </div>
    </header>

    <main class="result-main">
      <div v-if="loading" class="result-loading">
        <div class="spinner" aria-hidden="true" />
        <p>Loading your results…</p>
      </div>

      <div v-else-if="error" class="result-error">
        <p class="error-message">{{ error }}</p>
        <button type="button" class="btn primary" @click="fetchResult">Retry</button>
      </div>

      <div v-else class="result-metrics">
        <p v-if="!hasAnyValues" class="result-pending">
          Your scores are being calculated. Check back shortly or save this link to view results
          later.
        </p>
        <div class="metrics-gauges">
          <article
            v-for="entry in metricEntries"
            :key="entry.key"
            class="gauge-widget"
            :class="{ 'has-value': entry.value != null && !Number.isNaN(Number(entry.value)) }"
          >
            <p class="gauge-title">{{ entry.label }}</p>
            <div class="gauge-wrap">
              <svg class="gauge-svg" viewBox="0 0 120 75" aria-hidden="true">
                <defs>
                  <linearGradient :id="`gauge-track-${entry.key}`" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="var(--gauge-green)" />
                    <stop offset="33%" stop-color="var(--gauge-green)" />
                    <stop offset="33%" stop-color="var(--gauge-yellow)" />
                    <stop offset="66%" stop-color="var(--gauge-yellow)" />
                    <stop offset="66%" stop-color="var(--gauge-red)" />
                    <stop offset="100%" stop-color="var(--gauge-red)" />
                  </linearGradient>
                </defs>
                <path
                  class="gauge-track"
                  d="M 15 58 A 45 45 0 0 1 105 58"
                  fill="none"
                  :stroke="`url(#gauge-track-${entry.key})`"
                  stroke-width="10"
                  stroke-linecap="round"
                />
                <path
                  v-if="entry.value != null && !Number.isNaN(Number(entry.value))"
                  class="gauge-fill"
                  d="M 15 58 A 45 45 0 0 1 105 58"
                  fill="none"
                  :stroke="gaugeColor(Number(entry.value))"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="gaugeDash(Number(entry.value))"
                />
                <text
                  class="gauge-value"
                  x="60"
                  y="48"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  <template v-if="entry.value != null && !Number.isNaN(Number(entry.value))">
                    {{ Math.round(Number(entry.value)) }}%
                  </template>
                  <template v-else>—</template>
                </text>
              </svg>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  background: linear-gradient(160deg, var(--color-background) 0%, var(--color-background-soft) 100%);
  padding: 2rem 1.5rem 3rem;
}

.result-header {
  max-width: 900px;
  margin: 0 auto 2.5rem;
  text-align: center;
}

.result-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
}

.result-id {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.8;
  margin: 0 0 1.25rem;
  font-family: ui-monospace, monospace;
}

.result-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.btn.secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn.secondary:hover {
  border-color: var(--color-border-hover);
  background: var(--color-background-soft);
}

.result-main {
  max-width: 900px;
  margin: 0 auto;
}

.result-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--color-text);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.result-error {
  text-align: center;
  padding: 3rem;
}

.error-message {
  color: #b91c1c;
  margin: 0 0 1rem;
}

.result-pending {
  text-align: center;
  color: var(--color-text);
  margin: 0 0 2rem;
  padding: 1rem;
}

.metrics-gauges {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.gauge-widget {
  --gauge-green: #22c55e;
  --gauge-yellow: #eab308;
  --gauge-red: #ef4444;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: box-shadow 0.2s ease;
}

.gauge-widget:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.gauge-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.gauge-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.gauge-svg {
  width: 100%;
  max-width: 180px;
  height: auto;
  display: block;
}

.gauge-track {
  opacity: 0.4;
}

.gauge-fill {
  transition: stroke-dasharray 0.5s ease;
}

.gauge-value {
  font-size: 1.1rem;
  font-weight: 700;
  fill: var(--color-heading);
}

@media (max-width: 520px) {
  .metrics-gauges {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .gauge-title {
    font-size: 0.75rem;
  }
  .gauge-value {
    font-size: 1rem;
  }
}
</style>
