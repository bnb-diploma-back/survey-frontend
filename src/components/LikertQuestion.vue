<script setup>
import LikertCircles from './LikertCircles.vue'

defineProps({
  question: {
    type: String,
    required: true
  },
  /** Selected answer: label string (e.g. "Strongly Agree") for API */
  value: {
    type: String,
    default: null
  },
  /** Whether this question is "past" (reduced opacity) */
  dimmed: {
    type: Boolean,
    default: false
  },
  /** When false, only show question text (circles shown in fixed position by parent) */
  showCircles: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:value'])
</script>

<template>
  <div class="likert-question" :class="{ dimmed }">
    <h2 class="question-text">{{ question }}</h2>
    <!-- Spacer when circles are fixed elsewhere, so layout height is consistent -->
    <div v-if="!showCircles" class="likert-spacer" aria-hidden="true" />
    <div v-else class="likert-scale">
      <LikertCircles :value="value" @update:value="emit('update:value', $event)" />
    </div>
  </div>
</template>

<style scoped>
.likert-question {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 0;
  transition: opacity 0.3s ease;
}

.likert-question.dimmed {
  opacity: 0.35;
}

.likert-question.dimmed:hover {
  opacity: 0.7;
}

.question-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
  line-height: 1.4;
  margin-bottom: 2rem;
  text-align: left;
}

.likert-spacer {
  min-height: 100px;
}

.likert-scale {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

@media (max-width: 700px) {
  .question-text {
    font-size: 1.25rem;
  }
}
</style>
