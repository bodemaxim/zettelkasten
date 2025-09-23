<script setup lang="ts">
import { type StyleValue, ref, computed, watch } from 'vue'
import { Dialog, Button, InputText, Select, DatePicker } from 'primevue'
import {
  createCard,
  updateCard,
  getCardsByUuid,
  updateCards,
  getAllDefinitions,
  getCardsShortInfo
} from '@/api'
import type { Card, CardEditable, CardsShortInfoRequest } from '@/types'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'
import { getUuidsInString, getAreArraysEqual } from '@/utils'
import CardsMultiselect from './cards-multiselect/cards-multiselect.vue'
import { defaultCard, typeOptionsList, defaultType } from './edit-card-modal.consts'
import { type TypeOption } from './edit-card-modal.types'
import FoldersTreeselect from './folders-treeselect/folders-treeselect.vue'
import TextEditor from './text-editor/text-editor.vue'

const visible = defineModel<boolean>('visible')

const {
  isLoading,
  viewedCard,
  isMobileView,
  setLoading,
  cardsShortInfo,
  setDefinitions,
  setCardsShortInfo,
  currentFolderUuid
} = useStore()

const emits = defineEmits<{
  saved: [uuid: string]
}>()

const updatedCard = ref<CardEditable>({ ...defaultCard })

const title = computed<string>(() =>
  viewedCard.value ? 'Редактировать карточку' : 'Создать карточку'
)

const containerStyles = computed<StyleValue>(() => ({
  padding: isMobileView.value ? '8px' : '20px'
}))

const onCancel = () => {
  visible.value = false
  updatedCard.value = { ...defaultCard }
}

const updateSearchPanel = async (areDefinitionsChanged: boolean) => {
  const request: CardsShortInfoRequest = {
    pagination: { from: 0, to: 99 } //TODO брать актуальную пагинацию
  }

  if (currentFolderUuid.value) request.folderUuid = currentFolderUuid.value

  if (!areDefinitionsChanged) {
    setCardsShortInfo((await getCardsShortInfo(request)).data)
    return
  }

  await Promise.all([
    setDefinitions(await getAllDefinitions()),
    setCardsShortInfo((await getCardsShortInfo(request)).data)
  ])
}

/**
 * Экономично обновляет связанные карточки, редактируемую карточку и панель поиска.
 * @param targetCard - создаваемая/редактируемая карточка
 * @param isNewCard - является ли карточка новой
 */
const updateAllNeeded = async (targetCard: Card, isNewCard: boolean) => {
  const isNewCardWithoutLinks = isNewCard && !targetCard.links.length
  let isNoChangeInLinksOrTitle = false

  if (!isNewCardWithoutLinks) {
    isNoChangeInLinksOrTitle =
      getAreArraysEqual(targetCard.links, viewedCard.value?.links) &&
      targetCard.title === viewedCard.value?.title
  }

  if (isNewCardWithoutLinks || isNoChangeInLinksOrTitle) {
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

  updatedCard.value.createdAt = datetime.value
    ? datetime.value.toISOString()
    : new Date().toISOString()
  console.log(updatedCard.value.createdAt)

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
      type: selectedType.value?.value ?? defaultType.value
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

const selectedType = ref<TypeOption | null>(null)

watch(
  () => viewedCard.value,
  () => {
    switch (viewedCard.value?.type) {
      case 'definition':
        selectedType.value = { ...typeOptionsList[0] }
        break
      case 'article':
        selectedType.value = { ...typeOptionsList[1] }
        break
      default:
        selectedType.value = { ...defaultType }
        break
    }
  }
)

const cardTypes = ref<TypeOption[]>(typeOptionsList)

const defaultDatetime = new Date()

const datetime = ref<Date | null>(defaultDatetime)
</script>

<template>
  <div v-if="visible">
    <CoolSpinner v-if="isLoading" />
    <div class="edit-card-modal" :style="containerStyles">
      <div class="button-close">
        <Button
          type="button"
          icon="pi pi-times"
          size="small"
          severity="secondary"
          class="menu-button"
          @click="visible = false"
        ></Button>
      </div>
      <div v-if="visible" modal :header="title">
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
            <p class="input-label">Дата</p>
            <DatePicker id="datepicker-from" v-model="datetime" show-time hour-format="24" fluid />
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
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-close {
  display: flex;
  justify-content: flex-end;
}

.edit-card-modal {
  position: absolute;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background-color: var(--bg-darker);
}

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
  gap: var(--x2);
  justify-content: flex-end;
}

.input-label {
  min-width: 100px;
}

.input-element {
  width: 100%;
}
</style>
