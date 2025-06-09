<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { Button, ConfirmDialog } from 'primevue'
import { useConfirm } from 'primevue/useconfirm'
import { deleteCardByUuid, getCardByUuid, getCardsByUuid, updateCards } from '@/api'
import type { Card, CardShortInfo, FolderShortInfo } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'
import { getUuidsInString } from '@/utils'
import TextViewer from './components/text-viewer.vue'

const emits = defineEmits<{
  deleted: []
  edited: []
  clickOnLink: [uuid: string]
}>()

const {
  isMobileView,
  isLoading,
  setLoading,
  definitions,
  viewedCard,
  setViewedCard,
  cardsShortInfo,
  setCardsShortInfo,
  setDefinitions,
  folders
} = useStore()
const confirm = useConfirm()

const viewedCardUuid = defineModel<string | null>()

watch(
  () => viewedCardUuid.value,
  async () => viewCard(viewedCardUuid.value)
)

onMounted(async () => viewCard(viewedCardUuid.value))

const viewCard = async (cardUuid: string | null | undefined): Promise<void> => {
  if (!cardUuid) {
    setViewedCard(null)
    return
  }

  const preloadedDefinition: Card | null =
    definitions.value.find((item) => item.uuid === cardUuid) ?? null

  if (preloadedDefinition) {
    setViewedCard(preloadedDefinition)
    return
  }

  setLoading(true)
  setViewedCard(await getCardByUuid(cardUuid))
  setLoading(false)
}

const deleteCard = async () => {
  confirm.require({
    message: 'Вы уверены, что хотите удалить карточку?',
    header: 'Подтверждение',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Нет',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Да'
    },
    accept: deleteCardOnAccept
  })
}

const deleteCardOnAccept = async () => {
  setLoading(true)

  if (viewedCard.value) {
    await Promise.all([
      deleteCardByUuid(viewedCard.value.uuid),
      deleteLinksToCard(viewedCard.value)
    ])

    /*
     TODO: в качестве будущей оптимизации,
     можно написать методы deleteFromCardsShortInfo и deleteFromDefinitions
    */
    const newCardsShortInfo: CardShortInfo[] = cardsShortInfo.value.filter(
      (item) => item.uuid !== viewedCard.value?.uuid
    )
    setCardsShortInfo(newCardsShortInfo)

    if (viewedCard.value.type !== 'definition') return

    const newDefinitions: Card[] = definitions.value.filter(
      (item) => item.uuid !== viewedCard.value?.uuid
    )
    setDefinitions(newDefinitions)
  }

  viewedCard.value = null
  emits('deleted')
  setLoading(false)
}

const deleteLinksToCard = async (card: Card): Promise<void> => {
  if (!card.links.length) return

  const cardUuids = card.links.map((link) => link.uuid)

  /*
    TODO: в качестве будущей оптимизации, можно сделать проверку,
    нет ли этих uuid в определениях
   */
  const cards = await getCardsByUuid(cardUuids)

  const updatedCards = cards.map<Card>((item) => {
    return {
      ...item,
      links: (item.links || []).filter((link) => link.uuid !== card.uuid)
    }
  })

  await updateCards(updatedCards)
}

const backToList = () => {
  viewedCardUuid.value = null
  setViewedCard(null)
}

const cardsInBottomList = computed<CardShortInfo[]>(() => {
  const cards = viewedCard.value?.links || []

  if (cards.length === 0) return []

  const uuidsInText = getUuidsInString(viewedCard.value?.text ?? '')

  return cards.filter((card) => !uuidsInText.includes(card.uuid))
})

const foldersText = computed<string>(() => {
  const uuidsStr = viewedCard.value?.folders

  if (!uuidsStr || typeof uuidsStr !== 'string') return ''

  try {
    const parsedFolderUuids: string[] = JSON.parse(uuidsStr)

    const parsedFolders: FolderShortInfo[] = folders.value.filter((folder) =>
      parsedFolderUuids.includes(folder.uuid)
    )

    return Array.isArray(parsedFolders)
      ? parsedFolders
          .filter((folder) => folder?.name)
          .map((folder) => folder.name)
          .join(', ')
      : ''
  } catch {
    return ''
  }
})
</script>

<template>
  <CoolPanel>
    <CoolSpinner v-if="isLoading" />
    <ConfirmDialog></ConfirmDialog>
    <article v-if="viewedCard" class="article">
      <div class="toolbar">
        <Button
          v-tooltip="'Редактировать карточку'"
          icon="pi pi-file-edit"
          severity="primary"
          size="small"
          @click="$emit('edited')"
        />
        <Button
          v-tooltip="'Удалить карточку'"
          icon="pi pi-file-excel"
          severity="secondary"
          size="small"
          @click="deleteCard()"
        />
        <Button
          v-if="isMobileView"
          icon="pi pi-arrow-left"
          severity="secondary"
          size="small"
          @click="backToList"
        />
      </div>
      <h2>{{ viewedCard?.title }}</h2>
      <TextViewer v-model="viewedCard.text" @clickOnLink="$emit('clickOnLink', $event)" />
      <hr />
      <p>Тип: {{ viewedCard.type === 'definition' ? 'определение' : 'статья' }}</p>
      <p>Папки: {{ foldersText }}</p>
      <div v-if="cardsInBottomList.length > 0" class="links-container">
        <h3>Еще связанные карточки</h3>
        <div
          v-for="link in cardsInBottomList"
          :key="link.uuid"
          class="link"
          @click="viewCard(link.uuid)"
        >
          {{ link.title }}
        </div>
      </div>
    </article>
    <p v-else>Выберите карточку, чтобы посмотреть содержание.</p>
  </CoolPanel>
</template>

<style scoped>
.article {
  height: calc(100vh - 130px);
  overflow-y: auto;
  padding: 30px 15px 10px;
  background-color: var(--bg-dark);
}

@media (width <= 768px) {
  .article {
    height: 100%;
  }
}

.toolbar {
  display: flex;
  flex-direction: row;
  gap: 5px;
  float: right;
  background-color: var(--bg-dark);
}

.links-container {
  background-color: var(--bg-dark);
}

.link {
  margin-bottom: 5px;
  text-decoration: underline;
  color: var(--accent-azure);
  background-color: var(--bg-dark);
  cursor: pointer;
}

.link:hover {
  background-color: var(--bg-darker);
}
</style>
