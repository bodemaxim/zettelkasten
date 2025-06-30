<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { debounce } from 'lodash'
import { MultiSelect } from 'primevue'
import { getCardsShortInfo } from '@/api'
import type { CardShortInfo } from '@/types'
import { useStore } from '@/use-store'

const selectedCards = defineModel<CardShortInfo[]>()

const options = ref<CardShortInfo[]>([])

const isDropdownOpen = ref(false)

const { setLoading } = useStore()

const initOptions = () => {
  if (selectedCards.value) {
    options.value = [...selectedCards.value]
  }
}

onMounted(initOptions)

const performSearch = async (str: string): Promise<void> => {
  if (str.length < 2) {
    initOptions()
    return
  }

  setLoading(true)
  const { data } = await getCardsShortInfo({
    searchQuery: str.toLowerCase().trim(),
    sorting: { field: 'createdAt', order: false }
  })

  const selectedIds = selectedCards.value?.map((card) => card.uuid) || []
  const filteredData = data.filter((card) => !selectedIds.includes(card.uuid))

  if (selectedCards.value?.length) {
    options.value = [...filteredData, ...selectedCards.value]
  } else {
    options.value = [...filteredData]
  }
  setLoading(false)
}

const onSearch = debounce((str: string) => {
  performSearch(str)
}, 300)
</script>

<template>
  <div class="wrapper">
    <MultiSelect
      v-model="selectedCards"
      :options="options"
      optionLabel="title"
      filter
      placeholder="Выберите связанные карточки"
      display="chip"
      fluid
      :selectionLimit="8"
      class="card-multiselect"
      @before-show="isDropdownOpen = true"
      @before-hide="isDropdownOpen = false"
      @filter="onSearch($event.value)"
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
    </MultiSelect>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
}

.card-multiselect {
  margin: 10px 0;
}

.option {
  display: flex;
  align-items: center;
}

.header {
  margin: 20px;
  font-size: 16px;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
</style>

<style>
/* TODO: изолировать */
.p-multiselect-overlay {
  width: calc(100% - 100px);

  /* transform: translateX(-40px); //TODO: применить изолированно */
}

.card-multiselect .p-multiselect-label {
  display: flex;
  flex-wrap: wrap;
  overflow-x: auto;
  font-size: 12px;
}

@media (width <= 768px) {
  .p-multiselect-overlay {
    width: calc(100% - 60px);

    /* transform: translateX(30px); //TODO: применить изолированно */
  }
}
</style>
