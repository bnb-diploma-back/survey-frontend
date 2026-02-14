<script setup>
// Optional: try to close window if it was opened as popup
import { onMounted } from 'vue'
onMounted(() => {
  setTimeout(() => window.close(), 200)
})
</script>

<template>
  <div class="declined-page">
    <div class="declined-content">
      <h1 class="declined-title">You declined</h1>
      <p class="declined-text">
        You have not agreed to data collection. You may close this tab.
      </p>
    </div>
  </div>
</template>

<style scoped>
.declined-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  background: var(--color-background, #f5f5f5);
}

.declined-content {
  max-width: 560px;
  text-align: center;
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.declined-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-heading);
  margin: 0 0 1rem;
}

.declined-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
}
</style>
