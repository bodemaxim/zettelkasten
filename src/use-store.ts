import { ref, computed } from 'vue'
import type { Card, CardMinimal } from '@/types'

const cardTitles = ref<CardMinimal[]>([])
const definitions = ref<Card[]>([])
const viewedCard = ref<Card | null>(null)

export const useStore = () => {
  const setDefinitions = (newValue: Card[]) => {
    definitions.value = newValue
  }

  const setCardTitles = (newValue: CardMinimal[]) => {
    cardTitles.value = newValue
  }

  const isLoading = ref<boolean>(false)

  const setLoading = (value: boolean) => {
    isLoading.value = value
  }

  const screenWidth = ref<number>(window.innerWidth)

  const setScreenWidth = (newValue: number) => {
    screenWidth.value = newValue
  }

  const isMobileView = computed(() => {
    return screenWidth.value < 768
  })

  const setViewedCard = (newValue: Card | null) => {
    viewedCard.value = newValue
  }

  return {
    definitions,
    setDefinitions,
    cardTitles,
    setCardTitles,
    screenWidth,
    setScreenWidth,
    isMobileView,
    isLoading,
    setLoading,
    viewedCard,
    setViewedCard
  }
}
