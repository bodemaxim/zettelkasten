import { ref, computed } from 'vue'
import type { Card, CardMinimal } from '@/api/types'

export const useStore = () => {
  const definitions = ref<Card[]>([])

  const setDefinitions = (newValue: Card[]) => {
    definitions.value = newValue
  }

  const cardTitles = ref<CardMinimal[]>([])

  const isLoading = ref<boolean>(false)

  const toggleLoading = () => {
    isLoading.value = !isLoading.value
    console.debug("toggleLoading", isLoading.value)
  }

  const screenWidth = ref<number>(window.innerWidth)

  const setScreenWidth = (newValue: number) => {
    screenWidth.value = newValue;
  }

  const isMobileView = computed(() => {
    return screenWidth.value < 768
  })

  return {
    definitions,
    setDefinitions,
    cardTitles,
    screenWidth,
    setScreenWidth,
    isMobileView,
    isLoading,
    toggleLoading
  }
}

