<script setup lang="ts">
import { type StyleValue, ref, computed, watch } from 'vue'
import { Dialog, Button, InputText, Select } from 'primevue'
import {
  createCard,
  updateCard,
  getCardsByUuid,
  updateCards,
  getAllDefinitions,
  getCardsShortInfo
} from '@/api'
import type { Card, CardEditable } from '@/types'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'
import { getUuidsInString, getAreArraysEqual } from '@/utils'
import CardsMultiselect from './components/cards-multiselect.vue'
import FoldersTreeselect from './components/folders-treeselect.vue'
import TextEditor from './components/text-editor.vue'
import { defaultCard, typeOptionsList, defaultType } from './edit-card-modal.consts'
import { type TypeOption } from './edit-card-modal.types'

const visible = defineModel<boolean>('visible')

const {
  isLoading,
  viewedCard,
  isMobileView,
  setLoading,
  cardsShortInfo,
  setDefinitions,
  setCardsShortInfo
} = useStore()

const emits = defineEmits<{
  saved: [uuid: string]
}>()

const updatedCard = ref<CardEditable>({ ...defaultCard }) //Предотвращает предзаполнение данных

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
  updatedCard.value = { ...defaultCard }
}

const updateSearchPanel = async (areDefinitionsChanged: boolean) => {
  if (!areDefinitionsChanged) {
    setCardsShortInfo((await getCardsShortInfo({ pagination: { from: 0, to: 99 } })).data) //TODO брать актуальную пагинацию
    return
  }

  await Promise.all([
    setDefinitions(await getAllDefinitions()),
    setCardsShortInfo((await getCardsShortInfo({ pagination: { from: 0, to: 99 } })).data) //TODO брать актуальную пагинацию
  ])
}

/**
 * Экономично обновляет связанные карточки, редактируемую карточку и панель поиска.
 * @param targetCard - создаваемая/редактируемая карточка
 * @param isNewCard - является ли карточка новой
 */
const updateAllNeeded = async (targetCard: Card, isNewCard: boolean) => {
  const isNewCardWithoutLinks = isNewCard && !targetCard.links.length
  let isCardWithoutChangedLinks = false

  if (!isNewCardWithoutLinks) {
    isCardWithoutChangedLinks = getAreArraysEqual(targetCard.links, viewedCard.value?.links)
  }

  if (isNewCardWithoutLinks || isCardWithoutChangedLinks) {
    await updateCard(targetCard)
    await updateSearchPanel(targetCard.type === 'definition')
    return
  }

  const linkedCards = await getLinkedCardsForUpdate(targetCard)
  const cardsToUpdate = isNewCard ? linkedCards : [targetCard, ...linkedCards]
  await updateCards(cardsToUpdate)

  const areDefinitionsUpdated = getAreDefinitionsUpdated([targetCard, ...linkedCards])
  await updateSearchPanel(areDefinitionsUpdated)
}

const onSave = async () => {
  if (!updatedCard.value.title) {
    alert('Заполните заголовок карточки')
    return
  }

  setLoading(true)
  let cardUuid = ''
  addUuidHyperLinksFromText()

  if (!viewedCard.value) {
    const newCard = await createCard(updatedCard.value)
    cardUuid = newCard.uuid
    await updateAllNeeded(newCard, true)
  } else {
    const cardForUpdate: Card = {
      ...viewedCard.value,
      ...updatedCard.value,
      type: selectedType.value.value
    }
    cardUuid = cardForUpdate.uuid

    await updateAllNeeded(cardForUpdate, false)
  }

  updatedCard.value = { ...defaultCard }
  visible.value = false

  setLoading(false)
  emits('saved', cardUuid)
}

const getLinkedCardsForUpdate = async (card: Card): Promise<Card[]> => {
  if (!card.links.length) return []

  const cardUuids = card.links.map((link) => link.uuid)

  const cards = await getCardsByUuid(cardUuids)

  const result = cards.map<Card>((item) => {
    const linksWithSameUuid = item.links?.filter((link) => link.uuid === card.uuid) || []

    if (linksWithSameUuid.length === 0) {
      return {
        ...item,
        links: [...(item.links || []), { uuid: card.uuid, title: card.title }]
      }
    }

    const linksWithoutDuplicates = item.links?.filter((link) => link.uuid !== card.uuid) || []

    return {
      ...item,
      links: [...linksWithoutDuplicates, { uuid: card.uuid, title: card.title }]
    }
  })

  return result
}

const addUuidHyperLinksFromText = () => {
  const uuids = getUuidsInString(updatedCard.value.text)

  if (!uuids.length) return

  const existingUuids = new Set(updatedCard.value.links?.map((link) => link.uuid) || [])
  const newUuids = uuids.filter((uuid) => !existingUuids.has(uuid))
  const hyperlinkCards = cardsShortInfo.value.filter((card) => newUuids.includes(card.uuid))

  const newLinks = hyperlinkCards.map((card) => ({ uuid: card.uuid, title: card.title }))
  updatedCard.value.links = [...(updatedCard.value.links || []), ...newLinks]
}

const getAreDefinitionsUpdated = (cards: Card[]): boolean =>
  cards.some((card) => card.type === 'definition')

watch(
  () => viewedCard.value,
  () => {
    if (viewedCard.value) updatedCard.value = { ...viewedCard.value }
    else updatedCard.value = { ...defaultCard }
  }
)

const selectedType = ref<TypeOption>(defaultType)
const cardTypes = ref<TypeOption[]>(typeOptionsList)
</script>

<template>
  <CoolSpinner v-if="isLoading" />
  <Dialog
    v-model:visible="visible"
    modal
    :header="title"
    class="edit-card-modal"
    :style="dialogStyles"
  >
    <div class="modal-content">
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
      <div
        :class="['input-block', { 'input-block-mobile': isMobileView }]"
        :style="{ alignItems: 'start' }"
      >
        <p class="input-label">Текст</p>
        <TextEditor v-model:text="updatedCard.text" />
      </div>
      <div :class="['input-block', { 'input-block-mobile': isMobileView }]">
        <p class="input-label">Ссылки</p>
        <CardsMultiselect v-model="updatedCard.links" />
      </div>
      <div :class="['input-block', { 'input-block-mobile': isMobileView }]">
        <p class="input-label">Выбор папок</p>
        <FoldersTreeselect v-model="updatedCard.folders" />
      </div>
      <div class="buttons-block">
        <Button type="button" label="Отмена" severity="secondary" @click="onCancel"></Button>
        <Button type="button" label="Сохранить" @click="onSave" :disabled="isLoading"></Button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.input-block {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-bottom: 4px;
}

.input-block-mobile {
  flex-direction: column;
}

.buttons-block {
  display: flex;
  gap: 2px;
  justify-content: flex-end;
}

.input-label {
  width: 100px;
}

.input-element {
  width: 100%;
}
</style>

<style>
.edit-card-modal.p-dialog {
  background-color: var(--bg-primary);
}
</style>
