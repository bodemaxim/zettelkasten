<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IQuestion } from './search-panel.types'
import ProgressSpinner from 'primevue/progressspinner'
import { getCardTitles } from '@/api'

const emits = defineEmits<{
  questionView: [value: IQuestion | null]
}>()

const dataToSearch = ref<IQuestion[]>([])
const searchQuery = ref<string>('')
const searchResults = ref<IQuestion[]>([])
const isLoading = ref<boolean>(false)

//нов
const fetchCards = async (): Promise<any> => {
  isLoading.value = true
  try {
    return await getCardTitles()
  } catch (e) {
    console.error(e)
  }
  isLoading.value = false
}

const initData = async (): Promise<void> => {
  dataToSearch.value = await fetchCards()
  searchResults.value = JSON.parse(JSON.stringify(dataToSearch.value))
}

const onSearch = async (): Promise<void> => {
  if (searchQuery.value.length === 0) {
    emits('questionView', null)
    searchResults.value = JSON.parse(JSON.stringify(dataToSearch.value))

    return
  }

  const ids: string[] = parseSearchQuery(searchQuery.value)

  searchResults.value = dataToSearch.value.filter((item: IQuestion) => ids.includes(item.uuid))
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

const viewAnswer = (question: IQuestion) => {
  emits('questionView', question)
}

watch(
  () => searchQuery.value,
  () => onSearch()
)

initData()

const loading = ref(false)
</script>

<template>
  <div class="search-panel">
    <form>
      <div class="input-group mb-3 p-2">
        <input
          type="text"
          class="form-control search-form"
          placeholder="Поиск..."
          v-model="searchQuery"
        />
      </div>
    </form>

    <div>
      <ProgressSpinner v-if="loading" />
      <ul class="scrollable-container" v-if="!loading && searchResults.length > 0">
        <li v-for="card in searchResults" :key="card.uuid">
          <p @click="viewAnswer(card)" class="border rounded mt-1 mb-1 p-3 question-item">
            {{ card.title }}
          </p>
        </li>
      </ul>
      <p v-else-if="!loading">Не найдено</p>
    </div>
  </div>
</template>

<style scoped>
.search-panel {
  overflow: hidden;
  max-width: 100%;
  background-color: var(--bg-dark);
  border: 2px solid red;
}

.question-item {
  margin: 0;
  padding: 0;
  &:hover {
    background-color: black;
    cursor: pointer;
    transition: 0.5;
  }
}

.scrollable-container {
  height: calc(100vh - 250px);
}

.filter-btn {
  width: 150px;
}

/* XS */
@media (min-width: 320px) and (max-width: 575px) {
  .scrollable-container {
    height: calc(60vh - 150px);
  }
}
</style>
