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

const onValueChange = (e: SelectedValues) => {
  const arr = Object.keys(e)
  selectedUuidsStringifiedJSON.value = JSON.stringify(arr)
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
