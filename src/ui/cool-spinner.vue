<script setup lang="ts">
import { ProgressSpinner } from 'primevue'
</script>

<template>
  <div class="cool-spinner">
    <ProgressSpinner class="spinner" />
  </div>
</template>

<style scoped>
.cool-spinner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out forwards;
}

.spinner {
  background-color: transparent;
}
</style>