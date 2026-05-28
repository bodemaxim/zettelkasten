<script setup lang="ts">
import { type StyleValue, ref, computed, watch } from 'vue'
import { Button, Select, DatePicker, IftaLabel, Textarea } from 'primevue'
import { getCardPaths, updateCardPaths } from '@/api/cards'
import { createFolder, getAllFolders, updateFolderByUuid, updateFolderPaths } from '@/api/folders'
import type {
  CardPath,
  DefaultFolderDisplay,
  Folder,
  FolderEditable,
  FolderShortInfo
} from '@/types'
import CoolForm from '@/ui/cool-form.vue'
import FullScreenModal from '@/ui/full-screen-modal.vue'
import { useStore } from '@/use-store'
import { getAreArraysEqual } from '@/utils'
import BreadcrumbSelect from '../search-panel/breadcrumb-select/breadcrumb-select.vue'
import type { SelectedFolderModel, VisibleModel } from './edit-folder-modal.types'

const visible = defineModel<VisibleModel>('visible')
const selectedFolder = defineModel<SelectedFolderModel>('selected-folder')

watch(visible, () => {
  if (!visible.value) {
    selectedFolder.value = null
  }
})

const { isLoading, isMobileView } = useStore()

const displays = ref([
  { label: 'Дневник', value: 'diary' },
  { label: 'Список', value: 'list' },
  { label: 'Словарь', value: 'dictionary' }
])

const defaultFolder: FolderEditable = {
  name: '',
  createdAt: new Date(),
  description: '',
  defaultDisplay: 'diary',
  path: []
}

const updatedFolder = ref<FolderEditable>(structuredClone(defaultFolder))

const getEditableFolder = (folder: Folder | null | undefined): FolderEditable => {
  if (!folder) return structuredClone(defaultFolder)

  const allowedDisplays = ['diary', 'list', 'grid'] as const

  const defaultDisplay = allowedDisplays.includes(folder.defaultDisplay as any)
    ? (folder.defaultDisplay as DefaultFolderDisplay)
    : 'diary'

  const result: FolderEditable = {
    name: folder.name,
    createdAt: folder.createdAt ? new Date(folder.createdAt) : null,
    description: folder.description,
    defaultDisplay,
    path: folder.path
  }

  return result
}

const selectedFoldersStringifiedJSON = ref('[]')

const initData = () => {
  updatedFolder.value = getEditableFolder(selectedFolder.value)

  selectedFoldersStringifiedJSON.value = selectedFolder.value?.path
    ? JSON.stringify(selectedFolder.value?.path)
    : '[]'
}

watch(selectedFolder, initData, { immediate: true, deep: true })

const title = computed<string>(() =>
  selectedFolder.value ? 'Редактировать папку' : 'Создать папку'
)

const containerStyles = computed<StyleValue>(() => ({
  padding: isMobileView.value ? '8px' : '40px'
}))

const onCancel = () => {
  visible.value = false
  //updatedCard.value = { ...defaultCard }
}

const onSave = async () => {
  if (!updatedFolder.value.name) {
    alert('Заполните название папки')
    return
  }

  if (!selectedFolder.value) {
    await createFolder(updatedFolder.value)
    visible.value = false
    return
  }

  // РЕДАКТИРОВАНИЕ
  // сохранять собственные данные отредактированной папки
  try {
    await updateFolderByUuid(selectedFolder.value.uuid, updatedFolder.value)
  } catch {
    return
  }

  if (!getAreArraysEqual(selectedFolder.value.path, updatedFolder.value.path)) {
    // редактировать пути вложенных папок
    const oldPath = selectedFolder.value.path
    const newPath = updatedFolder.value.path
    const nestedFoldersPath = [...selectedFolder.value.path, selectedFolder.value.uuid]

    const foldersCopy = await getAllFolders()
    const nestedFolders: Folder[] = foldersCopy.reduce((acc: Folder[], folder: Folder) => {
      const path = folder.path
      if (!nestedFoldersPath.every((uuid, index) => path[index] === uuid)) return acc

      const pathEnding = path.slice(nestedFoldersPath.length)
      const updatedPath = [...newPath, ...pathEnding]
      const updatedFolder = { ...folder, path: updatedPath }
      acc.push(updatedFolder)
      return acc
    }, [])
    await updateFolderPaths(nestedFolders)

    // редактировать пути вложенных карточек
    const updatedCardsRaw = await getCardPaths(selectedFolder.value.uuid)
    const updatedCards: CardPath[] = updatedCardsRaw.map((item) => {
      const parsedFolders: string[] = JSON.parse(item.folders)

      const pathEnding = parsedFolders.slice(oldPath.length)
      const newParsedFolders = [...newPath, ...pathEnding]
      return {
        uuid: item.uuid,
        folders: JSON.stringify(newParsedFolders)
      }
    })
    await updateCardPaths(updatedCards)
  }

  visible.value = false
}

const isTypeSelectOnFocus = ref(false)

const isBreadcrumbSelectOpen = ref(false)

const parentFolderUuid = computed<string>(() => {
  return updatedFolder.value.path.at(-1) ?? ''
})

const updateFolderPath = (e: FolderShortInfo[]) => {
  updatedFolder.value.path = e.slice(1).map((item) => item.uuid)
}
</script>

<template>
  <FullScreenModal
    v-model:visible="visible"
    :title="title"
    :is-loading="isLoading"
    :is-mobile-view="isMobileView"
  >
    <div class="edit-card-modal" :style="containerStyles">
      <div>
        <div :class="{ 'flex-b space-x-4': !isMobileView }">
          <CoolForm
            id="title"
            v-model="updatedFolder.name"
            type="text"
            label="Имя папки"
            class="w-full md:w-1/2 my-4"
          />

          <div class="w-full md:w-1/2 h-[60px] relative my-4">
            <p
              class="text-xs absolute left-3 top-2 z-1"
              :class="isTypeSelectOnFocus ? 'text-primary-500' : 'text-muted-color'"
            >
              Выберите отображение по умолчанию
            </p>
            <Select
              v-model="updatedFolder.defaultDisplay"
              id="cardtype"
              :options="displays"
              option-label="label"
              option-value="value"
              :pt="{ label: 'type-select-label' }"
              class="h-full w-full"
              @before-show="isTypeSelectOnFocus = true"
              @before-hide="isTypeSelectOnFocus = false"
            />
          </div>
        </div>
      </div>

      <div :class="{ 'flex-b space-x-4': !isMobileView }">
        <div
          class="flex-s w-full md:w-1/2 h-[60px] border border-[var(--p-inputtext-border-color)] rounded-lg breadcrumb-container my-4"
        >
          <BreadcrumbSelect
            v-model:open="isBreadcrumbSelectOpen"
            :current-folder-uuid="parentFolderUuid"
            class="ml-4 bg-transparent"
            @path="updateFolderPath"
          />
        </div>
        <IftaLabel for="datetime" class="w-full md:w-1/2 my-4">
          <label for="datetime" class="label">Дата</label>
          <DatePicker
            id="datetime"
            v-model="updatedFolder.createdAt"
            show-time
            hour-format="24"
            fluid
            :pt="{ pcInputText: 'datepicker-label' }"
          />
        </IftaLabel>
      </div>

      <IftaLabel for="description" class="w-full my-4">
        <label for="description" class="label">Описание</label>
        <Textarea v-model="updatedFolder.description" class="w-full h-[100px]" id="description" />
      </IftaLabel>

      <div class="flex-e my-5">
        <Button
          type="button"
          label="Отмена"
          severity="secondary"
          @click="onCancel"
          class="w-1/2 lg:w-40"
        ></Button>
        <Button
          type="button"
          label="Сохранить"
          @click="onSave"
          :disabled="isLoading"
          class="w-1/2 lg:w-40"
        ></Button>
      </div>
    </div>
  </FullScreenModal>
</template>

<style scoped>
:deep(.type-select-label) {
  display: flex;
  align-items: flex-end;
}
</style>
