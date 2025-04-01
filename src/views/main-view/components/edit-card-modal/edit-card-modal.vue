<script setup lang="ts">
import { type StyleValue, ref, computed } from 'vue'
import { Dialog, Button, InputText, Textarea } from 'primevue'
import type { NewCard } from '@/api/types'
import { createCard } from '@/api'

const visible = defineModel<boolean>('visible')
const uuidForEdit = defineModel<string | null>('uuidForEdit')

const emits = defineEmits<{
  saved: []
}>()

const defaultCard: NewCard = {
  title: '',
  text: '',
  links: []
}

const updatedCard = ref<NewCard>(defaultCard)

const title = computed(() => (uuidForEdit.value ? 'Редактировать карточку' : 'Создать карточку'))

const dialogStyles = computed<StyleValue>(() => ({
  width: '80%',
  height: 'calc(100% - 40px)',
  padding: '20px'
}))

const onCancel = () => {
  visible.value = false
  updatedCard.value = defaultCard
}

const onSave = async () => {
  await createCard(updatedCard.value)
  updatedCard.value = defaultCard
  visible.value = false
  emits('saved')
}
</script>

<template>
  <Dialog v-model:visible="visible" modal :header="title" :style="dialogStyles">
    <div class="dialog-content">
      <div class="input-block">
        <label for="username" class="input-label">Заголовок</label>
        <InputText
          v-model="updatedCard.title"
          autocomplete="off"
          id="username"
          class="input-element"
        />
      </div>
      <div class="input-block">
        <label for="email" class="input-label">Текст</label>
        <Textarea v-model="updatedCard.text" class="input-element" />
      </div>
      <div class="buttons-block">
        <Button type="button" label="Отмена" severity="secondary" @click="onCancel"></Button>
        <Button type="button" label="Сохранить" @click="onSave"></Button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.input-block {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.buttons-block {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}

.input-label {
  width: 100px;
}

.input-element {
  width: 100%;
}
</style>
