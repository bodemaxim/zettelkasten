<script setup lang="ts">
import { type StyleValue, ref, computed, watch } from 'vue'
import { Dialog, Button, InputText, Textarea } from 'primevue'
import type { Card, CardEditable } from '@/api/types'
import { createCard, updateCard } from '@/api'
import { defaultCard } from './edit-card-modal.consts'
import TextEditor from '@/components/text-editor/text-editor.vue'

const visible = defineModel<boolean>('visible')
const cardOnEdit = defineModel<Card | null>('cardOnEdit')

const emits = defineEmits<{
  saved: []
}>()

const updatedCard = ref<CardEditable>(defaultCard)
const richText = ref('')

const title = computed(() => (cardOnEdit.value ? 'Редактировать карточку' : 'Создать карточку'))

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
  if (!cardOnEdit.value) {
    await createCard(updatedCard.value)
    updatedCard.value = defaultCard
  } else {
    updatedCard.value.text = richText.value

    const newValue: Card = {
      ...cardOnEdit.value,
      ...updatedCard.value
    }

    updateCard(newValue)
  }

  visible.value = false
  emits('saved')
}

watch(
  () => cardOnEdit.value,
  () => {
    if (cardOnEdit.value) updatedCard.value = cardOnEdit.value
    else updatedCard.value = defaultCard
  }
)
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
      <!--
      <div class="input-block">
          <label for="email" class="input-label">Текст</label>
          <Textarea v-model="updatedCard.text" class="input-element textarea" />
        </div>  
      -->
      <div class="input-block">
        <label for="email" class="input-label">Текст</label>
        <TextEditor v-model="richText" />
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

.textarea {
  height: 400px;
}
</style>
