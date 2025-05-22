<script setup lang="ts">
import { computed } from 'vue'
import { Dialog, Button } from 'primevue'
import { useStore } from '@/use-store'

const visible = defineModel<boolean>('visible')

const { errorMessage, setErrorMessage } = useStore()

const onConfirm = () => {
  setErrorMessage(null)
  visible.value = false
}

const firstPartText = computed<string>(() => {
  const divider = errorMessage.value?.customText ? ': ' : ''
  return `${errorMessage.value?.customText}${divider}`
})
</script>

<template>
  <Dialog v-model:visible="visible" modal :closable="false" header="Ошибка" class="error-modal">
    <div class="modal-content">
      <p>
        <span>{{ firstPartText }}</span>
        <span v-if="errorMessage?.message">{{ errorMessage.message }}</span>
      </p>
      <div class="buttons-block">
        <Button type="button" label="ОК" @click="onConfirm"></Button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.buttons-block {
  display: flex;
  justify-content: flex-end;
  gap: 2px;
}
</style>

<style>
.error-modal.p-dialog {
  background-color: var(--bg-primary);
  width: 90%;
  max-width: 500px;
}
</style>
