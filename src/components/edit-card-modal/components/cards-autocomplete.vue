<script setup lang="ts">
import { ref, computed } from 'vue'
import { type AutoCompleteCompleteEvent, AutoComplete } from 'primevue'
import type { CardShortInfo } from '@/types'
import { useStore } from '@/use-store'

const emits = defineEmits<{
  updated: [value: CardShortInfo]
}>()

const selectedCard = ref<CardShortInfo | null>()
const suggestions = ref<CardShortInfo[]>([])

const { cardsShortInfo } = useStore()
const sortedCardTitles = computed<CardShortInfo[]>(() => [...cardsShortInfo.value].reverse())

const search = (event: AutoCompleteCompleteEvent) => {
  if (!event.query.trim()) {
    suggestions.value = sortedCardTitles.value
    return
  }

  const filteredCards = cardsShortInfo.value.filter((card) =>
    card.title.toLowerCase().includes(event.query.toLowerCase())
  )

  suggestions.value = [...filteredCards].reverse()
}

const onValueChange = (event: CardShortInfo) => {
  if (!event || typeof event !== 'object') return
  emits('updated', event)
}
</script>

<template>
  <AutoComplete
    :model-value="selectedCard"
    dropdown
    :suggestions="suggestions"
    optionLabel="title"
    data-key="uuid"
    @complete="search"
    @update:model-value="onValueChange"
  />
</template>

<style>
/* TODO: изолировать стили */
.p-autocomplete-overlay {
  width: calc(100% - 100px);
}
</style>
