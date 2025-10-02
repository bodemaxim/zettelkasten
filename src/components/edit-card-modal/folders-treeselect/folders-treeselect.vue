<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TreeSelect } from 'primevue'
import type { TreeNode } from 'primevue/treenode'
import { getAllFolders } from '@/api'
import type { Folder } from '@/types'
import { useFolders } from '@/use-folders'
import type { ChangedValue, SelectedValues } from './folders-treeselect.types'

const { buildFolderTree } = useFolders()

/**
 * JSON с массивом юидов в формате строки.
 */
const selectedUuidsStringifiedJSON = defineModel<string>()

const nodes = ref<TreeNode[]>([])
const folders = ref<Folder[]>([])
const selectedFolders = ref<SelectedValues>()
const previouslySelectedUuids = ref<string[]>([])

const getSelectedValues = (uuidsStringifiedJson: string): SelectedValues => {
  const uuids: string[] = JSON.parse(uuidsStringifiedJson)

  const result: SelectedValues = {}
  uuids.forEach((uuid) => {
    result[uuid] = true
  })
  return result
}

/**
 * Сортирует массив UUID папок от родителей к детям на основе глубины (длины path).
 */
const sortUuidsByHierarchy = (uuids: string[], folders: Folder[]): string[] => {
  const folderMap = new Map(folders.map((f) => [f.uuid, f]))

  const uuidsWithDepth = uuids.map((uuid) => {
    const folder = folderMap.get(uuid)
    return { uuid, depth: folder ? folder.path.length : 0 }
  })

  uuidsWithDepth.sort((a, b) => a.depth - b.depth)

  return uuidsWithDepth.map((item) => item.uuid)
}

const initData = async () => {
  folders.value = await getAllFolders()
  nodes.value = buildFolderTree(folders.value)

  const initialSelected = selectedUuidsStringifiedJSON.value
    ? getSelectedValues(selectedUuidsStringifiedJSON.value)
    : {}

  const sortedUuids = sortUuidsByHierarchy(Object.keys(initialSelected), folders.value)

  selectedFolders.value = sortedUuids.reduce<SelectedValues>((acc, folderUuid) => {
    acc[folderUuid] = true
    return acc
  }, {})

  previouslySelectedUuids.value = sortedUuids
}

onMounted(initData)

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
 * При селекте папки автоматом выбираются родители.
 * При деселекте родителя происходит деселект дочерних папок.
 */
const onValueChange = (e: SelectedValues) => {
  let arr = Object.keys(e)

  const changedValue: ChangedValue = getChangedValue(previouslySelectedUuids.value, arr)

  if (!changedValue.isSelected) {
    arr = getUuidsWithOddDeleted(arr, changedValue.uuid)
  } else {
    arr = addParentFolderUuids(arr, changedValue.uuid)
  }

  arr = sortUuidsByHierarchy(arr, folders.value)

  previouslySelectedUuids.value = [...arr]

  selectedFolders.value = arr.reduce<SelectedValues>((acc, folderUuid) => {
    acc[folderUuid] = true
    return acc
  }, {})

  selectedUuidsStringifiedJSON.value = JSON.stringify(arr)
}

const addParentFolderUuids = (selectedUuids: string[], newUuid: string): string[] => {
  const folder = folders.value.find((folder) => folder.uuid === newUuid)

  if (!folder) return selectedUuids

  const allUuids = new Set(selectedUuids)

  if (folder.path.length) {
    folder.path.forEach((pathItem) => {
      allUuids.add(pathItem.uuid)
    })
  }

  return Array.from(allUuids)
}

/**
 * Вызывается при деселекте папки для деселекта дочерних папок.
 * @return массив выбранных юидов папок.
 */
const getUuidsWithOddDeleted = (selectedUuids: string[], parentUuid: string): string[] => {
  const selectedFolders = folders.value.filter((folder) => selectedUuids.includes(folder.uuid))

  const filteredFolders = selectedFolders.filter(
    (folder) => !folder.path.some((pathItem) => pathItem.uuid === parentUuid)
  )

  return filteredFolders.map((folder) => folder.uuid)
}
</script>

<template>
  <TreeSelect
    v-model="selectedFolders"
    :options="nodes"
    selectionMode="multiple"
    display="chip"
    placeholder="Выберите папки"
    @update:modelValue="onValueChange"
  />
</template>
