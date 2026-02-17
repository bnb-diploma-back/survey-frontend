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
        <div class="metrics-cubes">
          <article
            v-for="entry in metricEntries"
            :key="entry.key"
            class="metric-cube"
            :class="{ 'has-value': entry.value != null && !Number.isNaN(Number(entry.value)) }"
          >
            <div class="metric-cube-head">
              <span class="metric-cube-label">{{ entry.label }}</span>
              <span
                v-if="entry.value != null && !Number.isNaN(Number(entry.value))"
                class="metric-cube-value"
              >{{ Math.round(Number(entry.value)) }}%</span>
              <span v-else class="metric-cube-placeholder">—</span>
            </div>
            <div class="metric-cube-bar">
              <div
                class="metric-cube-fill"
                :style="{
                  width: entry.value != null && !Number.isNaN(Number(entry.value))
                    ? `${Math.min(100, Math.max(0, Number(entry.value)))}%`
                    : '0%'
                }"
              />
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

.metrics-cubes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-cube {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.metric-cube:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.metric-cube.has-value {
  background: var(--color-background);
  border-color: var(--color-border);
}

.metric-cube-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
}

.metric-cube-label {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-heading);
  line-height: 1.3;
}

.metric-cube-value {
  font-weight: 700;
  font-size: 1rem;
  color: #2563eb;
  flex-shrink: 0;
}

.metric-cube-placeholder {
  font-weight: 500;
  color: var(--color-text);
  opacity: 0.6;
}

.metric-cube-bar {
  height: 12px;
  background: var(--color-background-soft);
  border-radius: 6px;
  overflow: hidden;
}

.metric-cube-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%);
  border-radius: 6px;
  transition: width 0.4s ease;
}

@media (max-width: 520px) {
  .metric-cube {
    padding: 0.85rem 1rem;
  }
  .metric-cube-label {
    font-size: 0.875rem;
  }
}
</style>
