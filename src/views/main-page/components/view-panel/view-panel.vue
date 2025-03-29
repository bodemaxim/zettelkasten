<script setup lang="ts">
import type { Card } from '@/api/types'

const viewedCard = defineModel<Card | null>()
</script>

<template>
  <div class="view-panel">
    <div v-if="viewedCard" class="view-panel-question">
      <h2>{{ viewedCard?.title }}</h2>
      <p>{{ viewedCard?.text }}</p>
      <hr />
    </div>
    <p v-else>Выберите вопрос, чтобы посмотреть ответ на него.</p>
    <BottomShade />
  </div>
</template>

<style scoped>
.view-panel {
  border-radius: 10px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 2px solid var(--accent-green);
  padding: 10px 20px;
}

.view-panel-question {
  height: calc(100vh - 80px);
  padding: 30px 15px 10px;
  overflow-y: auto;
}
</style>
