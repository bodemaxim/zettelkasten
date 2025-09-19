<script setup lang="ts">
import { computed, type StyleValue } from 'vue'
import { useStore } from '@/use-store'
import ExpandMenuButton from './expand-menu-button/expand-menu-button.vue'
import { MENU_HEIGHT } from './menu-panel.consts'

const { isMobileView, isMenuExpanded } = useStore()

const menuStyles = computed<StyleValue>(() => ({
  minHeight: `${MENU_HEIGHT}px`
}))
</script>

<template>
  <div class="expand-button-desktop-container" v-if="!isMobileView">
    <ExpandMenuButton class="expand-button-desktop" />
  </div>
  <div v-if="isMenuExpanded && !isMobileView" :style="menuStyles" class="expanded-desktop">
    меню
  </div>
  <div v-if="isMenuExpanded && isMobileView" class="expanded-mobile">мобильное меню</div>
</template>

<style scoped>
.expanded-desktop {
  width: 100vw;
  min-height: 100px;
  padding: 8px;
  background-color: gray;
}

.expand-button-desktop-container {
  position: absolute;
  display: flex;
  gap: 4px;
  align-items: flex-start;
  justify-content: flex-end;
  width: 100vw;
  margin: 4px;
  padding: 4px 8px;
  background-color: transparent;
}

.expand-button-desktop {
  background-color: transparent;
}

.expanded-mobile {
  position: absolute;
  right: 0;
  z-index: 1;
  width: 60%;
  height: 100vh;
  padding: 8px;
  background-color: gray;
}
</style>
