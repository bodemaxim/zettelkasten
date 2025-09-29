<script setup lang="ts">
import { ref, watch } from 'vue'
import { useStore } from '@/use-store'
import CoolErrorDialog from './ui/cool-error-dialog.vue'
import CoolSpinner from './ui/cool-spinner.vue'

const { isLoading, errorMessage } = useStore()

const isError = ref<boolean>(false)

watch(
  () => errorMessage.value,
  () => {
    isError.value = !!errorMessage.value
  }
)
</script>

<template>
  <CoolErrorDialog v-model:visible="isError" />
  <CoolSpinner v-if="isLoading" />
  <router-view class="router-view" />
</template>
