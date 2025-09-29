<script setup lang="ts">
import { ref, watch } from 'vue'
import { vResizeObserver } from '@vueuse/components'
import { useStore } from '@/use-store'
import CoolErrorDialog from './ui/cool-error-dialog.vue'
import CoolSpinner from './ui/cool-spinner.vue'

const { isLoading, errorMessage, setScreenWidth } = useStore()

const isError = ref<boolean>(false)

watch(
  () => errorMessage.value,
  () => {
    isError.value = !!errorMessage.value
  }
)

const onResizeObserver = (entries: readonly ResizeObserverEntry[]) => {
  const [entry] = entries
  const { width } = entry.contentRect
  setScreenWidth(width)
}
</script>

<template>
  <CoolErrorDialog v-model:visible="isError" />
  <CoolSpinner v-if="isLoading" />
  <router-view v-resize-observer="onResizeObserver" />
</template>
