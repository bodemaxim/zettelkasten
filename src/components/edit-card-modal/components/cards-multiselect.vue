<script setup lang="ts">
import { ref, computed } from 'vue'
import { MultiSelect, Button } from 'primevue'
import { useStore } from '@/use-store'
import type { CardShortInfo } from '@/types'

const selectedCards = defineModel<CardShortInfo[]>()
const { cardsShortInfo } = useStore()
const sortedCardTitles = computed<CardShortInfo[]>(() => [...cardsShortInfo.value].reverse())
const isDropdownOpen = ref(false)
</script>

<template>
  <MultiSelect
    v-model="selectedCards"
    :options="sortedCardTitles"
    optionLabel="title"
    filter
    placeholder="Выберите связанные карточки"
    display="chip"
    fluid
    :selectionLimit="8"
    class="card-multiselect"
    @before-show="isDropdownOpen = true"
    @before-hide="isDropdownOpen = false"
  >
    <template #dropdownicon>
      <i :class="isDropdownOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />
    </template>
    <template #filtericon>
      <i class="pi pi-search" />
    </template>
    <template #header>
      <p class="header">Доступные карточки</p>
    </template>
    <template #footer>
      <div class="footer">
        <Button
          label="Убрать все"
          severity="danger"
          text
          size="small"
          icon="pi pi-times"
          class="remove-all-button"
          @click="selectedCards = []"
        />
      </div>
    </template>
  </MultiSelect>
</template>

<style scoped>
.card-multiselect {
  min-width: 300px;
  margin: 10px 0;
}

.option {
  display: flex;
  align-items: center;
}

.header {
  font-size: 16px;
  margin: 20px;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
</style>

<style>
/*TODO: Изолировать стиль*/
.p-multiselect-overlay {
  width: calc(100% - 100px);
}
</style>
