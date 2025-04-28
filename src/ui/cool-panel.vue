<script setup lang="ts"></script>

<template>
  <div class="cool-panel">
    <slot></slot>
  </div>
</template>

<style scoped>
.cool-panel {
  max-width: 100%;
  min-width: 300px;
  background-color: var(--bg-dark);
  border: 2px solid var(--accent-green);
  border-radius: 10px;
  padding: 40px 0 10px 20px;
  overflow: hidden;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .cool-panel {
    width: 100%;
    border-radius: 0;
    border: none;
    padding: 5px;
  }
}
</style>
