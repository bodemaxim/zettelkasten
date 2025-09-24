<script setup lang="ts">
import { type StyleValue, ref, computed, watch } from 'vue'
import { Dialog, Button, InputText, Select, DatePicker, IftaLabel } from 'primevue'
import {
  createCard,
  updateCard,
  getCardsByUuid,
  updateCards,
  getAllDefinitions,
  getCardsShortInfo
} from '@/api'
import type { Card, CardEditable, CardsShortInfoRequest } from '@/types'
import CoolForm from '@/ui/cool-form.vue'
import CoolSpinner from '@/ui/cool-spinner.vue'
import FullScreenModal from '@/ui/full-screen-modal.vue'
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
  padding: isMobileView.value ? '8px' : '40px'
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
  <FullScreenModal
    v-model:visible="visible"
    :title="title"
    :is-loading="isLoading"
    :is-mobile-view="isMobileView"
  >
    <div class="edit-card-modal" :style="containerStyles">
      <div v-if="visible">
        <div class="modal-content">
          <div :class="isMobileView ? '' : 'flex-b space-x-4 my-4'">
            <CoolForm
              id="title"
              v-model="updatedCard.title"
              type="text"
              label="Заголовок"
              class="w-full md:w-1/2"
            />

            <div :class="isMobileView ? 'flex-b w-full my-2' : 'flex-b w-1/2 space-x-4 '">
              <Select
                v-model="selectedType"
                id="cardtype"
                :options="cardTypes"
                optionLabel="label"
                placeholder="Выберите тип карточки"
                class="w-1/2 h-[60px] md:w-1/2"
              />

              <IftaLabel for="datetime" class="w-1/2">
                <label for="datetime" class="label">Дата</label>
                <DatePicker id="datetime" v-model="datetime" show-time hour-format="24" fluid />
              </IftaLabel>
            </div>
          </div>

          <TextEditor v-model:text="updatedCard.text" class="my-5" />

          <div :class="{ 'bottom-container': !isMobileView }" class="my-5">
            <div :class="isMobileView ? 'my-2' : 'flex-b w-full'">
              <CardsMultiselect
                v-model="updatedCard.links"
                class="w-full my-2 md:my-0 md:w-2/3 h-[44px]"
              />
              <FoldersTreeselect
                v-model="updatedCard.folders"
                class="w-full my-2 md:my-0 md:w-1/3 h-[44px]"
              />
            </div>

            <div class="flex-b my-5">
              <Button
                type="button"
                label="Отмена"
                severity="secondary"
                @click="onCancel"
                class="w-1/2 lg:w-40"
              ></Button>
              <Button
                type="button"
                label="Сохранить"
                @click="onSave"
                :disabled="isLoading"
                class="w-1/2 lg:w-40"
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenModal>
</template>

<style scoped>
.flex-mobile {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.bottom-container {
  display: flex;
  gap: var(--x2);
  align-items: center;
  justify-content: space-between;
}

@media (width <= 1024px) and (width >= 768px) {
  .bottom-container {
    display: block;
    margin: var(--x2) 0;
  }
}
</style>
