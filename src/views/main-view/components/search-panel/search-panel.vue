<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { CardMinimal } from '@/api/types'
import { Button, InputText } from 'primevue'
import { getCardTitles } from '@/api'
import CoolSpinner from '@/ui/cool-spinner.vue'

const isNeedToRefreshSearchList = defineModel<boolean>()

watch(
    () => isNeedToRefreshSearchList.value,
    async () => {
        if  (!isNeedToRefreshSearchList.value) return

        await initData()
        isNeedToRefreshSearchList.value = false
    }
)

const emits = defineEmits<{
  cardUuid: [value: string | null]
  createCard: []
}>()

const dataToSearch = ref<CardMinimal[]>([])
const searchQuery = ref<string>('')
const searchResults = ref<CardMinimal[]>([])
const isLoading = ref<boolean>(false)

const initData = async (): Promise<void> => {
  isLoading.value = true

  dataToSearch.value = await getCardTitles()
  searchResults.value = JSON.parse(JSON.stringify(dataToSearch.value))

  isLoading.value = false
}

onMounted(initData)

const onSearch = async (): Promise<void> => {
  if (searchQuery.value.length === 0) {
    emits('cardUuid', null)
    searchResults.value = JSON.parse(JSON.stringify(dataToSearch.value))

    return
  }

  const ids: string[] = parseSearchQuery(searchQuery.value)

  searchResults.value = dataToSearch.value.filter((item: CardMinimal) => ids.includes(item.uuid))
}

const parseSearchQuery = (str: string): string[] => {
  const query: string = str.trim()
  const result: string[] = []

  const containsSubstring = (mainString: string, subString: string): boolean => {
    return mainString.toLowerCase().includes(subString.toLowerCase())
  }

  for (const item of dataToSearch.value) {
    if (containsSubstring(item.title, query)) result.push(item.uuid)
  }

  return result
}

const viewCard = (card: CardMinimal) => {
  emits('cardUuid', card.uuid)
}

watch(
  () => searchQuery.value,
  () => onSearch()
)

initData()
</script>

<template>
  <div class="search-panel">
    <div class="toolbar">
      <InputText type="text" v-model="searchQuery" class="toolbar-input-form" />
      <Button
        v-tooltip.bottom="'Создать карточку'"
        icon="pi pi-file-plus"
        class="mr-2"
        severity="secondary"
        text
        @click="$emit('createCard')"
      />
    </div>
    <div>
      <CoolSpinner v-if="isLoading" class="spinner" />
      <ul class="scrollable-container" v-if="!isLoading && searchResults.length > 0">
        <li v-for="card in searchResults" :key="card.uuid">
          <p @click="viewCard(card)" class="card-item">
            {{ card.title }}
          </p>
        </li>
      </ul>
      <p v-else-if="!isLoading">Не найдено</p>
    </div>
  </div>
</template>

<style scoped>
.search-panel {
  overflow: hidden;
  max-width: 100%;
  background-color: var(--bg-dark);
  border: 2px solid var(--accent-green);
  padding: 40px 20px 10px 20px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-item {
  margin: 0;
  padding: 0;
}

.card-item:hover {
  background-color: black;
  cursor: pointer;
  transition: 0.5;
}

.scrollable-container {
  height: calc(100vh - 250px);
  background-color: var(--bg-dark);
}

.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  background-color: var(--bg-dark);
}

.toolbar-input-form {
  width: calc(100% - 50px);
}

.spinner {
  background: transparent;
}

/* XS */
@media (min-width: 320px) and (max-width: 575px) {
  .scrollable-container {
    height: calc(60vh - 150px);
  }
}
</style>
