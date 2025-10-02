<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { Button, DataTable, Column } from 'primevue'
import type { Folder, FolderShortInfo } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import { useStore } from '@/use-store'
import type { FolderTableRow } from './folder-view-panel.types'

const emits = defineEmits<{
  deleted: []
  edited: []
}>()

const { isMobileView } = useStore()

const selectedFolder = defineModel<Folder | null>()

const tableData = computed<FolderTableRow[]>(() => [
  { label: 'Описание', value: String(selectedFolder.value?.description) },
  { label: 'Дата создания', value: formattedDate.value },
  { label: 'Режим отображения по умолчанию', value: String(selectedFolder.value?.defaultDisplay) },
  { label: 'Путь', value: pathString.value }
])

const columns = [
  { field: 'label', header: 'Поле' },
  { field: 'value', header: 'Значение' }
]

function buildPath(items: FolderShortInfo[]): string {
  const names = items.map((item) => item.name)
  return names.length > 0 ? `root/${names.join('/')}` : 'root'
}

const pathString = computed(() =>
  selectedFolder.value?.path ? buildPath(selectedFolder.value?.path) : ''
)

const formattedDate = computed<string>(() => {
  if (!selectedFolder.value?.createdAt) return ''
  return format(selectedFolder.value.createdAt, 'dd.MM.yy HH:mm')
})

const onEdit = () => {
  emits('edited')
}

const onDelete = () => {
  emits('deleted')
}
</script>

<template>
  <CoolPanel>
    <div class="w-full p-4 pr-8">
      <div v-if="selectedFolder">
        <div class="flex-b mb-4">
          <h2 class="text-xl">{{ selectedFolder?.name }}</h2>
          <div class="flex-e">
            <Button
              v-tooltip="'Редактировать папку'"
              icon="pi pi-file-edit"
              severity="primary"
              size="small"
              class="h-8"
              @click="onEdit"
            />
            <Button
              v-tooltip="'Удалить папку'"
              icon="pi pi-file-excel"
              severity="secondary"
              size="small"
              class="h-8"
              @click="onDelete"
            />
            <Button
              v-if="isMobileView"
              icon="pi pi-arrow-left"
              severity="secondary"
              size="small"
              class="h-8"
              @click="selectedFolder = null"
            />
          </div>
        </div>
        <DataTable
          :value="tableData"
          class="max-w-full"
          :pt="{ root: 'rounded-lg overflow-hidden', table: 'rounded-lg' }"
        >
          <Column v-for="col of columns" :key="col.field" :field="col.field" :header="col.header" />
        </DataTable>
      </div>
      <div v-else>Выберите папку, чтобы увидеть информацию о ней.</div>
    </div>
  </CoolPanel>
</template>
