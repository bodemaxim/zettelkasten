<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Breadcrumb, Button, Listbox } from 'primevue'
import { getAllFolders } from '@/api'
import type { Folder, FolderShortInfo } from '@/types'

// при инициализации запрашиваю объект меню из localStorage
// если не получается, инициализирую как корень (для этого данные вообще не нужны)
// также есть вариант все равно загружать данные сразу, чтобы не было лоадинга
// при первом нажатии на элемент

const isSelectOpen = defineModel('open')

const defaultPath: FolderShortInfo[] = [
  {
    uuid: 'home',
    name: 'root'
  },
  {
    uuid: 'mew',
    name: 'folder1'
  },
  {
    uuid: 'mew2',
    name: 'folder2'
  }
]

const folders = ref<Folder[]>()
const currentPath = ref<FolderShortInfo[]>(defaultPath)

onMounted(async () => {
  folders.value = await getAllFolders()
})

const onMenuItemClick = (uuid: string) => {
  console.log('onMenuItemClick', uuid)

  isSelectOpen.value = !isSelectOpen.value

  console.log('currentPath.value.at(-1)', currentPath.value.at(-1))

  if (currentPath.value.at(-1)?.uuid !== uuid) {
    console.log('укорочение пути')
    const clickedIndex = currentPath.value.findIndex((item) => item.uuid === uuid)
    if (clickedIndex !== -1) {
      currentPath.value = currentPath.value.slice(0, clickedIndex + 1)
    }
  }
}

//приделать закрытие листбокса при клике вовне
</script>

<template>
  <div class="breadcrumb-container">
    <Breadcrumb :model="currentPath">
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
    <Listbox v-if="isSelectOpen" class="listbox" />
  </div>
</template>

<style scoped>
.breadcrumb-container {
  margin: 5px 0;
  padding: 0;
  background-color: var(--bg-dark);
}

.clickable-item {
  text-decoration: underline;
  color: var(--accent-azure);
  cursor: pointer;
}
</style>

<style>
.p-listbox,
.p-listbox-list {
  background-color: var(--bg-dark);
}

:deep(.p-breadcrumb) {
  padding: 0;
  background-color: pink;
}
</style>
