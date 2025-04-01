<script setup lang="ts">
import type { Card } from '@/api/types'
import BottomShade from '@/ui/bottom-shade.vue'
import { Button } from 'primevue'
import { deleteCardByUuid } from '@/api'

const viewedCard = defineModel<Card | null>()

const emits = defineEmits<{
  deleted: []
}>()

const deleteCard = async () => {
  if(viewedCard.value) await deleteCardByUuid(viewedCard.value.uuid)
  viewedCard.value = null
  emits('deleted')
  console.debug('1 emits deleted')
}


</script>

<template>
  <div class="view-panel">
    <div v-if="viewedCard" class="view-panel-question">
      <div class="buttons-container">
        <Button v-tooltip.bottom="'Редактировать карточку'" icon="pi pi-file-edit" class="mr-2" severity="secondary" text />
        <Button v-tooltip.bottom="'Удалить карточку'" icon="pi pi-file-excel" class="mr-2" severity="secondary" text @click="deleteCard()" />
        <Button v-tooltip.bottom="'Вернуться к списку'" icon="pi pi-arrow-left" severity="secondary" text />
      </div>
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
  background-color: var(--bg-dark);
  border: 2px solid var(--accent-green);
  padding: 10px 20px;
}

.view-panel-question {
  height: calc(100vh - 80px);
  padding: 30px 15px 10px;
  overflow-y: auto;
  background-color: var(--bg-dark);
}

.buttons-container {
  display: flex;
  flex-direction: row;
  gap: 5px;
  background-color: var(--bg-dark);
  float: right;
}
</style>
