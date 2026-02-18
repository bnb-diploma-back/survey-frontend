<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from '../composables/useI18n.js'

const router = useRouter()
const { t, locale, setLocale } = useI18n()
const DIMENSIONS = computed(() => t.value.dimensions)

// Mock percentages for the results preview visual (matches demo feel)
const previewScores = [72, 45, 58, 81, 34, 67, 52, 63]

function takeTest() {
  router.push('/survey')
}

function obtainResult() {
  router.push('/result')
}
</script>

<template>
  <div class="landing-page">
    <div class="landing-wrap">
      <nav class="lang-switcher" aria-label="Language">
        <button type="button" class="lang-btn" :class="{ active: locale === 'en' }" @click="setLocale('en')">EN</button>
        <span class="lang-sep">|</span>
        <button type="button" class="lang-btn" :class="{ active: locale === 'ru' }" @click="setLocale('ru')">RU</button>
      </nav>
      <section class="landing-hero">
        <div class="landing-content">
          <h1 class="landing-title">{{ t.landing.title }}</h1>
          <p class="landing-subtitle">{{ t.landing.subtitle }}</p>

          <div class="landing-body">
            <p>{{ t.landing.body1 }}</p>
            <p>{{ t.landing.body2 }}</p>
            <div class="landing-dimensions">
              <span
                v-for="(dim, i) in DIMENSIONS"
                :key="i"
                class="landing-pill"
              >{{ dim }}</span>
            </div>
            <p class="landing-note">{{ t.landing.note }}</p>
          </div>

          <div class="landing-actions">
            <button type="button" class="landing-btn primary" @click="takeTest">
              <span class="pill-btn-text">{{ t.landing.takeTest }}</span>
              <svg class="pill-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button type="button" class="landing-btn secondary" @click="obtainResult">
              {{ t.landing.obtainResult }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  min-height: 100dvh;
  height: 100vh;
  height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
  background-color: var(--color-background);
  background-image: url('https://cdn.dribbble.com/userupload/17895702/file/original-394f4e833f7da67c21051c6ce5ae54c1.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll;
}

.landing-wrap {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.lang-switcher {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 0;
}

.lang-btn {
  background: #fff;
  border: none;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.85;
  cursor: pointer;
  padding: 0.4rem 0.75rem;
  border-radius: 10px;
  transition: opacity 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.lang-btn:hover {
  opacity: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.lang-btn.active {
  color: #2563eb;
  opacity: 1;
}

.lang-sep {
  color: var(--color-text);
  opacity: 0.5;
  user-select: none;
}

.landing-hero {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.landing-content {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.8);
  width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.landing-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-heading);
  line-height: 1.25;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
  flex-shrink: 0;
}

.landing-subtitle {
  font-size: 1.125rem;
  color: var(--color-text);
  opacity: 0.9;
  margin: 0 0 1.75rem;
  line-height: 1.4;
  flex-shrink: 0;
}

.landing-body {
  text-align: left;
  margin-bottom: 2rem;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.landing-body p {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--color-text);
  margin: 0 0 1rem;
}

.landing-dimensions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.6rem;
  margin: 0.5rem 0 0.75rem;
}

.landing-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-heading);
  background: var(--color-background-mute);
  border-radius: 9999px;
  line-height: 1.3;
  border: 1px solid var(--color-border);
}

.landing-note {
  margin-top: 1.25rem;
  font-size: 0.9375rem;
  opacity: 0.9;
}

.landing-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.landing-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 56px;
  padding: 0 1.75rem;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.landing-btn.primary {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}

.landing-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.landing-btn.secondary {
  background: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.landing-btn.secondary:hover {
  border-color: var(--color-border-hover);
  background: var(--color-background-mute);
}

.pill-btn-text {
  font-size: 1rem;
}

.pill-btn-arrow {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

/* Mobile: fit in viewport, no page scroll; header and buttons always on screen */
@media (max-width: 768px) {
  .landing-page {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: 100dvh;
  }

  .landing-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: max(1rem, env(safe-area-inset-left));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .landing-hero {
    padding: 0.5rem 0;
    align-items: stretch;
  }

  .landing-content {
    padding: 1.25rem 1rem;
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-height: 100%;
  }

  .landing-title {
    font-size: 1.35rem;
    margin-bottom: 0.35rem;
  }

  .landing-subtitle {
    font-size: 0.9375rem;
    margin-bottom: 1rem;
  }

  .landing-body {
    margin-bottom: 1rem;
  }

  .landing-body p {
    font-size: 0.9375rem;
    margin-bottom: 0.5rem;
  }

  .landing-dimensions {
    margin: 0.35rem 0 0.5rem;
    gap: 0.4rem 0.5rem;
  }

  .landing-pill {
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
  }

  .landing-note {
    margin-top: 0.75rem;
    font-size: 0.8125rem;
  }

  .landing-btn {
    min-height: 48px;
    padding: 0 1.25rem;
    font-size: 0.9375rem;
  }
}

@media (max-width: 700px) {
  .landing-pill {
    font-size: 0.75rem;
    padding: 0.3rem 0.7rem;
  }
}

@media (min-width: 769px) and (max-width: 900px) {
  .landing-title {
    font-size: 1.45rem;
  }

  .landing-subtitle {
    font-size: 1rem;
  }

  .landing-btn {
    min-height: 52px;
    padding: 0 1.5rem;
  }

  .landing-content {
    padding: 1.75rem 1.25rem;
  }
}
</style>
