<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Button, InputText, Paginator } from 'primevue'
import { getCardsShortInfo, getCardsShortInfoByFolder } from '@/api'
import type { CardShortInfo, Pagination } from '@/types'
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

  if (!folderUuid.value) {
    const result = await getCardsShortInfo(pagination.value)
    setCardsShortInfo(result.data)
    recordsTotal.value = result.count
  } else {
    setCardsShortInfo(await getCardsShortInfoByFolder(folderUuid.value, pagination.value)) //TODO добавить count  в апи
  }
  searchResults.value = [...cardsShortInfo.value]

  setLoading(false)
}

onMounted(initData)

const onSearch = (): void => {
  //TODO: с ростом базы можно реализовать поиск при помощи запросов на бэк getCardsByStrAndFolder(str, folder)
  if (!searchQuery.value.length) {
    viewedCardUuid.value = null
    searchResults.value = [...cardsShortInfo.value]

    return
  }

  const uuids: string[] = parseSearchQuery(searchQuery.value)

  searchResults.value = cardsShortInfo.value.filter((item: CardShortInfo) =>
    uuids.includes(item.uuid)
  )
}

watch(
  () => [searchQuery.value, cardsShortInfo.value],
  () => onSearch()
)

const parseSearchQuery = (str: string): string[] => {
  const query: string = str.trim()
  const result: string[] = []

  cardsShortInfo.value.forEach((card) => {
    if (card.title.toLowerCase().includes(query.toLowerCase())) {
      result.push(card.uuid)
    }
  })

  return result
}

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
    <div class="search-results-list" v-show="!isBreadcrumbSelectOpen">
      <div v-if="!isLoading && searchResults.length">
        <ul>
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

.search-results-list {
  height: calc(100% - 70px);
  overflow-y: auto;
  margin: 0;
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
  background-color: transparent;
}

.paginator-text {
  font-size: 12px;
  color: var(--accent-yellow);
}
</style>
