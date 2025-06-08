<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Breadcrumb, Button, Listbox } from 'primevue'
import { getAllFolders } from '@/api'
import type { Folder, FolderShortInfo } from '@/types'

const isSelectOpen = defineModel<boolean>('open')
const folderUuid = defineModel<string | null>('folderUuid')

const defaultPath: FolderShortInfo[] = [
  {
    uuid: 'home',
    name: 'root'
  }
]

const folders = ref<Folder[]>()

onMounted(async () => {
  folders.value = await getAllFolders()
  initPath()
})

const currentPath = ref<FolderShortInfo[]>(defaultPath)

const selectItems = computed<FolderShortInfo[]>(() => {
  const lastPathItem = currentPath.value.at(-1)
  if (!lastPathItem || !folders.value) return []
  if (lastPathItem.uuid === 'home') return folders.value.filter((item) => item.path.length === 0)
  return folders.value.filter((item) => item.path.at(-1)?.uuid === lastPathItem.uuid)
})

const onMenuItemClick = (uuid: string) => {
  //укоротить путь
  if (currentPath.value.at(-1)?.uuid !== uuid) {
    const clickedIndex = currentPath.value.findIndex((item) => item.uuid === uuid)
    if (clickedIndex !== -1) {
      currentPath.value = currentPath.value.slice(0, clickedIndex + 1)
    }

    saveFolderUuid(currentPath.value.length > 1 ? (currentPath.value.at(-1)?.uuid ?? null) : null)
    isSelectOpen.value = false
    return
  }

  //закрыть при клике на home
  if (uuid === 'home' && isSelectOpen.value) {
    isSelectOpen.value = false
    saveFolderUuid(null)
    return
  }

  //не удлинять путь если нет дочерних папок
  if (!selectItems.value.length) {
    isSelectOpen.value = false
    return
  }

  //удлинить путь
  isSelectOpen.value = true
}

const addFolderToPath = (folder: Folder) => {
  currentPath.value.push({
    uuid: folder.uuid,
    name: folder.name
  })

  isSelectOpen.value = false
  saveFolderUuid(currentPath.value.length > 1 ? (currentPath.value.at(-1)?.uuid ?? null) : null)
}

const saveFolderUuid = (value: string | null) => {
  folderUuid.value = value
  localStorage.setItem('folderUuid', JSON.stringify(value ?? ''))
}

const initPath = () => {
  console.log(0, folderUuid.value)

  const currentFolder: Folder | undefined = folders.value?.find(
    (item) => item.uuid === folderUuid.value
  )

  if (!currentFolder) return

  const currentFolderShortInfo: FolderShortInfo = {
    uuid: currentFolder.uuid,
    name: currentFolder.name
  }

  currentPath.value = [...defaultPath, ...currentFolder.path, currentFolderShortInfo]
}

//TODO: приделать закрытие листбокса при клике вовне
</script>

<template>
  <div>
    <Breadcrumb
      :model="currentPath"
      :pt="{
        root: 'breadcrumb-root'
      }"
    >
      <template #item="{ item }">
        <div>
          <Button
            v-if="item.uuid === 'home'"
            icon="pi pi-home"
            severity="secondary"
            size="small"
            @click="onMenuItemClick(item.uuid)"
          />
          <span v-else @click="onMenuItemClick(item.uuid)" class="clickable-item">{{
            item.name
          }}</span>
        </div>
      </template>
    </Breadcrumb>
    <Listbox
      class="mew"
      v-if="isSelectOpen"
      :options="selectItems"
      optionLabel="name"
      :pt="{
        root: 'listbox-root'
      }"
      @update:model-value="addFolderToPath"
    />
  </div>
</template>

<style scoped>
.breadcrumb-root {
  margin: 5px 0;
  padding: 0;
  background-color: var(--bg-dark);
}

.listbox-root {
  overflow: hidden;
}

.clickable-item {
  text-decoration: underline;
  color: var(--accent-azure);
  cursor: pointer;
}
</style>
