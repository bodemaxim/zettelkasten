<script setup lang="ts">
import { searchMenuItems } from './search-menu.consts'
import type { SearchMenuItem } from './search-menu.types'

const modelValue = defineModel<SearchMenuItem>()
</script>

<template>
  <div class="menu">
    <p
      class="menu-item"
      :class="{ active: modelValue?.id === searchMenuItems[0].id }"
      @click="modelValue = searchMenuItems[0]"
    >
      {{ searchMenuItems[0].value }}
    </p>
    <p
      class="menu-item"
      :class="{ active: modelValue?.id === searchMenuItems[1].id }"
      @click="modelValue = searchMenuItems[1]"
    >
      {{ searchMenuItems[1].value }}
    </p>
  </div>
</template>

<style scoped>
.menu {
  display: flex;
  gap: 30px;
  align-items: center;
  justify-content: center;
  height: 18px;
  margin: 15px 20px 10px 0;
  padding: 5px;
  background-color: var(--bg-dark);
}

.menu-item {
  box-sizing: border-box;
  margin: 0;
  padding-bottom: 5px;
  font-size: 14px;
  color: var(--accent-green);
  cursor: pointer;
}

.menu-item:hover,
.menu-item.active {
  padding-bottom: 3px;
  border-bottom: 2px solid var(--accent-green);
}
</style>
