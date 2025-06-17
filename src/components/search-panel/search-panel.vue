<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash'
import { Button, InputText, Paginator } from 'primevue'
import { getCardsShortInfo } from '@/api'
import type { CardShortInfo, CardsShortInfoRequest, Pagination } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'
import BreadcrumbSelect from './components/breadcrumb-select.vue'

const viewedCardUuid = defineModel<string | null>()

defineEmits<{
  createCard: []
}>()

const { cardsShortInfo, setCardsShortInfo, isLoading, setLoading } = useStore()

const searchQuery = ref<string>('')
const searchResults = ref<CardShortInfo[]>([])

const initData = async (): Promise<void> => {
  setLoading(true)

  const request: CardsShortInfoRequest = {
    pagination: pagination.value
  }

  if (folderUuid.value) request.folderUuid = folderUuid.value

  const result = await getCardsShortInfo(request)

  setCardsShortInfo(result.data)
  recordsTotal.value = result.count

  searchResults.value = [...cardsShortInfo.value]

  setLoading(false)
}

const setFolderFromStorage = () => {
  const storedValue = localStorage.getItem('folderUuid')
  folderUuid.value = storedValue !== null ? removeQuotes(JSON.parse(storedValue)) : null
}

const removeQuotes = (str: string) => {
  if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1)
  return str
}

onMounted(async () => {
  setFolderFromStorage()
  await initData()
})

const performSearch = async (): Promise<void> => {
  if (searchQuery.value.length < 2) {
    viewedCardUuid.value = null
    searchResults.value = [...cardsShortInfo.value]

    return
  }

  setLoading(true)
  const { data } = await getCardsShortInfo({
    searchQuery: searchQuery.value.toLowerCase().trim(),
    folderUuid: folderUuid.value || undefined,
    sorting: { field: 'title', order: true }
  })

  searchResults.value = [...data]
  setLoading(false)
}

const onSearch = debounce(performSearch, 300)

watch(
  () => [searchQuery.value, cardsShortInfo.value],
  () => onSearch()
)

const isBreadcrumbSelectOpen = ref(false)
const folderUuid = ref<string | null>(null)

watch(
  () => folderUuid.value,
  () => initData()
)

const defaultPagination: Pagination = {
  from: 0,
  to: 99
}

const rowsPerPage = ref(100)

const pagination = ref<Pagination>(defaultPagination)

const first = ref(0)

const recordsTotal = ref(0)

const changePage = (firstRow: number) => {
  first.value = firstRow

  pagination.value = {
    from: firstRow,
    to: firstRow + rowsPerPage.value - 1
  }

  initData()
}
</script>

<template>
  <CoolPanel>
    <CoolSpinner v-if="isLoading" />
    <div class="toolbar">
      <InputText type="text" v-model="searchQuery" class="search-box" />
      <Button
        v-tooltip="'Создать карточку'"
        icon="pi pi-file-plus"
        severity="primary"
        size="small"
        @click="$emit('createCard')"
      />
    </div>
    <BreadcrumbSelect
      v-model:open="isBreadcrumbSelectOpen"
      v-model:folder-uuid="folderUuid"
      class="breadcrumb"
    />
    <div class="search-results-container" v-show="!isBreadcrumbSelectOpen">
      <div v-if="!isLoading && searchResults.length" class="search-results-list">
        <ul class="search-results-list">
          <li
            v-for="card in searchResults"
            :key="card.uuid"
            class="card-title"
            @click="viewedCardUuid = card.uuid"
          >
            {{ card.title }}
          </li>
        </ul>
        <Paginator
          :rows="rowsPerPage"
          :first="first"
          @update:first="changePage"
          :totalRecords="recordsTotal"
          class="lib-paginator"
        >
          >
          <template
            #container="{ first, last, page, prevPageCallback, nextPageCallback, totalRecords }"
          >
            <div class="paginator">
              <Button
                icon="pi pi-chevron-left"
                rounded
                text
                @click="prevPageCallback"
                :disabled="page === 0"
              />
              <div class="paginator-text">{{ first }}—{{ last }} из {{ totalRecords }}</div>
              <Button icon="pi pi-chevron-right" rounded text @click="nextPageCallback" />
            </div>
          </template>
        </Paginator>
      </div>
      <p v-else-if="!isLoading">Не найдено</p>
    </div>
  </CoolPanel>
</template>

<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
  background-color: var(--bg-dark);
}

.search-box {
  width: calc(100% - 50px);
}

.breadcrumb {
  margin: 0 20px 0 0;
}

.search-results-container {
  height: calc(100% - 70px);
  overflow-y: auto;
  margin: 0;
  background-color: var(--bg-dark);
}

.search-results-list {
  background-color: var(--bg-dark);
}

.card-title {
  margin: 10px 0;
}

.card-title:hover {
  background-color: var(--bg-darker);
  transition: 0.5s;
  cursor: pointer;
}

.paginator {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--primary-color);
  border-radius: 9999px;
  background-color: var(--bg-darker);
}

.paginator-text {
  font-size: 12px;
  color: var(--accent-yellow);
}
</style>

<style>
.lib-paginator .p-paginator {
  margin-right: 20px;
  background-color: var(--bg-dark);
}
</style>
