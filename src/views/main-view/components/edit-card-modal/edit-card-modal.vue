<script setup lang="ts">
import { type StyleValue, ref, computed, watch } from 'vue'
import { Dialog, Button, InputText, Textarea, Select } from 'primevue'
import type { Card, CardEditable } from '@/api/types'
import { createCard, updateCard, getCardsByUuid, updateCards } from '@/api'
import { defaultCard, typeOptionsList } from './edit-card-modal.consts'
import CardsMultiselect from './components/cards-multiselect.vue'
import { type TypeOption } from './edit-card-modal.types'
import { useStore } from '@/use-store'

const visible = defineModel<boolean>('visible')

const { viewedCard, isMobileView } = useStore()

const emits = defineEmits<{
  saved: []
}>()

const updatedCard = ref<CardEditable>(defaultCard)

const title = computed<string>(() =>
  viewedCard.value ? 'Редактировать карточку' : 'Создать карточку'
)

const dialogStyles = computed<StyleValue>(() => ({
  width: isMobileView ? '100%' : 'calc(100% - 20px)',
  height: '100%',
  padding: '10px',
  overflow: 'hidden'
}))

const onCancel = () => {
  visible.value = false
  updatedCard.value = defaultCard
}

const onSave = async () => {
  if (!viewedCard.value) {
    const newCard = await createCard(updatedCard.value)
    updateLinkedCards(newCard)
  } else {
    const newValue: Card = {
      ...viewedCard.value,
      ...updatedCard.value,
      type: selectedType.value.value
    }

    //TODO: можно объединить запросы в один
    await updateCard(newValue)
    await updateLinkedCards(newValue)
  }

  updatedCard.value = defaultCard
  visible.value = false
  emits('saved')
}

const updateLinkedCards = async (card: Card): Promise<void> => {
  if (!card.links.length) return

  const cardUuids = card.links.map((link) => link.uuid)

  const cards = await getCardsByUuid(cardUuids)

  const updatedCards = cards.map<Card>((item) => {
    const linkExists = item.links?.some((link) => link.uuid === card.uuid)

    if (linkExists) return item

    return {
      ...item,
      links: [...(item.links || []), { uuid: card.uuid, title: card.title }]
    }
  })

  await updateCards(updatedCards)
}

watch(
  () => viewedCard.value,
  () => {
    if (viewedCard.value) {
      updatedCard.value = { ...viewedCard.value }
    } else {
      updatedCard.value = defaultCard
    }
  }
)

const selectedType = ref<TypeOption>({ value: 'definition', label: 'Определение' })
const cardTypes = ref<TypeOption[]>(typeOptionsList)
</script>

<template>
  <Dialog v-model:visible="visible" modal :header="title" class="dialog" :style="dialogStyles">
    <div class="dialog-content">
      <div :class="['input-block', { 'input-block-mobile': isMobileView }]">
        <p class="input-label">Заголовок</p>
        <InputText
          v-model="updatedCard.title"
          autocomplete="off"
          id="username"
          class="input-element"
        />
      </div>
      <div :class="['input-block', { 'input-block-mobile': isMobileView }]">
        <p class="input-label">Тип</p>
        <Select
          v-model="selectedType"
          :options="cardTypes"
          optionLabel="label"
          placeholder="Выберите тип карточки"
          class="input-element"
        />
      </div>
      <div :class="['input-block', { 'input-block-mobile': isMobileView }]">
        <p class="input-label">Текст</p>
        <Textarea v-model="updatedCard.text" class="input-element textarea" />
      </div>
      <div :class="['input-block', { 'input-block-mobile': isMobileView }]">
        <p class="input-label">Ссылки</p>
        <CardsMultiselect v-model="updatedCard.links" />
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

.input-block-mobile {
  flex-direction: column;
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
  resize: none;
  margin: 10px 0;
}
</style>
