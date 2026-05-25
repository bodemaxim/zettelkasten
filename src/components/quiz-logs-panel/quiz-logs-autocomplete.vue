<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from 'lodash'
import { type AutoCompleteCompleteEvent, AutoComplete } from 'primevue'
import { getCardsShortInfo } from '@/api'
import type { CardShortInfo } from '@/types'
import { useStore } from '@/use-store'

const emits = defineEmits<{
  selected: [value: CardShortInfo | null]
}>()

const { setLoading } = useStore()

const selectedQuiz = ref<CardShortInfo | null>(null)
const options = ref<CardShortInfo[]>([])

const performSearch = async (str: string): Promise<void> => {
  if (str.length < 2) {
    options.value = []
    return
  }

  setLoading(true)
  const { data } = await getCardsShortInfo({
    searchQuery: str.toLowerCase().trim(),
    type: 'quiz',
    sorting: { field: 'title', order: true }
  })

  options.value = data
  setLoading(false)
}

const onSearch = debounce((event: AutoCompleteCompleteEvent) => {
  performSearch(event.query)
}, 300)

const onValueChange = (event: CardShortInfo | null) => {
  if (event !== null && typeof event !== 'object') return
  emits('selected', event)
}
</script>

<template>
  <AutoComplete
    v-model="selectedQuiz"
    dropdown
    :suggestions="options"
    option-label="title"
    placeholder="Поиск квиза по названию"
    data-key="uuid"
    show-clear
    class="quiz-logs-autocomplete"
    :pt="{
      listContainer: 'quiz-logs-autocomplete__list'
    }"
    @complete="onSearch"
    @update:model-value="onValueChange"
  />
</template>

<style>
.quiz-logs-autocomplete {
  width: 100%;
  max-width: 400px;
}

.quiz-logs-autocomplete__list {
  max-width: 400px;
  padding: 5px;
}
</style>
