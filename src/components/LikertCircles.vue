<script setup>
import { computed } from 'vue'
import { LIKERT_OPTIONS } from '../data/likertScale.js'

defineProps({
  /** Selected answer: label string (e.g. "Strongly Agree") for API */
  value: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:value'])

const displayOrder = [7, 6, 5, 4, 3, 2, 1]
const optionByScore = computed(() => {
  const map = {}
  LIKERT_OPTIONS.forEach((o) => { map[o.score] = o })
  return map
})

const circleStyle = (score) => {
  if (score === 4) return { size: 'tiny', color: 'neutral' }
  if (score === 7 || score === 1) return { size: 'biggest', color: score >= 5 ? 'agree' : 'disagree' }
  if (score === 6 || score === 2) return { size: 'middle', color: score >= 5 ? 'agree' : 'disagree' }
  if (score === 5 || score === 3) return { size: 'small', color: score >= 5 ? 'agree' : 'disagree' }
  return { size: 'tiny', color: 'neutral' }
}

const circles = computed(() =>
  displayOrder.map((score) => ({
    ...optionByScore.value[score],
    ...circleStyle(score)
  }))
)

function select(label) {
  emit('update:value', label)
}
</script>

<template>
  <div class="likert-circles">
    <span class="axis-label agree-label">Agree</span>
    <div class="circles-row">
      <button
        v-for="opt in circles"
        :key="opt.score"
        type="button"
        class="circle-btn"
        :class="[opt.size, opt.color, { selected: value === opt.label }]"
        :aria-label="opt.label"
        :aria-pressed="value === opt.label"
        @click="select(opt.label)"
      />
    </div>
    <span class="axis-label disagree-label">Disagree</span>
  </div>
</template>

<style scoped>
.likert-circles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  max-width: 640px;
  width: 100%;
}

.axis-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.agree-label {
  align-self: flex-start;
  color: var(--likert-green);
}

.disagree-label {
  align-self: flex-end;
  color: var(--likert-red);
}

.circles-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.15rem;
}

.circle-btn {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px solid;
  background: white;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.2s ease, border-color 0.2s ease;
  padding: 0;
}

.circle-btn:hover {
  transform: scale(1.08);
}

.circle-btn.selected {
  box-shadow: 0 0 0 2px var(--color-background);
}

.circle-btn.agree {
  border-color: var(--likert-green);
  background: white;
}
.circle-btn.agree.selected {
  background: var(--likert-green);
  border-color: var(--likert-green);
}

.circle-btn.disagree {
  border-color: var(--likert-red);
  background: white;
}
.circle-btn.disagree.selected {
  background: var(--likert-red);
  border-color: var(--likert-red);
}

.circle-btn.neutral {
  border-color: var(--likert-gray);
  background: white;
}
.circle-btn.neutral.selected {
  background: var(--likert-gray);
  border-color: var(--likert-gray);
}

.circle-btn.biggest {
  width: 64px;
  height: 64px;
  border-width: 4px;
}
.circle-btn.middle {
  width: 48px;
  height: 48px;
  border-width: 3px;
}
.circle-btn.small {
  width: 38px;
  height: 38px;
  border-width: 2.5px;
}
.circle-btn.tiny {
  width: 28px;
  height: 28px;
  border-width: 2.5px;
}

@media (max-width: 700px) {
  .circle-btn.biggest {
    width: 56px;
    height: 56px;
  }
  .circle-btn.middle {
    width: 44px;
    height: 44px;
  }
  .circle-btn.small {
    width: 34px;
    height: 34px;
  }
  .circle-btn.tiny {
    width: 24px;
    height: 24px;
  }
}
</style>
