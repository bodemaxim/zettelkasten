<script setup lang="ts">
import { computed, type StyleValue } from 'vue'
import ExpandMenuButton from '@/components/menu-panel/expand-menu-button/expand-menu-button.vue'
import { MENU_HEIGHT } from '@/components/menu-panel/menu-panel.consts'
import MenuPanel from '@/components/menu-panel/menu-panel.vue'
import QuizLogsTable from '@/components/quiz-logs-table/quiz-logs-table.vue'
import { useStore } from '@/use-store'

const { isMobileView, isMenuExpanded } = useStore()

const contentStyles = computed<StyleValue>(() => ({
  height: isMenuExpanded.value
    ? `calc(100vh - 100px - ${MENU_HEIGHT}px + 20px)`
    : 'calc(100vh - 80px)'
}))
</script>

<template>
  <div class="main-view">
    <MenuPanel />

    <div class="panels-container" :style="contentStyles">
      <div v-if="isMobileView" class="mobile-header">
        <ExpandMenuButton />
      </div>
      <QuizLogsTable />
    </div>
  </div>
</template>

<style scoped>
.main-view {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow-y: hidden;
}

.panels-container {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-height: 0;
  overflow-y: hidden;
  margin: 3em 2em;
}

.mobile-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1em;
}

@media (width <= 768px) {
  .panels-container {
    height: 100vh;
    margin: 0;
  }
}
</style>
