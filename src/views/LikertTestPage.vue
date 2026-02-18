<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import LikertQuestion from '../components/LikertQuestion.vue'
import {
  questions,
  sections,
  getQuestionsForSection
} from '../data/questions.js'
import { saveSurvey, genderToApiEnum } from '../api/survey.js'
import { useI18n } from '../composables/useI18n.js'

const router = useRouter()
const { t, locale, setLocale } = useI18n()
const sectionInstruction = computed(() => t.value.survey.sectionInstruction)

const currentSectionIndex = ref(0)
const currentIndex = ref(0)
const focusedIndex = ref(0)
const answers = ref(questions.map(() => null))
const questionRefs = ref([])
const sectionHeaderRef = ref(null)
const submitting = ref(false)
const submitError = ref(null)

// P1 form
const age = ref('')
const gender = ref('')
const averageScreenTime = ref('')
const p1Errors = ref({ age: '', gender: '', screenTime: '' })

const currentSection = computed(() => sections[currentSectionIndex.value])
const currentSectionTitleRu = computed(() => {
  const section = currentSection.value
  return section ? t.value.survey.sectionTitles[section.id] ?? section.title : ''
})
const isP1 = computed(() => currentSectionIndex.value === 0)
const sectionStartIndexRef = computed(
  () => getQuestionsForSection(currentSectionIndex.value).startIndex
)
const sectionQuestionsRef = computed(
  () => getQuestionsForSection(currentSectionIndex.value).questions
)

const progress = computed(() => {
  const answered = answers.value.filter((a) => a != null && a !== '').length
  return Math.round((answered / questions.length) * 100)
})

const p1Complete = computed(() => {
  const a = String(age.value ?? '').trim()
  const g = gender.value
  const s = String(averageScreenTime.value ?? '').trim()
  if (!a || !g || !s) return false
  const ageNum = parseInt(a, 10)
  const screenNum = parseFloat(s)
  return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 22 && !isNaN(screenNum) && screenNum >= 0
})

const canGoPrevSection = computed(() => currentSectionIndex.value > 0)
const isLastSection = computed(() => currentSectionIndex.value === sections.length - 1)
const isComplete = computed(() => answers.value.every((a) => a != null && a !== ''))

const canShowNextSection = computed(() => {
  if (isP1.value) return p1Complete.value
  const { startIndex, questions: qs } = getQuestionsForSection(currentSectionIndex.value)
  for (let i = 0; i < qs.length; i++) {
    if (answers.value[startIndex + i] == null || answers.value[startIndex + i] === '') return false
  }
  return true
})

/** True when focused question is the last in the current section (P2–P6) */
const isLastQuestionFocused = computed(() => {
  if (isP1.value || sectionQuestionsRef.value.length === 0) return false
  const lastIndex = sectionStartIndexRef.value + sectionQuestionsRef.value.length - 1
  return focusedIndex.value === lastIndex
})

function setQuestionRef(el, index) {
  if (el) questionRefs.value[index] = el
}

function updateFocusedIndex() {
  if (isP1.value) return
  const { startIndex, questions: qs } = getQuestionsForSection(currentSectionIndex.value)
  if (qs.length === 0) return
  const viewportCenter = window.innerHeight / 2
  let best = startIndex
  let bestDist = Infinity
  for (let i = 0; i < qs.length; i++) {
    const idx = startIndex + i
    const el = questionRefs.value[idx]
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const blockCenter = rect.top + rect.height / 2
    const dist = Math.abs(blockCenter - viewportCenter)
    if (dist < bestDist) {
      bestDist = dist
      best = idx
    }
  }
  focusedIndex.value = best
  currentIndex.value = best
}

onMounted(() => {
  window.addEventListener('scroll', updateFocusedIndex, { passive: true })
  window.addEventListener('resize', updateFocusedIndex)
  nextTick(updateFocusedIndex)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateFocusedIndex)
  window.removeEventListener('resize', updateFocusedIndex)
})

function getAnswer(index) {
  return answers.value[index]
}

function setAnswer(index, label) {
  answers.value[index] = label
  const { startIndex, questions: qs } = getQuestionsForSection(currentSectionIndex.value)
  const localIndex = index - startIndex
  if (localIndex < qs.length - 1 && index === focusedIndex.value) {
    nextTick(() => {
      const el = questionRefs.value[index + 1]
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }
}

function scrollToSectionStart() {
  nextTick(() => {
    if (currentSectionIndex.value === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    sectionHeaderRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function goPrevSection() {
  if (currentSectionIndex.value <= 0) return
  currentSectionIndex.value--
  const { startIndex, questions: qs } = getQuestionsForSection(currentSectionIndex.value)
  if (qs.length > 0) {
    focusedIndex.value = startIndex
    currentIndex.value = startIndex
  }
  scrollToSectionStart()
}

function clearP1Error(field) {
  if (p1Errors.value[field]) {
    p1Errors.value = { ...p1Errors.value, [field]: '' }
  }
}

function validateP1() {
  const ageStr = String(age.value ?? '').trim()
  const screenStr = String(averageScreenTime.value ?? '').trim()
  const errors = { age: '', gender: '', screenTime: '' }
  let valid = true
  const e = t.value.survey.errors
  if (!ageStr) {
    errors.age = e.ageRequired
    valid = false
  } else if (!/^\d+$/.test(ageStr)) {
    errors.age = e.ageNumber
    valid = false
  } else {
    const ageNum = parseInt(ageStr, 10)
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 22) {
      errors.age = e.ageRange
      valid = false
    }
  }
  if (!gender.value) {
    errors.gender = e.genderRequired
    valid = false
  }
  if (!screenStr) {
    errors.screenTime = e.screenTimeRequired
    valid = false
  } else if (!/^\d+(\.\d+)?$/.test(screenStr)) {
    errors.screenTime = e.screenTimeNumber
    valid = false
  } else {
    const screenNum = parseFloat(screenStr)
    if (isNaN(screenNum) || screenNum < 0) {
      errors.screenTime = e.screenTimeMin
      valid = false
    }
  }
  p1Errors.value = errors
  return valid
}

function goNextSection() {
  if (currentSectionIndex.value === 0) {
    if (!validateP1()) return
  }
  if (currentSectionIndex.value >= sections.length - 1) return
  currentSectionIndex.value++
  const { startIndex, questions: qs } = getQuestionsForSection(currentSectionIndex.value)
  if (qs.length > 0) {
    focusedIndex.value = startIndex
    currentIndex.value = startIndex
    nextTick(updateFocusedIndex)
  }
  scrollToSectionStart()
}

function handleSubmitClick() {
  if (!isComplete.value) {
    alert(t.value.survey.answerAll)
    return
  }
  submit()
}

async function submit() {
  if (!isComplete.value) return
  submitting.value = true
  submitError.value = null
  const ageStr = String(age.value ?? '').trim()
  const screenStr = String(averageScreenTime.value ?? '').trim()
  const ageNum = parseInt(ageStr, 10)
  const screenNum = parseFloat(screenStr)
  const validAge = Number.isInteger(ageNum) && ageNum >= 18 && ageNum <= 22 ? ageNum : null
  const validGender = genderToApiEnum(gender.value) ?? null
  const validScreenTime = !isNaN(screenNum) && screenNum >= 0 ? screenNum : null

  const body = {
    ...(validAge != null && { age: validAge }),
    ...(validGender != null && { gender: validGender }),
    ...(validScreenTime != null && { averageScreenTime: validScreenTime }),
    questions: questions.map((question, i) => ({
      question,
      answer: answers.value[i] ?? ''
    }))
  }
  try {
    const result = await saveSurvey(body)
    const uuid = result?.uuid ?? result?.id
    if (uuid) {
      router.push(`/survey/${uuid}`)
    } else {
      alert('Survey submitted successfully!')
    }
  } catch (err) {
    console.error(err)
    submitError.value = err.message
    alert(`Failed to submit: ${err.message}`)
  } finally {
    submitting.value = false
  }
}

/** Question text for display (en/ru by locale); API still receives English from questions[] */
function getQuestionDisplay(globalIndex) {
  return t.value?.questions?.[globalIndex] ?? questions[globalIndex] ?? ''
}

const genderOptions = computed(() => [
  { value: 'Male', label: t.value.survey.male },
  { value: 'Female', label: t.value.survey.female }
])
</script>

<template>
  <div class="likert-test-page">
    <header class="test-header">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }" />
      </div>
      <div class="header-nav">
        <nav class="lang-switcher-inline" aria-label="Language">
          <button type="button" class="lang-btn" :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
          <span class="lang-sep">|</span>
          <button type="button" class="lang-btn" :class="{ active: locale === 'ru' }" @click="setLocale('ru')">RU</button>
        </nav>
        <button
          type="button"
          class="nav-btn prev"
          :disabled="!canGoPrevSection"
          @click="goPrevSection"
        >
          {{ t.survey.prevSection }}
        </button>
      </div>
    </header>

    <main class="test-main">
      <!-- P1: About you (one page) -->
      <div v-if="isP1" class="section-page p1-page">
        <div class="p1-card">
          <div class="section-header p1-header">
            <h2 class="p1-title">{{ currentSectionTitleRu }}</h2>
            <p class="section-description">{{ t.survey.p1Description }}</p>
          </div>
          <form class="p1-form" @submit.prevent="goNextSection">
            <div class="form-field">
              <label for="age">{{ t.survey.age }} <span class="required">{{ t.survey.required }}</span></label>
              <input
                id="age"
                v-model="age"
                type="number"
                min="18"
                max="22"
                :placeholder="t.survey.agePlaceholder"
                required
                :aria-invalid="!!p1Errors.age"
                :aria-describedby="p1Errors.age ? 'age-error' : undefined"
                @input="clearP1Error('age')"
              />
              <p v-if="p1Errors.age" id="age-error" class="form-error">{{ p1Errors.age }}</p>
            </div>
            <div class="form-field">
              <label for="gender">{{ t.survey.gender }} <span class="required">{{ t.survey.required }}</span></label>
              <select
                id="gender"
                v-model="gender"
                required
                class="form-select"
                :aria-invalid="!!p1Errors.gender"
                :aria-describedby="p1Errors.gender ? 'gender-error' : undefined"
                @change="clearP1Error('gender')"
              >
                <option value="" disabled>{{ t.survey.selectGender }}</option>
                <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <p v-if="p1Errors.gender" id="gender-error" class="form-error">{{ p1Errors.gender }}</p>
            </div>
            <div class="form-field">
              <label for="screen-time">{{ t.survey.screenTime }} <span class="required">{{ t.survey.required }}</span></label>
              <input
                id="screen-time"
                v-model="averageScreenTime"
                type="number"
                min="0"
                step="0.5"
                :placeholder="t.survey.screenTimePlaceholder"
                required
                :aria-invalid="!!p1Errors.screenTime"
                :aria-describedby="p1Errors.screenTime ? 'screen-time-error' : undefined"
                @input="clearP1Error('screenTime')"
              />
              <p v-if="p1Errors.screenTime" id="screen-time-error" class="form-error">{{ p1Errors.screenTime }}</p>
            </div>
          </form>
        </div>
      </div>

      <!-- P2–P6: One section per page -->
      <div v-else class="section-page">
        <div ref="sectionHeaderRef" class="section-header section-header-questions">
          <h3 class="section-title">{{ currentSectionTitleRu }}</h3>
          <p class="section-description">{{ sectionInstruction }}</p>
        </div>
        <div
          v-for="(q, i) in sectionQuestionsRef"
          :key="sectionStartIndexRef + i"
          :ref="(el) => setQuestionRef(el, sectionStartIndexRef + i)"
          class="question-block"
        >
          <LikertQuestion
            :question="getQuestionDisplay(sectionStartIndexRef + i)"
            :value="getAnswer(sectionStartIndexRef + i)"
            :dimmed="sectionStartIndexRef + i !== focusedIndex"
            @update:value="setAnswer(sectionStartIndexRef + i, $event)"
          />
        </div>
        <!-- Next/Submit right after last question when it's focused -->
        <nav v-if="isLastQuestionFocused" class="test-nav test-nav-inline">
          <button
            v-if="!isLastSection"
            type="button"
            class="nav-btn next pill-btn"
            :disabled="!canShowNextSection"
            @click="goNextSection"
          >
            <span class="pill-btn-text">{{ t.survey.next }}</span>
            <svg class="pill-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button
            v-else
            type="button"
            class="nav-btn submit pill-btn"
            :disabled="submitting"
            @click.prevent="handleSubmitClick"
          >
            <span class="pill-btn-text">{{ submitting ? t.survey.submitting : t.survey.submit }}</span>
          </button>
        </nav>
      </div>

      <nav v-if="isP1 || !isLastQuestionFocused" class="test-nav">
        <button
          v-if="!isLastSection"
          type="button"
          class="nav-btn next pill-btn"
          :disabled="!isP1 && !canShowNextSection"
          @click="goNextSection"
        >
          <span class="pill-btn-text">{{ t.survey.next }}</span>
          <svg class="pill-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
        <button
          v-else
          type="button"
          class="nav-btn submit pill-btn"
          :disabled="submitting"
          @click.prevent="handleSubmitClick"
        >
          <span class="pill-btn-text">{{ submitting ? t.survey.submitting : t.survey.submit }}</span>
        </button>
      </nav>

      <p v-if="submitError" class="submit-error">{{ submitError }}</p>
    </main>
  </div>
</template>

<style scoped>
.likert-test-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem 2rem;
}

.test-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-background);
  padding: 1rem 0 0.75rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 0.75rem;
}

.progress-bar {
  height: 6px;
  background: var(--color-background-mute);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: var(--likert-accent);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.85;
  margin: 0;
}

.progress-section {
  opacity: 0.75;
}

.header-nav {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.lang-switcher-inline {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.lang-switcher-inline .lang-btn {
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.7;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.lang-switcher-inline .lang-btn:hover { opacity: 1; }
.lang-switcher-inline .lang-btn.active { color: #2563eb; opacity: 1; }
.lang-switcher-inline .lang-sep { color: var(--color-text); opacity: 0.5; }

.header-nav .nav-btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.test-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0 2rem;
}

.section-page {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
}

.section-page:not(.p1-page) {
  padding: 0 0 40vh;
}

/* Scroll target: section header sits just below sticky header when entering section */
.section-header-questions {
  scroll-margin-top: 5.5rem;
}

/* P1: About you – card and form */
.p1-page {
  padding: 0;
}

.p1-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.p1-header {
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 2px solid var(--color-border);
}

.p1-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.section-header .section-description {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text);
  opacity: 0.9;
  line-height: 1.5;
}

.p1-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  line-height: 1.4;
}

.form-field .required {
  color: var(--likert-red, #ef4444);
}

.form-error {
  font-size: 0.875rem;
  color: #dc2626;
  margin: 0.25rem 0 0;
  line-height: 1.3;
}

.form-field input[type='number'] {
  width: 100%;
  max-width: 280px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  -moz-appearance: textfield;
}

/* Hide number input up/down spinner arrows */
.form-field input[type='number']::-webkit-inner-spin-button,
.form-field input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-field input[type='number']:focus {
  outline: none;
  border-color: var(--likert-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--likert-accent) 20%, transparent);
}

.form-field input[type='number']::placeholder {
  color: var(--color-text);
  opacity: 0.5;
}

.form-select {
  width: 100%;
  max-width: 280px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

.form-select:focus {
  outline: none;
  border-color: var(--likert-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--likert-accent) 20%, transparent);
}

.form-select option {
  padding: 0.5rem;
}

/* Section header (P2–P6) */
.section-header.section-header-questions {
  width: 100%;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
  line-height: 1.3;
}

.question-block {
  width: 100%;
}

/* Almost invisible line between questions (very slight bold) */
.question-block + .question-block {
  border-top: 1.5px solid rgba(0, 0, 0, 0.09);
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

.test-nav {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding: 1rem 0 0.5rem;
  flex-wrap: wrap;
  position: sticky;
  bottom: 0;
  background: transparent;
  z-index: 5;
}

/* When on last question: nav sits right after questions, not sticky at bottom */
.test-nav-inline {
  position: static;
  margin-top: 1.5rem;
  padding: 0.5rem 0 2rem;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.nav-btn.prev {
  background: var(--color-background-mute);
  color: var(--color-text);
}

.nav-btn.prev:not(:disabled):hover {
  background: var(--color-border-hover);
}

/* Pill Next/Submit: purple, same height as circles (~56px), right arrow */
.pill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 56px;
  padding: 0 1.75rem;
  border-radius: 9999px;
  font-weight: 600;
  white-space: nowrap;
}

.nav-btn.next.pill-btn,
.nav-btn.submit.pill-btn {
  background: #2563eb;
  color: white;
}

.nav-btn.next.pill-btn:not(:disabled):hover,
.nav-btn.submit.pill-btn:not(:disabled):hover {
  background: #3b82f6;
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.pill-btn-text {
  font-size: 1rem;
}

.pill-btn-arrow {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

@media (max-width: 700px) {
  .pill-btn {
    min-height: 52px;
    padding: 0 1.5rem;
  }
}

.submit-error {
  color: #c00;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
