<script setup>
import { RouterView } from 'vue-router'
import DataConsentModal from './components/DataConsentModal.vue'
</script>

<template>
  <DataConsentModal />
  <RouterView :key="$route.fullPath" />
</template>

<style>
#app {
  max-width: 100%;
  margin: 0;
  padding: 0;
}
</style>
