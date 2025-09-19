<script setup lang="ts">
import { computed } from 'vue'
import { Button } from 'primevue'
import { useStore } from '@/use-store'

const { isMenuExpanded, setIsMenuExpanded, isMobileView } = useStore()

const buttonIcon = computed(() => {
  if (isMobileView.value) {
    return isMenuExpanded.value ? 'pi pi-times' : 'pi pi-bars'
  }

  return isMenuExpanded.value ? 'pi pi-angle-double-up' : 'pi pi-angle-double-down'
})
</script>

<template>
  <div class="upper-menu">
    <Button
      type="button"
      :icon="buttonIcon"
      size="small"
      severity="secondary"
      class="menu-button"
      @click="setIsMenuExpanded(!isMenuExpanded)"
    ></Button>
  </div>
</template>

<style scoped>
.menu-button {
  z-index: 2;
}
</style>
