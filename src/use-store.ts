import { ref, computed } from 'vue'
import type { Card, CardMinimal } from '@/api/types'

const cardTitles = ref<CardMinimal[]>([])
const definitions = ref<Card[]>([])

export const useStore = () => {
  const setDefinitions = (newValue: Card[]) => {
    definitions.value = newValue
  }

  const setCardTitles = (newValue: CardMinimal[]) => {
    cardTitles.value = newValue
  }

  const isLoading = ref<boolean>(false)

  const toggleLoading = () => {
    isLoading.value = !isLoading.value
  }

  const screenWidth = ref<number>(window.innerWidth)

  const setScreenWidth = (newValue: number) => {
    screenWidth.value = newValue
  }

  const isMobileView = computed(() => {
    return screenWidth.value < 768
  })

  return {
    definitions,
    setDefinitions,
    cardTitles,
    setCardTitles,
    screenWidth,
    setScreenWidth,
    isMobileView,
    isLoading,
    toggleLoading
  }
}
