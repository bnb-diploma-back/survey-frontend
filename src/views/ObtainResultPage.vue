<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getSurveyById } from '../api/survey.js'
import { useI18n } from '../composables/useI18n.js'

const { t, locale, setLocale } = useI18n()

const router = useRouter()
const surveyId = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  const id = surveyId.value?.trim()
  if (!id) {
    error.value = t.value.obtain.errorIdRequired
    return
  }
  error.value = ''
  loading.value = true
  try {
    await getSurveyById(id)
    router.push(`/survey/${encodeURIComponent(id)}`)
  } catch (e) {
    error.value = e?.message ?? t.value.obtain.errorNotFound
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="obtain-page">
    <div class="obtain-card">
      <nav class="lang-switcher-obtain" aria-label="Language">
        <button type="button" class="lang-btn" :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
        <span class="lang-sep">|</span>
        <button type="button" class="lang-btn" :class="{ active: locale === 'ru' }" @click="setLocale('ru')">RU</button>
      </nav>
      <h1 class="obtain-title">{{ t.obtain.title }}</h1>
      <p class="obtain-desc">{{ t.obtain.description }}</p>
      <form class="obtain-form" @submit.prevent="submit">
        <input
          v-model="surveyId"
          type="text"
          class="obtain-input"
          :placeholder="t.obtain.placeholder"
          autocomplete="off"
          @input="error = ''"
        />
        <p v-if="error" class="obtain-error">{{ error }}</p>
        <button type="submit" class="btn primary" :disabled="loading">
          {{ loading ? t.obtain.checking : t.obtain.viewResults }}
        </button>
      </form>
      <router-link to="/" class="obtain-back">{{ t.obtain.backToHome }}</router-link>
    </div>
  </div>
</template>

<style scoped>
.obtain-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--color-background);
  background-image: url('https://cdn.dribbble.com/userupload/17895702/file/original-394f4e833f7da67c21051c6ce5ae54c1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.obtain-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-background);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border);
}

.lang-switcher-obtain {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.lang-switcher-obtain .lang-btn {
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.7;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.lang-switcher-obtain .lang-btn:hover { opacity: 1; }
.lang-switcher-obtain .lang-btn.active { color: #2563eb; opacity: 1; }
.lang-switcher-obtain .lang-sep { color: var(--color-text); opacity: 0.5; }

.obtain-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
}

.obtain-desc {
  font-size: 0.9375rem;
  color: var(--color-text);
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.obtain-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.obtain-input {
  width: 100%;
  max-width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background);
  color: var(--color-heading);
  box-sizing: border-box;
}

.obtain-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.obtain-input::placeholder {
  color: var(--color-text);
  opacity: 0.7;
}

.obtain-error {
  font-size: 0.875rem;
  color: #b91c1c;
  margin: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn.primary {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  color: white;
  margin-top: 0.25rem;
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.obtain-back {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.35em 0.6em;
  border-radius: 6px;
  font-size: 0.9375rem;
  color: var(--color-text);
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.obtain-back:hover {
  color: #2563eb;
  background-color: rgba(37, 99, 235, 0.12);
}
</style>
