<script setup lang="ts">
import type { Card } from '@/api/types'
import BottomShade from '@/ui/bottom-shade.vue'
import { Button } from 'primevue'
import { deleteCardByUuid } from '@/api'
import { isMobileView } from '@/store/store'

const viewedCard = defineModel<Card | null>()

const emits = defineEmits<{
  deleted: [],
  edited: [],
}>()

const deleteCard = async () => {
  if(viewedCard.value) await deleteCardByUuid(viewedCard.value.uuid)
  viewedCard.value = null
  emits('deleted')
}

const editCard = () => {
  emits('edited')
}

const closeCard = () => {
  viewedCard.value = null
}
</script>

<template>
  <div class="view-panel">
    <div v-if="viewedCard" class="view-panel-question">
      <div class="buttons-container">
        <Button :v-tooltip.bottom="isMobileView ? 'Редактировать карточку' : undefined" icon="pi pi-file-edit" class="mr-2" severity="secondary" text  @click="editCard()"/>
        <Button :v-tooltip.bottom="isMobileView ? 'Удалить карточку' : undefined" icon="pi pi-file-excel" class="mr-2" severity="secondary" text @click="deleteCard()" />
        <Button v-if="isMobileView" :v-tooltip.bottom="isMobileView ? 'Вернуться к списку' : undefined" icon="pi pi-arrow-left" severity="secondary" text @click="closeCard()"/>
      </div>
      <h2>{{ viewedCard?.title }}</h2>
      <p>{{ viewedCard?.text }}</p>
      <hr />
    </div>
    <p v-else>Выберите карточку, чтобы посмотреть содержание.</p>
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
