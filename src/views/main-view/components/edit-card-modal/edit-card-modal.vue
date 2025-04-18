<script setup lang="ts">
import { type StyleValue, ref, computed, watch } from 'vue'
import { Dialog, Button, InputText, Textarea, Select } from 'primevue'
import type { Card, CardEditable } from '@/api/types'
import { createCard, updateCard, getCardsByUuid, updateCards } from '@/api'
import { defaultCard } from './edit-card-modal.consts'
import CardsMultiselect from './components/cards-multiselect.vue'
import { type TypeOption } from './edit-card-modal.types'

const visible = defineModel<boolean>('visible')
const cardOnEdit = defineModel<Card | null>('cardOnEdit')

const emits = defineEmits<{
  saved: []
}>()

const updatedCard = ref<CardEditable>(defaultCard)

const title = computed<string>(() =>
  cardOnEdit.value ? 'Редактировать карточку' : 'Создать карточку'
)

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
      console.debug("if")
      const newCard = await createCard(updatedCard.value)
      updateLinkedCards(newCard);
  } else {
    console.debug("else")
    const newValue: Card = {
      ...cardOnEdit.value,
      ...updatedCard.value,
      type: selectedType.value.value
    }

    //TODO: можно объединить запросы в один
    await updateCard(newValue)
    console.debug("card updated!") 
    await updateLinkedCards(newValue);
  }

  updatedCard.value = defaultCard
  visible.value = false
  emits('saved')
}

const updateLinkedCards = async (card: Card): Promise<void> => {
  if (!card.links.length) return;

  console.debug("1 updateLinkedCards")
  const cards = await getCardsByUuid(card.links);
  console.debug("2 cards", cards)

  const updatedCards = cards.map<Card>(item => ({
    ...item,
    links: [...(item.links || []), card.uuid] 
  }));  

  console.debug("3 updatedCards", updatedCards)
  await updateCards(updatedCards);

}

watch(
  () => cardOnEdit.value,
  () => {
    if (cardOnEdit.value) {
      updatedCard.value = { ...cardOnEdit.value }
    } else { 
      updatedCard.value = defaultCard
    }
  }
)

const selectedType = ref<TypeOption>({ value: 'definition', label: 'Определение' })
const cardTypes = ref<TypeOption[]>([
  { value: 'definition', label: 'Определение' },
  { value: 'article', label: 'Статья' }
])
</script>

<template>
  <Dialog v-model:visible="visible" modal :header="title" :style="dialogStyles">
    <div class="dialog-content">
      <div class="input-block">
        <p class="input-label">Заголовок</p>
        <InputText
          v-model="updatedCard.title"
          autocomplete="off"
          id="username"
          class="input-element"
        />
      </div>
      <div class="input-block">
        <p class="input-label">Тип</p>
        <Select
          v-model="selectedType"
          :options="cardTypes"
          optionLabel="label"
          placeholder="Выберите тип карточки"
          class="input-element"
        />
      </div>
      <div class="input-block">
        <p class="input-label">Текст</p>
        <Textarea v-model="updatedCard.text" class="input-element textarea" />
      </div>
      <div class="input-block">
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
