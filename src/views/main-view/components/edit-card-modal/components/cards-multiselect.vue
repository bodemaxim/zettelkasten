<script setup lang="ts">
import { ref } from 'vue'
import { MultiSelect, Button } from 'primevue'

//в дропдаун выводить 15 последних по времени создания

const selectedCountries = ref()

const countries = ref([
  { name: 'Australia', code: 'AU' },
  { name: 'Brazil', code: 'BR' },
  { name: 'China', code: 'CN' },
  { name: 'Egypt', code: 'EG' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'India', code: 'IN' },
  { name: 'Japan', code: 'JP' },
  { name: 'Spain', code: 'ES' },
  { name: 'United States', code: 'US' }
])
</script>

<template>
  <div>
    <MultiSelect
      v-model="selectedCountries"
      :options="countries"
      optionLabel="name"
      filter
      placeholder="Select Countries"
      display="chip"
      class="card-multiselect"
    >
      <template #option="slotProps">
        <div class="option">
          <div>{{ slotProps.option.name }}</div>
        </div>
      </template>
      <template #dropdownicon>
        <i class="pi pi-map" />
      </template>
      <template #filtericon>
        <i class="pi pi-map-marker" />
      </template>
      <template #header>
        <div class="font-medium px-3 py-2">Available Countries</div>
      </template>
      <template #footer>
        <div class="p-3 flex justify-between">
          <Button label="Убрать все" severity="danger" text size="small" icon="pi pi-times" />
        </div>
      </template>
    </MultiSelect>
  </div>
</template>

<style scoped>
.card-multiselect {
  width: 60%;
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
