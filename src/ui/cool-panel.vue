<script setup lang="ts"></script>

<template>
  <div class="cool-panel">
    <slot></slot>
  </div>
</template>

<style scoped>
.cool-panel {
  min-width: 300px;
  max-width: 100%;
  overflow: hidden;
  padding: 40px 0 10px 20px;
  border: 2px solid var(--accent-green);
  border-radius: 10px;
  background-color: var(--bg-dark);
  box-shadow: 0 0.5rem 1rem rgb(0 0 0 / 15%);
}

@media (width <= 768px) {
  .cool-panel {
    width: 100%;
    padding: 20px 0 20px 20px;
    border: none;
    border-radius: 0;
  }
}
</style>
