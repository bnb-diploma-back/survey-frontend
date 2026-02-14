<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const STORAGE_KEY = 'survey-data-consent'
const router = useRouter()
const visible = ref(false)

function accept() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, 'accepted')
  } catch (_) {}
}

function decline() {
  visible.value = false
  try {
    localStorage.setItem(STORAGE_KEY, 'declined')
  } catch (_) {}
  router.replace('/declined')
  setTimeout(() => window.close(), 200)
}

onMounted(() => {
  try {
    const consent = localStorage.getItem(STORAGE_KEY)
    // Only show modal when user has not yet accepted or declined
    if (consent !== 'accepted' && consent !== 'declined') {
      visible.value = true
    }
  } catch (_) {
    visible.value = true
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="consent">
      <div v-if="visible" class="consent-overlay" role="dialog" aria-modal="true" aria-labelledby="consent-title">
        <div class="consent-dropdown">
          <h2 id="consent-title" class="consent-title">Data collection</h2>
          <p class="consent-text">
            We collect your survey responses anonymously for research purposes. By continuing, you agree that your
            answers may be used to understand how personalized feeds affect digital life. No personally identifiable
            information is stored.
          </p>
          <div class="consent-actions">
            <button type="button" class="consent-btn secondary" @click="decline">
              Decline
            </button>
            <button type="button" class="consent-btn primary" @click="accept">
              I agree
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.consent-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1.5rem 1.5rem 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

.consent-dropdown {
  width: 100%;
  max-width: 560px;
  background: var(--color-background);
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.18);
  border: 1px solid var(--color-border);
  border-bottom: none;
  padding: 1.5rem 1.75rem 2.75rem;
  padding-bottom: calc(2.75rem + env(safe-area-inset-bottom, 0px));
}

.consent-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 0.75rem;
}

.consent-text {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-text);
  margin: 0 0 1.25rem;
}

.consent-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.consent-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.consent-btn.primary {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  color: white;
}

.consent-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.consent-btn.secondary {
  background: transparent;
  color: var(--color-text);
  border: 2px solid var(--color-border);
}

.consent-btn.secondary:hover {
  background: var(--color-border);
  color: var(--color-heading);
}

/* transitions */
.consent-enter-active,
.consent-leave-active {
  transition: opacity 0.2s ease;
}

.consent-enter-active .consent-dropdown,
.consent-leave-active .consent-dropdown {
  transition: transform 0.2s ease;
}

.consent-enter-from,
.consent-leave-to {
  opacity: 0;
}

.consent-enter-from .consent-dropdown,
.consent-leave-to .consent-dropdown {
  transform: translateY(100%);
}
</style>
