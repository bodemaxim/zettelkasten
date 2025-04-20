<script setup lang="ts">
import { onMounted, watch } from 'vue'
import type { Card } from '@/api/types'
import BottomShade from '@/ui/bottom-shade.vue'
import { Button } from 'primevue'
import { deleteCardByUuid, getCardByUuid } from '@/api'
import { useStore } from '@/use-store'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { ConfirmDialog } from 'primevue'
import { useConfirm } from 'primevue/useconfirm'

const { isMobileView, isLoading, toggleLoading, definitions, viewedCard, setViewedCard } =
  useStore()

const viewedCardUuid = defineModel<string | null>()

onMounted(async () => viewCard(viewedCardUuid.value))

watch(
  () => viewedCardUuid.value,
  () => {
    viewCard(viewedCardUuid.value)
  }
)

const confirm = useConfirm()

const emits = defineEmits<{
  deleted: []
  edited: []
}>()

const fetchDefinition = (uuid: string): Card | null => {
  const result = definitions.value.find((item) => item.uuid === uuid)

  return result ?? null
}

const viewCard = async (cardUuid: string | null | undefined): Promise<void> => {
  if (!cardUuid) {
    setViewedCard(null)
    return
  }

  if (definitions.value.find((item) => item.uuid === cardUuid)) {
    setViewedCard(fetchDefinition(cardUuid))
    return
  }

  toggleLoading()

  try {
    setViewedCard(await getCardByUuid(cardUuid))
  } catch (e) {
    console.error(e)
  }
  toggleLoading()
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
    accept: async () => {
      toggleLoading()
      if (viewedCard.value) await deleteCardByUuid(viewedCard.value.uuid)
      viewedCard.value = null
      emits('deleted')
      toggleLoading()
    }
  })
}

const backToList = () => {
  viewedCardUuid.value = null
  setViewedCard(null)
}
</script>

<template>
  <div class="view-panel">
    <CoolSpinner v-if="isLoading" />
    <ConfirmDialog></ConfirmDialog>
    <div v-if="viewedCard" class="view-panel-question">
      <div class="buttons-container">
        <Button
          v-tooltip="'Редактировать карточку'"
          icon="pi pi-file-edit"
          class="mr-2"
          severity="secondary"
          text
          @click="$emit('edited')"
        />
        <Button
          v-tooltip="'Удалить карточку'"
          icon="pi pi-file-excel"
          class="mr-2"
          severity="secondary"
          text
          @click="deleteCard()"
        />
        <Button
          v-if="isMobileView"
          v-tooltip="'Вернуться к списку'"
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          @click="backToList"
        />
      </div>
      <h2>{{ viewedCard?.title }}</h2>
      <p v-html="viewedCard?.text"></p>
      <hr />
      <p>Тип: {{ viewedCard.type === 'definition' ? 'определение' : 'статья' }}</p>
      <div v-if="viewedCard.links.length > 0" class="links-container">
        <h3>Связанные термины:</h3>
        <div
          v-for="link in viewedCard.links"
          :key="link.uuid"
          class="link"
          @click="viewCard(link.uuid)"
        >
          {{ link.title }}
        </div>
      </div>
    </div>
    <div v-else>Выберите карточку, чтобы посмотреть содержание.</div>
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

.links-container {
  background-color: var(--bg-dark);
}

.link {
  cursor: pointer;
  background-color: var(--bg-dark);
  margin-bottom: 5px;
}

.link:hover {
  background-color: black;
}
</style>
