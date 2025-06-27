<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TreeSelect } from 'primevue'
import type { TreeNode } from 'primevue/treenode'
import { getAllFolders } from '@/api'
import type { Folder } from '@/types'

const nodes = ref<TreeNode[]>([])

type SelectedValues = {
  [key: string]: true
}

type ChangedValue = {
  uuid: string
  isSelected: boolean
}

const previouslySelectedUuids = ref<string[]>([])

const getChangedValue = (prevValues: string[], newValues: string[]): ChangedValue => {
  if (prevValues.length < newValues.length) {
    const uuid = newValues.find((uuid) => !prevValues.includes(uuid))

    return {
      uuid: uuid ?? '',
      isSelected: true
    }
  } else {
    const uuid = prevValues.find((uuid) => !newValues.includes(uuid))

    return {
      uuid: uuid ?? '',
      isSelected: false
    }
  }
}

/**
 * JSON с массивом юидов в формате строки.
 */
const selectedUuidsStringifiedJSON = defineModel<string>()

const selectedFolders = ref<SelectedValues>()

const folders = ref<Folder[]>([])

onMounted(async () => {
  folders.value = await getAllFolders()
  nodes.value = buildFolderTree(folders.value)
  selectedFolders.value = selectedUuidsStringifiedJSON.value
    ? getSelectedValues(selectedUuidsStringifiedJSON.value)
    : {}

  if (selectedFolders.value) {
    previouslySelectedUuids.value = Object.keys(selectedFolders.value)
  }
})

/**
 * Строит дерево папок из плоского массива.
 * @param folders - массив всех папок
 * @param parentUuid - uuid родительской папки (для рекурсии), по умолчанию null для корня
 * @returns массив папок с вложенными children
 */
const buildFolderTree = (folders: Folder[], parentUuid: string | null = null): TreeNode[] => {
  const children = folders.filter((folder) => {
    if (parentUuid === null) {
      return folder.path.length === 0
    } else {
      return folder.path.length > 0 && folder.path[folder.path.length - 1].uuid === parentUuid
    }
  })

  return children.map((folder) => {
    const folderChildren = buildFolderTree(folders, folder.uuid)
    return {
      //TODO: рефакторинг: удалить поле uuid, name
      key: folder.uuid,
      label: folder.name,
      ...folder,
      ...(folderChildren.length > 0 && { children: folderChildren })
    }
  })
}

/**
 * При селекте папки автоматом выбираются родители.
 * При деселекте родителя происходит деселект дочерних папок.
 */
const onValueChange = (e: SelectedValues) => {
  let arr = Object.keys(e)

  const changedValue: ChangedValue = getChangedValue(previouslySelectedUuids.value, arr)
  previouslySelectedUuids.value = [...arr]

  if (!changedValue.isSelected) {
    arr = getUuidsWithOddDeleted(arr, changedValue.uuid)
  } else {
    arr = addParentFolderUuids(arr)
  }

  selectedFolders.value = arr.reduce((acc, folderUuid) => {
    acc[folderUuid] = true
    return acc
  }, {} as SelectedValues)

  selectedUuidsStringifiedJSON.value = JSON.stringify(arr)
}

const addParentFolderUuids = (selectedUuids: string[]): string[] => {
  const allUuids = new Set(selectedUuids)

  selectedUuids.forEach((uuid) => {
    const folder = folders.value.find((f) => f.uuid === uuid)
    if (folder && folder.path.length > 0) {
      folder.path.forEach((pathItem) => {
        allUuids.add(pathItem.uuid)
      })
    }
  })
  return Array.from(allUuids)
}

/**
 * Для деселекта папки с дочерними папками.
 * @return массив выбранных юидов папок.
 */
const getUuidsWithOddDeleted = (selectedUuids: string[], parentUuid: string): string[] => {
  const result = [...selectedUuids]

  const childFolders = folders.value.filter((folder) =>
    folder.path.some((pathItem) => pathItem.uuid === parentUuid)
  )

  childFolders.forEach((childFolder) => {
    const index = result.indexOf(childFolder.uuid)
    if (index > -1) {
      result.splice(index, 1)
    }
  })

  return result
}

const getSelectedValues = (uuidsStringifiedJson: string): SelectedValues => {
  const uuids: string[] = JSON.parse(uuidsStringifiedJson)

  const result: SelectedValues = {}
  uuids.forEach((uuid) => {
    result[uuid] = true
  })
  return result
}
</script>

<template>
  <div>
    <TreeSelect
      v-model="selectedFolders"
      :options="nodes"
      selectionMode="multiple"
      display="chip"
      placeholder="Выберите папки"
      class="folders-treeselect"
      @update:modelValue="onValueChange"
    />
  </div>
</template>

<style scoped>
.folders-treeselect {
  min-width: 300px;
  margin: 10px 0;
}
</style>
