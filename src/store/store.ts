import { ref, computed } from 'vue'

export const screenWidth = ref<number>(window.innerWidth)

export const setScreenWidth = (newValue: number) => {
  screenWidth.value = newValue;
}

export const isMobileView = computed(() => {
  return screenWidth.value < 768
})