<script setup lang="ts">
import { type StyleValue, ref, computed, onMounted } from 'vue'
import { Button, Select, DatePicker, IftaLabel, Textarea } from 'primevue'
import { getAllDefinitions, getCardsShortInfo } from '@/api'
import type { Card, CardsShortInfoRequest, Folder, FolderShortInfo } from '@/types'
import CoolForm from '@/ui/cool-form.vue'
import FullScreenModal from '@/ui/full-screen-modal.vue'
import { useStore } from '@/use-store'
import { typeOptionsList } from '../edit-card-modal/edit-card-modal.consts'
import { type TypeOption } from '../edit-card-modal/edit-card-modal.types'
import FoldersTreeselect from '../edit-card-modal/folders-treeselect/folders-treeselect.vue'

const visible = defineModel<boolean>('visible')
const selectedFolder = defineModel<Folder | null>('selected-folder')

const {
  isLoading,
  viewedCard,
  isMobileView,
  setLoading,
  cardsShortInfo,
  setDefinitions,
  setCardsShortInfo,
  currentFolderUuid
} = useStore()

const emits = defineEmits<{
  saved: [uuid: string]
}>()

type DefaultFolderDisplay = 'diary' | 'list' | 'dictionary'

type FolderEditable = {
  name: string
  createdAt: Date | null
  description: string
  defaultDisplay: DefaultFolderDisplay
  path: FolderShortInfo[]
}

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

const getPathJSON = (path: FolderShortInfo[]) => {
  return JSON.stringify(path.map((item) => item.uuid))
}

onMounted(() => {
  updatedFolder.value = getEditableFolder(selectedFolder.value)

  selectedFoldersStringifiedJSON.value = selectedFolder.value?.path
    ? getPathJSON(selectedFolder.value?.path)
    : '[]'
})

const title = computed<string>(() => (viewedCard.value ? 'Редактировать папку' : 'Создать папку'))

const containerStyles = computed<StyleValue>(() => ({
  padding: isMobileView.value ? '8px' : '40px'
}))

const onCancel = () => {
  visible.value = false
  //updatedCard.value = { ...defaultCard }
}

const updateSearchPanel = async (areDefinitionsChanged: boolean) => {
  const request: CardsShortInfoRequest = {
    pagination: { from: 0, to: 99 } //TODO брать актуальную пагинацию
  }

  if (currentFolderUuid.value) request.folderUuid = currentFolderUuid.value

  if (!areDefinitionsChanged) {
    setCardsShortInfo((await getCardsShortInfo(request)).data)
    return
  }

  await Promise.all([
    setDefinitions(await getAllDefinitions()),
    setCardsShortInfo((await getCardsShortInfo(request)).data)
  ])
}

/**
 * Экономично обновляет связанные карточки, редактируемую карточку и панель поиска.
 * @param targetCard - создаваемая/редактируемая карточка
 * @param isNewCard - является ли карточка новой
 */
const updateAllNeeded = async (targetCard: Card, isNewCard: boolean) => {}

const onSave = async () => {
  if (!updatedFolder.value.name) {
    alert('Заполните название папки')
    return
  }
}

const getLinkedCardsForUpdate = async () => {}

const getAreDefinitionsUpdated = (cards: Card[]): boolean => {
  return true
}

const cardTypes = ref<TypeOption[]>(typeOptionsList)

const defaultDatetime = new Date()

const datetime = ref<Date | null>(defaultDatetime)

const isTypeSelectOnFocus = ref(false)
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
        <div :class="isMobileView ? '' : 'flex-b space-x-4 my-4'">
          <CoolForm
            id="title"
            v-model="updatedFolder.name"
            type="text"
            label="Имя папки"
            class="w-full md:w-1/2"
          />

          <div class="w-1/2 h-[60px] md:w-1/2 relative">
            <p
              class="text-xs absolute left-3 top-2 z-1"
              :class="isTypeSelectOnFocus ? 'text-primary-500' : 'text-muted-color'"
            >
              Выберите отображение по умолчанию
            </p>
            <Select
              v-model="updatedFolder.defaultDisplay"
              id="cardtype"
              :options="cardTypes"
              optionLabel="label"
              :pt="{ label: 'type-select-label' }"
              class="h-full w-full"
              @before-show="isTypeSelectOnFocus = true"
              @before-hide="isTypeSelectOnFocus = false"
            />
          </div>
        </div>
      </div>

      <div class="flex-b space-x-4">
        <FoldersTreeselect
          v-model="selectedFoldersStringifiedJSON"
          class="w-full my-2 md:my-0 md:w-1/2 h-[60px]"
        />
        <IftaLabel for="datetime" class="w-1/2">
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

      <Textarea class="w-full my-4 h-[100px]" />

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
