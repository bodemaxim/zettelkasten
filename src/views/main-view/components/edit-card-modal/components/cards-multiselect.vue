<script setup lang="ts">
import { computed } from 'vue'
import { MultiSelect, Button } from 'primevue'
import { useStore } from '@/use-store'
import type { CardMinimal } from '@/api/types'

const selectedCards = defineModel<CardMinimal[]>()
const { cardTitles } = useStore()
const sortedCardTitles = computed(() => [...cardTitles.value].reverse())
</script>

<template>
  <div>
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
    >
      <template #option="slotProps">
        <div class="option">
          <div>{{ slotProps.option.title }}</div>
        </div>
      </template>
      <template #dropdownicon>
        <i class="pi pi-map" />
      </template>
      <template #filtericon>
        <i class="pi pi-map-marker" />
      </template>
      <template #header>
        <div class="font-medium px-3 py-2">Доступные карточки</div>
      </template>
      <template #footer>
        <div class="p-3 flex justify-between">
          <Button
            label="Убрать все"
            severity="danger"
            text
            size="small"
            icon="pi pi-times"
            @click="selectedCards = []"
          />
        </div>
      </template>
    </MultiSelect>
  </div>
  <br />
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

.footer {
  display: flex;
  justify-content: space-between;
}
</style>
