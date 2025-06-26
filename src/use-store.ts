import { ref, computed } from 'vue'
import type { Card, CardShortInfo, Error, Folder } from '@/types'

const cardsShortInfo = ref<CardShortInfo[]>([])
const definitions = ref<Card[]>([])
const viewedCard = ref<Card | null>(null)
const errorMessage = ref<Error | null>(null)
const folders = ref<Folder[]>([])
const currentFolderUuid = ref<string | null>(null)

export const useStore = () => {
  const setDefinitions = (newValue: Card[]) => {
    definitions.value = newValue
  }

  const setCardsShortInfo = (newValue: CardShortInfo[]) => {
    cardsShortInfo.value = newValue
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

  const setErrorMessage = (newValue: Error | null) => {
    errorMessage.value = newValue
  }

  const setFolders = (newValue: Folder[]) => {
    folders.value = newValue
  }

  const setCurrentFolderUuid = (newValue: string | null) => {
    currentFolderUuid.value = newValue
  }

  return {
    definitions,
    setDefinitions,
    cardsShortInfo,
    setCardsShortInfo,
    screenWidth,
    setScreenWidth,
    isMobileView,
    isLoading,
    setLoading,
    viewedCard,
    setViewedCard,
    errorMessage,
    setErrorMessage,
    folders,
    setFolders,
    currentFolderUuid,
    setCurrentFolderUuid
  }
}
