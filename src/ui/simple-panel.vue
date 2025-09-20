<script setup lang="ts">
import Panel from 'primevue/panel'
</script>

<template>
  <Panel
    v-bind="$attrs"
    :pt="{
      root: 'panel-root',
      content: 'panel-content',
      header: 'panel-header'
    }"
  >
    <template #header>
      <slot name="header" />
    </template>
    <slot />
  </Panel>
</template>

<style scoped>
:deep(.panel-content) {
  padding: 0 12px 12px;
}

:deep(.panel-header) {
  padding: 12px 12px 0;
  border: none;
  background-color: transparent;
}
</style>
