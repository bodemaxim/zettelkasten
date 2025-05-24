<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Breadcrumb, Button, Listbox } from 'primevue'
import { getAllFolders } from '@/api'
import type { Folder, FolderShortInfo } from '@/types'

// при инициализации запрашиваю объект меню из localStorage
// если не получается, инициализирую как корень (для этого данные вообще не нужны)
// также есть вариант все равно загружать данные сразу, чтобы не было лоадинга
// при первом нажатии на элемент

const defaultPath: FolderShortInfo[] = [
  {
    uuid: 'home',
    name: 'root'
  }
]

const folders = ref<Folder[]>()

onMounted(async () => {
  folders.value = await getAllFolders()
})

const currentPath = ref<FolderShortInfo[]>(defaultPath)
const isSelectOpen = defineModel('open')

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

    isSelectOpen.value = false
    return
  }

  //закрыть при клике на home
  if (uuid === 'home' && isSelectOpen.value) {
    isSelectOpen.value = false
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

const onSelectValueChange = (folderAddedToPath: Folder) => {
  currentPath.value.push({
    uuid: folderAddedToPath.uuid,
    name: folderAddedToPath.name
  })

  isSelectOpen.value = false
}

//приделать закрытие листбокса при клике вовне
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
      v-if="isSelectOpen"
      :options="selectItems"
      optionLabel="name"
      :pt="{
        root: 'listbox-root'
      }"
      @update:model-value="onSelectValueChange"
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
