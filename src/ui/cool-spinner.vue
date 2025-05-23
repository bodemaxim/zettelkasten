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
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: rgb(0 0 0 / 50%) !important;
  animation: fadeIn 0.3s ease-in-out forwards;
}

.spinner {
  background-color: transparent;
}
</style>