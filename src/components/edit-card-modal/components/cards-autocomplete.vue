<script setup lang="ts">
import { ref } from 'vue'
import { debounce } from 'lodash'
import { type AutoCompleteCompleteEvent, AutoComplete } from 'primevue'
import { getCardsShortInfo } from '@/api'
import type { CardShortInfo } from '@/types'
import { useStore } from '@/use-store'

const { setLoading } = useStore()

const emits = defineEmits<{
  updated: [value: CardShortInfo]
}>()

const selectedCard = ref<CardShortInfo | null>()
const options = ref<CardShortInfo[]>([])

const performSearch = async (str: string): Promise<void> => {
  if (str.length < 2) return

  setLoading(true)
  const { data } = await getCardsShortInfo({
    searchQuery: str.toLowerCase().trim(),
    sorting: { field: 'createdAt', order: false }
  })

  options.value = data
  setLoading(false)
}

const onSearch = debounce((event: AutoCompleteCompleteEvent) => {
  performSearch(event.query)
}, 300)

const onValueChange = (event: CardShortInfo) => {
  if (!event || typeof event !== 'object') return
  emits('updated', event)
}
</script>

<template>
  <AutoComplete
    :model-value="selectedCard"
    dropdown
    :suggestions="options"
    optionLabel="title"
    data-key="uuid"
    :pt="{
      listContainer: 'list-container'
    }"
    @complete="onSearch"
    @update:model-value="onValueChange"
  />
</template>

<style>
.list-container {
  width: 100vw;
  padding: 5px;
}
</style>
