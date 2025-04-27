<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { CardShortInfo } from '@/types'
import { Button, InputText } from 'primevue'
import { getCardsShortInfo } from '@/api'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'

const emits = defineEmits<{
  viewedCardUuid: [value: string | null]
  createCard: []
}>()

const { cardsShortInfo, setCardsShortInfo, isLoading, setLoading } = useStore()

const isNeedToRefreshSearchList = defineModel<boolean>()

watch(
  () => isNeedToRefreshSearchList.value,
  async () => {
    if (!isNeedToRefreshSearchList.value) return

    await initData()
    isNeedToRefreshSearchList.value = false
  }
)

const searchQuery = ref<string>('')
const searchResults = ref<CardShortInfo[]>([])

const initData = async (): Promise<void> => {
  //TODO: Сейчас есть лишние вызовы при возврате на страницу поиска, даже когда
  // никаких изменений в карточках не было
  console.log('initData')
  setLoading(true)

  const response = await getCardsShortInfo()
  setCardsShortInfo(response)
  searchResults.value = JSON.parse(JSON.stringify(cardsShortInfo.value))

  setLoading(false)
}

onMounted(initData)

const onSearch = async (): Promise<void> => {
  if (searchQuery.value.length === 0) {
    emits('viewedCardUuid', null)
    searchResults.value = JSON.parse(JSON.stringify(cardsShortInfo.value))

    return
  }

  const uuids: string[] = parseSearchQuery(searchQuery.value)

  searchResults.value = cardsShortInfo.value.filter((item: CardShortInfo) =>
    uuids.includes(item.uuid)
  )
}

watch(
  () => searchQuery.value,
  () => onSearch()
)

const parseSearchQuery = (str: string): string[] => {
  const query: string = str.trim()
  const result: string[] = []

  //TODO: уточнить, не переиспользуется ли функция где-то еще
  const containsSubstring = (mainString: string, subString: string): boolean => {
    return mainString.toLowerCase().includes(subString.toLowerCase())
  }

  cardsShortInfo.value.forEach((card) => {
    if (containsSubstring(card.title, query)) result.push(card.uuid)
  })

  return result
}
</script>

<template>
  <div class="search-panel">
    <CoolSpinner v-if="isLoading" />
    <div class="toolbar">
      <InputText type="text" v-model="searchQuery" class="search-box" />
      <Button
        v-tooltip="'Создать карточку'"
        icon="pi pi-file-plus"
        severity="primary"
        @click="$emit('createCard')"
      />
    </div>
    <ul class="search-results-list" v-if="!isLoading && searchResults.length">
      <li
        v-for="card in searchResults"
        :key="card.uuid"
        class="card-title"
        @click="$emit('viewedCardUuid', card.uuid)"
      >
        {{ card.title }}
      </li>
    </ul>
    <p v-else-if="!isLoading">Не найдено</p>
  </div>
</template>

<style scoped>
.search-panel {
  overflow: hidden;
  max-width: 100%;
  background-color: var(--bg-dark);
  border: 2px solid var(--accent-green);
  padding: 40px 20px 10px 20px;
  border-radius: 10px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  background-color: var(--bg-dark);
}

.search-box {
  width: calc(100% - 50px);
}

.search-results-list {
  height: calc(100% - 50px);
  background-color: var(--bg-dark);
  overflow-y: auto;
}

.card-title {
  margin: 10px 0;
}

.card-title:hover {
  background-color: var(--bg-darker);
  cursor: pointer;
  transition: 0.5;
}
</style>
