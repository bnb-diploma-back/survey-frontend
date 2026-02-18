import { ref } from 'vue'

const STORAGE_KEY = 'survey-locale'

function getStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'ru' || v === 'en' ? v : 'en'
  } catch {
    return 'en'
  }
}

const locale = ref(getStored())

export function useLocale() {
  function setLocale(lang) {
    if (lang === 'ru' || lang === 'en') {
      locale.value = lang
      try {
        localStorage.setItem(STORAGE_KEY, lang)
      } catch (_) {}
    }
  }
  return { locale, setLocale }
}
