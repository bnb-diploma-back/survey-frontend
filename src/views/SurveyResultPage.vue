<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSurveyById } from '../api/survey.js'
import { useI18n } from '../composables/useI18n.js'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id ?? '')
const { t, locale, setLocale } = useI18n()

const data = ref(null)
const loading = ref(true)
const error = ref(null)

const METRIC_KEYS = [
  'lifeSatisfaction',
  'digitalSelfRegulation',
  'onlinePrivacyAndControl',
  'emotionalResilience',
  'problematicInternetUseAnxiety',
  'communityEngagement',
  'socialPressure',
  'recommendationSatisfaction'
]

const RISK_KEYS = ['problematicInternetUseAnxiety', 'socialPressure']

/** Mock: new API shape with tier and overallIndex */
const MOCK_RESULT = {
  lifeSatisfaction: { raw: 567, normalizedPercent: 91.6, tier: 1 },
  digitalSelfRegulation: { raw: 558, normalizedPercent: 100, tier: 1 },
  onlinePrivacyAndControl: { raw: 114, normalizedPercent: 100, tier: 1 },
  emotionalResilience: { raw: 716, normalizedPercent: 96.3, tier: 1 },
  problematicInternetUseAnxiety: { raw: -278, normalizedPercent: 5.4, tier: 1 },
  communityEngagement: { raw: 379, normalizedPercent: 75.3, tier: 2 },
  socialPressure: { raw: 19, normalizedPercent: 11.4, tier: 2 },
  recommendationSatisfaction: { raw: 134, normalizedPercent: 36, tier: 4 },
  overallIndex: 92.3,
  overallTier: 1
}

function getPercentValue(source, key) {
  const v = source?.[key]
  if (v == null) return null
  if (typeof v === 'object' && typeof v.normalizedPercent === 'number' && !Number.isNaN(v.normalizedPercent)) {
    return v.normalizedPercent
  }
  return typeof v === 'number' && !Number.isNaN(v) ? v : null
}

function getTier(source, key) {
  const v = source?.[key]
  if (v == null || typeof v !== 'object') return null
  const tier = v.tier
  if (typeof tier === 'number' && tier >= 1 && tier <= 4) return tier
  return null
}

function getRaw(source, key) {
  const v = source?.[key]
  if (v == null || typeof v !== 'object') return null
  return typeof v.raw === 'number' ? v.raw : null
}

function getInsight(source, key) {
  const v = source?.[key]
  if (v != null && typeof v === 'object' && typeof v.text === 'string') return v.text
  const insights = t.value?.result?.insights
  return insights?.[key] ?? null
}

const source = computed(() => (id.value === 'mock' ? MOCK_RESULT : data.value))

const overallIndex = computed(() => {
  const v = source.value?.overallIndex
  if (typeof v === 'number' && !Number.isNaN(v)) return v
  const entries = dimensionEntries.value
  if (entries.length === 0) return null
  const sum = entries.reduce((acc, e) => acc + (e.value ?? 0), 0)
  return sum / entries.length
})

const overallTier = computed(() => {
  const v = source.value?.overallTier
  if (typeof v === 'number' && v >= 1 && v <= 4) return v
  const idx = overallIndex.value
  if (idx == null) return 1
  if (idx >= 80) return 1
  if (idx >= 60) return 2
  if (idx >= 40) return 3
  return 4
})

const dimensionEntries = computed(() => {
  const src = source.value
  const labels = t.value.metricLabels
  return METRIC_KEYS.map((key) => ({
    key,
    label: labels[key] ?? key,
    value: getPercentValue(src, key),
    tier: getTier(src, key) ?? (getPercentValue(src, key) != null ? (getPercentValue(src, key) >= 80 ? 1 : getPercentValue(src, key) >= 60 ? 2 : getPercentValue(src, key) >= 40 ? 3 : 4) : null),
    raw: getRaw(src, key),
    insight: getInsight(src, key)
  }))
})

const riskEntries = computed(() => dimensionEntries.value.filter((e) => RISK_KEYS.includes(e.key)))

const hasAnyValues = computed(() =>
  dimensionEntries.value.some((e) => e.value != null && !Number.isNaN(Number(e.value)))
)

const summaryText = computed(() => {
  const tier = overallTier.value
  const summaries = t.value?.result?.summaryByTier
  return summaries?.[tier] ?? ''
})

const tierBadge = computed(() => {
  const tier = overallTier.value
  const badges = t.value?.result?.tierBadges
  return badges?.[tier] ?? ''
})

function getTip(key) {
  return t.value?.result?.tips?.[key] ?? null
}

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
    const msg = e?.message ?? t.value.result.loadError
    error.value = typeof msg === 'string' ? msg.split('\n')[0].trim() : t.value.result.loadError
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

async function copyIdToClipboard() {
  if (!id.value) return
  try {
    await navigator.clipboard.writeText(id.value)
    const msg = t.value?.result?.idCopied ?? 'Copied!'
    if (typeof msg === 'string' && msg.length > 0) alert(msg)
  } catch {
    alert(t.value?.result?.copyFailed ?? 'Copy failed')
  }
}

const RING_R = 40
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R
const OVERALL_R = 56
const OVERALL_CIRCUMFERENCE = 2 * Math.PI * OVERALL_R

function ringDash(value, circumference = RING_CIRCUMFERENCE) {
  const pct = Math.min(100, Math.max(0, Number(value)))
  const p = pct / 100
  return `${p * circumference} ${circumference}`
}

/** Single smooth arc path (no stroke-dasharray) so the ring renders as one continuous curve */
function arcPath(pct, cx, cy, r) {
  const p = Math.min(100, Math.max(0, Number(pct))) / 100
  if (p <= 0) return ''
  const startAngle = -90
  const endAngle = -90 + 360 * p
  const toRad = (deg) => (deg * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const largeArc = p >= 0.5 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
}

const overallArcPath = (pct) => arcPath(pct, 60, 60, OVERALL_R)
const dimensionArcPath = (pct) => arcPath(pct, 50, 50, RING_R)

function tierColor(tier) {
  const colors = { 1: '#22c55e', 2: '#eab308', 3: '#f97316', 4: '#ef4444' }
  return colors[tier] ?? '#94a3b8'
}
</script>

<template>
  <div class="result-page">
    <div class="result-layer">
    <header class="result-header">
      <nav class="lang-switcher-result" aria-label="Language">
        <button type="button" class="lang-btn" :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
        <span class="lang-sep">|</span>
        <button type="button" class="lang-btn" :class="{ active: locale === 'ru' }" @click="setLocale('ru')">RU</button>
      </nav>
      <h1 class="result-title">{{ t.result.title }}</h1>
      <button
        v-if="id"
        type="button"
        class="result-id"
        :title="t.result.copyIdHint || 'Click to copy ID'"
        @click="copyIdToClipboard"
      >
        <span class="result-id-text">{{ t.result.id }}: {{ id === 'mock' ? t.result.mockId : id }}</span>
        <img src="/copy.png" alt="" class="result-id-copy-icon" width="18" height="18" />
      </button>
      <div class="result-actions">
        <button type="button" class="btn secondary" @click="goHome">{{ t.result.home }}</button>
        <button type="button" class="btn primary" @click="takeTestAgain">{{ t.result.takeTestAgain }}</button>
      </div>
    </header>

    <main class="result-main">
      <div v-if="loading" class="result-loading">
        <div class="spinner" aria-hidden="true" />
        <p>{{ t.result.loading }}</p>
      </div>

      <div v-else-if="error" class="result-error">
        <p class="error-message">{{ error }}</p>
        <button type="button" class="btn primary" @click="fetchResult">{{ t.result.retry }}</button>
      </div>

      <div v-else class="result-content">
        <p v-if="!hasAnyValues" class="result-pending">{{ t.result.pending }}</p>

        <template v-else>
          <!-- 1. Overall Digital Wellbeing Index -->
          <section class="overall-section">
            <h2 class="overall-heading">{{ t.result.overallTitle }}</h2>
            <div class="overall-ring-wrap">
              <svg
                class="overall-ring-svg"
                viewBox="0 0 120 120"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <circle
                  class="overall-ring-track"
                  cx="60"
                  cy="60"
                  :r="OVERALL_R"
                  fill="none"
                  stroke-width="10"
                />
                <path
                  v-if="overallIndex != null && overallIndex > 0"
                  class="overall-ring-fill"
                  :d="overallArcPath(overallIndex)"
                  fill="none"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke="tierColor(overallTier)"
                />
                <text class="overall-ring-value" x="60" y="58" text-anchor="middle" dominant-baseline="middle">
                  {{ overallIndex != null ? Math.round(overallIndex) : '—' }}%
                </text>
                <text class="overall-ring-label" x="60" y="78" text-anchor="middle" dominant-baseline="middle">
                  {{ tierBadge }}
                </text>
              </svg>
            </div>
            <p v-if="summaryText" class="overall-summary">{{ summaryText }}</p>
          </section>

          <!-- 2. Dimension-level analytics (all dimensions with rings) -->
          <section class="dimensions-section">
            <h2 class="section-heading">{{ t.result.dimensionsSectionTitle }}</h2>
            <div class="dimensions-grid">
              <article
                v-for="entry in dimensionEntries"
                :key="entry.key"
                class="dimension-card"
                :class="['tier-' + (entry.tier ?? 1), { 'has-value': entry.value != null, 'is-risk': RISK_KEYS.includes(entry.key) }]"
              >
                <div class="dimension-card-header">
                  <p class="dimension-label">{{ entry.label }}</p>
                  <span class="dimension-percent">{{ entry.value != null ? Math.round(Number(entry.value)) : '—' }}%</span>
                </div>
                <div class="dimension-bar-wrap">
                  <div
                    class="dimension-bar-fill"
                    :style="{ width: (entry.value != null ? Math.min(100, Math.max(0, entry.value)) : 0) + '%', background: tierColor(entry.tier ?? 1) }"
                  />
                </div>
                <div class="dimension-ring-wrap">
                  <svg
                    class="dimension-ring-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    aria-hidden="true"
                  >
                    <circle class="dimension-ring-track" cx="50" cy="50" :r="RING_R" fill="none" stroke-width="8" />
                    <path
                      v-if="entry.value != null && Number(entry.value) > 0"
                      class="dimension-ring-fill"
                      :d="dimensionArcPath(entry.value)"
                      fill="none"
                      stroke-width="8"
                      stroke-linecap="round"
                      :stroke="tierColor(entry.tier ?? 1)"
                    />
                    <text class="dimension-ring-value" x="50" y="50" text-anchor="middle" dominant-baseline="middle">
                      {{ entry.value != null ? Math.round(Number(entry.value)) : '—' }}%
                    </text>
                  </svg>
                </div>
                <p v-if="entry.insight" class="dimension-insight">{{ entry.insight }}</p>
                <p v-if="entry.raw != null" class="dimension-raw">Raw: {{ entry.raw }}</p>
              </article>
            </div>
          </section>

          <!-- 3. Risk metrics -->
          <section v-if="riskEntries.length" class="risk-section">
            <h2 class="section-heading risk-heading">{{ t.result.riskSectionTitle }}</h2>
            <div class="risk-grid">
              <article
                v-for="entry in riskEntries"
                :key="entry.key"
                class="risk-card"
                :class="['tier-' + (entry.tier ?? 4)]"
              >
                <div class="risk-card-header">
                  <span class="risk-label">{{ entry.label }}</span>
                  <span class="risk-percent">{{ entry.value != null ? Math.round(Number(entry.value)) : '—' }}%</span>
                </div>
                <div class="risk-bar-wrap">
                  <div class="risk-bar-fill" :style="{ width: (entry.value != null ? Math.min(100, Math.max(0, entry.value)) : 0) + '%', background: tierColor(entry.tier ?? 4) }" />
                </div>
                <p v-if="entry.insight" class="risk-insight">{{ entry.insight }}</p>
              </article>
            </div>
          </section>

          <!-- 4. Tips -->
          <section class="tips-section">
            <h2 class="section-heading">{{ t.result.tipsSectionTitle }}</h2>
            <div class="tips-grid">
              <article
                v-for="entry in dimensionEntries"
                :key="entry.key"
                class="tip-card"
                :class="['tier-' + (entry.tier ?? 1)]"
              >
                <h3 class="tip-dimension">{{ entry.label }}</h3>
                <p v-if="getTip(entry.key)" class="tip-text">{{ getTip(entry.key) }}</p>
              </article>
            </div>
          </section>
        </template>
      </div>
    </main>
    </div>
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  padding: 0.5rem 1.75rem 3.25rem;
  background-color: #f5f0eb;
  background-image: url(/comfort.webp);
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  background-attachment: fixed;
  image-rendering: high-quality;
  image-rendering: -webkit-optimize-contrast;
}

.result-layer {
  position: relative;
  z-index: 1;
  max-width: 920px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem 3rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.result-header {
  max-width: 100%;
  margin: 0 auto 2rem;
  padding: 0 0.5rem;
  text-align: center;
}

.lang-switcher-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.lang-switcher-result .lang-btn {
  background: none;
  border: none;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.7;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.lang-switcher-result .lang-btn:hover { opacity: 1; }
.lang-switcher-result .lang-btn.active { color: #2563eb; opacity: 1; }
.lang-switcher-result .lang-sep { color: var(--color-text); opacity: 0.5; }

.result-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-heading);
  letter-spacing: -0.02em;
  margin: 0 0 0.25rem;
}

.result-id {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.9;
  margin: 0 0 1.25rem;
  font-family: ui-monospace, monospace;
  background: rgba(0, 0, 0, 0.06);
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
.result-id:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}
.result-id-copy-icon {
  flex-shrink: 0;
  opacity: 0.85;
}
.result-id:hover .result-id-copy-icon {
  opacity: 1;
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
  max-width: 920px;
  margin: 0 auto;
  padding: 0 0.5rem;
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
  to { transform: rotate(360deg); }
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

/* Overall index */
.overall-section {
  text-align: center;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.overall-heading {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 1rem;
}

.overall-ring-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  aspect-ratio: 1;
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}

.overall-ring-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.overall-ring-track {
  stroke: var(--color-border);
  shape-rendering: geometricPrecision;
}

.overall-ring-fill {
  transition: stroke-dasharray 0.5s ease, opacity 0.3s ease;
  shape-rendering: geometricPrecision;
  vector-effect: non-scaling-stroke;
}

.overall-ring-value {
  font-size: 2rem;
  font-weight: 800;
  fill: var(--color-heading);
}

.overall-ring-label {
  font-size: 0.875rem;
  font-weight: 600;
  fill: var(--color-text);
}

.overall-summary {
  font-size: 1rem;
  line-height: 1.5;
  color: var(--color-text);
  margin: 0;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

/* Dimensions grid */
.section-heading {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 1.25rem;
}

.dimensions-section {
  margin-bottom: 2.5rem;
  padding: 0 0.25rem;
}

.dimensions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.25rem;
}

.dimension-card {
  display: flex;
  flex-direction: column;
  min-height: 260px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.15rem;
  text-align: center;
  transition: box-shadow 0.2s ease;
}

.dimension-card.tier-1 { border-left: 4px solid #22c55e; }
.dimension-card.tier-2 { border-left: 4px solid #eab308; }
.dimension-card.tier-3 { border-left: 4px solid #f97316; }
.dimension-card.tier-4 { border-left: 4px solid #ef4444; }

.dimension-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.dimension-card-header {
  margin-bottom: 0.5rem;
}

.dimension-card-header .dimension-label {
  margin: 0 0 0.5rem;
}

.dimension-percent {
  display: none;
}

.dimension-bar-wrap {
  display: none;
  height: 8px;
  background: var(--color-background-soft);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.dimension-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
  line-height: 1.3;
  min-height: 2.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dimension-ring-wrap {
  flex-shrink: 0;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dimension-ring-svg {
  width: 100px;
  height: 100px;
  display: block;
}

.dimension-ring-track {
  stroke: var(--color-border);
  shape-rendering: geometricPrecision;
}

.dimension-ring-fill {
  transition: stroke-dasharray 0.4s ease, opacity 0.3s ease;
  shape-rendering: geometricPrecision;
  vector-effect: non-scaling-stroke;
}

.dimension-ring-value {
  font-size: 1rem;
  font-weight: 700;
  fill: var(--color-heading);
}

.dimension-insight {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--color-text);
  margin: 0.5rem 0 0;
  text-align: left;
  flex: 1;
  min-height: 0;
}

.dimension-raw {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.7;
  margin: 0.25rem 0 0;
}

.dimension-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

/* Risk section */
.risk-section {
  margin-bottom: 2.5rem;
}

.risk-heading {
  color: #b91c1c;
}

.risk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.25rem;
}

.risk-card {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1.25rem;
}

.risk-card.tier-1 { border-left: 4px solid #22c55e; }
.risk-card.tier-2 { border-left: 4px solid #eab308; }
.risk-card.tier-3 { border-left: 4px solid #f97316; }
.risk-card.tier-4 { border-left: 4px solid #ef4444; }

.risk-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.risk-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-heading);
}

.risk-percent {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-heading);
}

.risk-bar-wrap {
  height: 8px;
  background: var(--color-background-soft);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.risk-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.risk-insight {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--color-text);
  margin: 0;
}

/* Tips section */
.tips-section {
  margin-bottom: 2rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.tip-card {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.1rem;
  text-align: left;
  border-left: 4px solid #94a3b8;
}

.tip-card.tier-1 { border-left-color: #22c55e; }
.tip-card.tier-2 { border-left-color: #eab308; }
.tip-card.tier-3 { border-left-color: #f97316; }
.tip-card.tier-4 { border-left-color: #ef4444; }

.tip-dimension {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.35rem;
}

.tip-text {
  font-size: 0.875rem;
  line-height: 1.45;
  color: var(--color-text);
  margin: 0;
}

/* Mobile: solid dark blue background, dimension tiles same style as risk cards, risk section hidden */
@media (max-width: 640px) {
  .result-page {
    background-image: none;
    background-color: #1a2d4d;
  }

  .dimensions-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .dimension-card {
    min-height: 0;
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 1.25rem;
    text-align: left;
  }

  .dimension-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .dimension-card-header .dimension-label {
    min-height: 0;
    margin: 0;
    justify-content: flex-start;
    font-size: 0.9375rem;
  }

  .dimension-percent {
    display: inline;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-heading);
  }

  .dimension-bar-wrap {
    display: block;
  }

  .dimension-ring-wrap {
    display: none;
  }

  .dimension-insight {
    margin-top: 0.5rem;
  }

  .risk-section {
    display: none;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }
  .overall-ring-svg {
    width: 160px;
    height: 160px;
  }
  .overall-ring-value {
    font-size: 1.5rem;
  }
}
</style>
