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

// Circular ring: circumference = 2πr
const RING_R = 40
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R

// Use rounded percentage so same value always gives identical dash (consistent alignment)
function ringDash(value) {
  const pct = Math.min(100, Math.max(0, Math.round(Number(value))))
  const p = pct / 100
  return `${p * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`
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
        <div class="metrics-rings">
          <article
            v-for="entry in metricEntries"
            :key="entry.key"
            class="ring-widget"
            :class="{ 'has-value': entry.value != null && !Number.isNaN(Number(entry.value)) }"
          >
            <p class="ring-title">{{ entry.label }}</p>
            <div class="ring-wrap">
              <svg class="ring-svg" viewBox="0 0 100 100" aria-hidden="true">
                <!-- Track (full ring) -->
                <circle
                  class="ring-track"
                  cx="50"
                  cy="50"
                  :r="RING_R"
                  fill="none"
                  stroke-width="8"
                />
                <!-- Value ring (from top, clockwise); no linecap so all rings align at same level -->
                <circle
                  v-if="entry.value != null && !Number.isNaN(Number(entry.value))"
                  class="ring-fill"
                  cx="50"
                  cy="50"
                  :r="RING_R"
                  fill="none"
                  stroke-width="8"
                  transform="rotate(-90 50 50)"
                  :stroke-dasharray="ringDash(entry.value)"
                />
                <text
                  class="ring-value"
                  x="50"
                  y="50"
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

.metrics-rings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.5rem;
}

.ring-widget {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: box-shadow 0.2s ease;
}

.ring-widget:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.ring-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.ring-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-svg {
  width: 100%;
  max-width: 120px;
  height: auto;
  display: block;
}

.ring-track {
  stroke: var(--color-border);
}

.ring-fill {
  stroke: #2563eb;
  transition: stroke-dasharray 0.4s ease;
}

.ring-value {
  font-size: 1rem;
  font-weight: 700;
  fill: var(--color-heading);
}

@media (max-width: 520px) {
  .metrics-rings {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .ring-title {
    font-size: 0.75rem;
  }
  .ring-value {
    font-size: 0.9375rem;
  }
}
</style>
