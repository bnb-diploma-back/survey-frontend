import { computed } from 'vue'
import { useLocale } from './useLocale.js'
import { t as en } from '../i18n/en.js'
import { t as ru } from '../i18n/ru.js'

export function useI18n() {
  const { locale, setLocale } = useLocale()
  const t = computed(() => (locale.value === 'ru' ? ru : en))
  return { t, locale, setLocale }
}
