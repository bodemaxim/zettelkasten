<script setup lang="ts">
import { type StyleValue, computed } from 'vue'
import { Button } from 'primevue'

const visible = defineModel<boolean>('visible')

const props = defineProps<{ isLoading: boolean; isMobileView: boolean; title: string }>()

const containerStyles = computed<StyleValue>(() => ({
  padding: props.isMobileView ? '8px' : '40px'
}))
</script>

<template>
  <div v-if="visible">
    <div class="modal" :style="containerStyles">
      <div class="header m-2 md:mx-10 mt-10">
        <div class="text-xl">{{ title }}</div>
        <Button
          type="button"
          icon="pi pi-times"
          size="small"
          severity="secondary"
          class="h-8"
          @click="visible = false"
        ></Button>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: absolute;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background-color: var(--bg-darker);
}

.header {
  display: flex;
  gap: var(--x2);
  align-items: center;
  justify-content: space-between;
}
</style>
