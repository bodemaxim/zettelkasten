<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { Button, DataTable, Column, useConfirm, ConfirmDialog } from 'primevue'
import { getCardPaths, updateCardPaths } from '@/api/cards'
import { deleteFolderByUuid, getAllFolders, updateFolderPaths } from '@/api/folders'
import type { CardPath, Folder, FolderShortInfo } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import { useStore } from '@/use-store'
import type { FolderTableRow } from './folder-view-panel.types'

const emits = defineEmits<{
  deleted: []
  edited: []
}>()

const { isMobileView, folders, setFolders } = useStore()

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

const pathString = computed(() => {
  const foldersInfo: FolderShortInfo[] =
    selectedFolder.value?.path.reduce((acc: FolderShortInfo[], item: string) => {
      const folder = folders.value?.find((folder) => folder.uuid === item)
      const folderShortInfo: FolderShortInfo = {
        uuid: item,
        name: folder?.name ?? ''
      }
      acc.push(folderShortInfo)
      return acc
    }, []) ?? []

  return selectedFolder.value?.path ? buildPath(foldersInfo) : ''
})

const formattedDate = computed<string>(() => {
  if (!selectedFolder.value?.createdAt) return ''
  return format(selectedFolder.value.createdAt, 'dd.MM.yy HH:mm')
})

const onEdit = () => {
  alert('Кнопка в разработке')
  return
  //emits('edited')
}

const confirm = useConfirm()

const onDelete = async () => {
  confirm.require({
    message: 'Вы уверены, что хотите удалить папку? Вложенные папки и карточки не удалятся',
    header: 'Подтверждение',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Нет',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Да'
    },
    accept: deleteFolderOnAccept
  })
}

const deleteFolderOnAccept = async () => {
  const deletedFolderUuid = selectedFolder.value?.uuid

  if (!deletedFolderUuid) return

  const updatedCardsRaw = await getCardPaths(deletedFolderUuid)

  const updatedCards: CardPath[] = updatedCardsRaw.map((item) => {
    const parsedFolders: string[] = JSON.parse(item.folders)
    console.log(1, parsedFolders)

    const parsedFoldersFiltered = parsedFolders.filter((uuid) => uuid !== deletedFolderUuid)

    return {
      uuid: item.uuid,
      folders: JSON.stringify(parsedFoldersFiltered)
    }
  })

  await updateCardPaths(updatedCards)

  const foldersCopy = await getAllFolders()
  console.log(3, foldersCopy)

  const editedFolders: Folder[] = foldersCopy.reduce((acc: Folder[], folder: Folder) => {
    const path = folder.path
    if (!path.includes(deletedFolderUuid)) return acc

    const updatedPath = folder.path.filter((uuid) => uuid !== deletedFolderUuid)

    const updatedFolder = { ...folder, path: updatedPath }

    acc.push(updatedFolder)

    return acc
  }, [])

  await updateFolderPaths(editedFolders)

  deleteFolderByUuid(deletedFolderUuid)

  emits('deleted')
}
</script>

<template>
  <CoolPanel>
    <ConfirmDialog></ConfirmDialog>
    <div class="w-full p-4 pr-8">
      <div v-if="selectedFolder">
        <div class="flex-b mb-4">
          <h2 class="text-xl">{{ selectedFolder?.name }}</h2>
          <div class="flex-e">
            <Button
              v-tooltip.bottom="'Редактировать папку'"
              icon="pi pi-file-edit"
              severity="primary"
              size="small"
              class="h-8"
              @click="onEdit"
            />
            <Button
              v-tooltip.bottom="'Удалить папку'"
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
