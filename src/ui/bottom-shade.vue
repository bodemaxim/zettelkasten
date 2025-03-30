<script setup lang="ts"></script>

<template>
  <div class="bottom-shade__gradient"></div>
</template>

<style scoped>
.bottom-shade__gradient {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, var(--bg-dark) 100%);
  height: 8px;
  margin: 0;
}
</style>
