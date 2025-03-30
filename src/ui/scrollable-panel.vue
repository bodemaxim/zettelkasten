<script setup lang="ts"></script>

<template>
  <div class="view-panel">
    <div class="view-panel-content">
      <slot></slot>
    </div>
    <BottomShade />
  </div>
</template>

<style scoped>
.view-panel {
  border-radius: 10px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
  background-color: var(--bg-dark);
  border: 2px solid var(--accent-green);
  padding: 10px 20px;
}

.view-panel-content {
  padding: 30px 15px 10px;
  overflow-y: auto;
  background-color: var(--bg-dark);
}
</style>
