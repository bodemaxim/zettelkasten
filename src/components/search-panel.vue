<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Button, InputText } from 'primevue'
import { getCardsShortInfo } from '@/api'
import type { CardShortInfo } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'

const viewedCardUuid = defineModel<string | null>()

defineEmits<{
  createCard: []
}>()

const { cardsShortInfo, setCardsShortInfo, isLoading, setLoading } = useStore()

const searchQuery = ref<string>('')
const searchResults = ref<CardShortInfo[]>([])

const initData = async (): Promise<void> => {
  setLoading(true)

  setCardsShortInfo(await getCardsShortInfo())
  searchResults.value = [...cardsShortInfo.value]

  setLoading(false)
}

onMounted(initData)

const onSearch = async (): Promise<void> => {
  if (!searchQuery.value.length) {
    viewedCardUuid.value = null
    searchResults.value = [...cardsShortInfo.value]

    return
  }

  const uuids: string[] = parseSearchQuery(searchQuery.value)

  searchResults.value = cardsShortInfo.value.filter((item: CardShortInfo) =>
    uuids.includes(item.uuid)
  )
}

watch(
  () => [searchQuery.value, cardsShortInfo.value],
  () => onSearch()
)

const parseSearchQuery = (str: string): string[] => {
  const query: string = str.trim()
  const result: string[] = []

  cardsShortInfo.value.forEach((card) => {
    if (card.title.toLowerCase().includes(query.toLowerCase())) {
      result.push(card.uuid)
    }
  })

  return result
}
</script>

<template>
  <CoolPanel>
    <CoolSpinner v-if="isLoading" />
    <div class="toolbar">
      <InputText type="text" v-model="searchQuery" class="search-box" />
      <Button
        v-tooltip="'Создать карточку'"
        icon="pi pi-file-plus"
        severity="primary"
        size="small"
        @click="$emit('createCard')"
      />
    </div>
    <ul class="search-results-list" v-if="!isLoading && searchResults.length">
      <li
        v-for="card in searchResults"
        :key="card.uuid"
        class="card-title"
        @click="viewedCardUuid = card.uuid"
      >
        {{ card.title }}
      </li>
    </ul>
    <p v-else-if="!isLoading">Не найдено</p>
  </CoolPanel>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
  background-color: var(--bg-dark);
}

.search-box {
  width: calc(100% - 50px);
}

.search-results-list {
  height: calc(100% - 50px);
  overflow-y: auto;
  background-color: var(--bg-dark);
}

.card-title {
  margin: 10px 0;
}

.card-title:hover {
  background-color: var(--bg-darker);
  transition: 0.5;
  cursor: pointer;
}
</style>
