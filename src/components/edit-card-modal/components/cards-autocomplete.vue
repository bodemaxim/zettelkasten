<script setup lang="ts">
import { ref, computed } from 'vue'
import { type AutoCompleteCompleteEvent, AutoComplete } from 'primevue'
import { useStore } from '@/use-store'
import type { CardMinimal } from '@/types'

const emits = defineEmits<{
  updated: [value: CardMinimal]
}>()

const selectedCard = ref<CardMinimal | null>()
const suggestions = ref<CardMinimal[]>([])

const { cardTitles } = useStore()
const sortedCardTitles = computed(() => [...cardTitles.value].reverse())

const search = (event: AutoCompleteCompleteEvent) => {
  if (!event.query.trim()) {
    suggestions.value = sortedCardTitles.value
  } else {
    const filteredCards = cardTitles.value.filter((card) =>
      card.title.toLowerCase().includes(event.query.toLowerCase())
    )

    suggestions.value = [...filteredCards].reverse()
  }
}

const onValueChange = (e: CardMinimal) => {
  if (!e || typeof e !== 'object') return
  emits('updated', e)
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
