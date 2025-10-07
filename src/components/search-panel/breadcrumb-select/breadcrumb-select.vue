<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import { Breadcrumb, Button, Listbox } from 'primevue'
import type { MenuItem } from 'primevue/menuitem'
import { getAllFolders } from '@/api'
import type { Folder, FolderShortInfo } from '@/types'
import { useStore } from '@/use-store'
import { defaultPath } from './breadcrumb-select.consts'

const props = defineProps<{ currentFolderUuid: string | null }>()

const isSelectOpen = defineModel<boolean>('open')

const emits = defineEmits<{
  uuidChanged: [value: string | null]
  path: [value: FolderShortInfo[]]
}>()

const folders = ref<Folder[]>()

const { setFolders } = useStore()

onMounted(async () => {
  folders.value = await getAllFolders()
  setFolders(folders.value)
  initPath()
})

const currentPath = ref<FolderShortInfo[]>(defaultPath)

watch(
  currentPath,
  () => {
    emits('path', currentPath.value)
  },
  { deep: true }
)

const selectItems = computed<FolderShortInfo[]>(() => {
  const lastPathItem = currentPath.value.at(-1)
  if (!lastPathItem || !folders.value) return []
  if (lastPathItem.uuid === 'home') return folders.value.filter((item) => item.path.length === 0)
  return folders.value.filter((item) => item.path.at(-1) === lastPathItem.uuid)
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
  emits('uuidChanged', value)
}

const initPath = () => {
  const currentFolder: Folder | undefined = folders.value?.find(
    (item) => item.uuid === props.currentFolderUuid
  )

  if (!currentFolder) return

  const currentFolderPath: FolderShortInfo[] = currentFolder.path.reduce(
    (acc: FolderShortInfo[], item: string) => {
      const folder = folders.value?.find((folder) => folder.uuid === item)
      const folderShortInfo: FolderShortInfo = {
        uuid: item,
        name: folder?.name ?? ''
      }
      acc.push(folderShortInfo)
      return acc
    },
    []
  )

  const currentFolderShortInfo: FolderShortInfo = {
    uuid: currentFolder.uuid,
    name: currentFolder.name
  }

  currentPath.value = [...defaultPath, ...currentFolderPath, currentFolderShortInfo]
}

const closeSelect = () => {
  isSelectOpen.value = false
}

const hasChildren = (item: MenuItem) => {
  if (!folders.value) return false
  return folders.value.some((folder) => folder.path.at(-1) === item.uuid)
}
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
            :pt="{ root: 'button-root' }"
            @click="onMenuItemClick(item.uuid)"
          />
          <span
            v-else
            :class="{
              'clickable-item': hasChildren(item),
              'no-children ': !hasChildren(item)
            }"
            @click="onMenuItemClick(item.uuid)"
          >
            {{ item.name }}
          </span>
        </div>
      </template>
    </Breadcrumb>

    <Listbox
      v-if="isSelectOpen"
      v-on-click-outside="closeSelect"
      :options="selectItems"
      optionLabel="name"
      :scroll-height="'calc(100vh - 240px)'"
      class="absolute z-10"
      @update:model-value="addFolderToPath"
    />
  </div>
</template>

<style scoped>
.breadcrumb-root {
  margin: 5px 0;
  padding: 0;
  background-color: transparent;
}

.clickable-item {
  text-decoration: underline;
  color: var(--accent-azure);
  cursor: pointer;
}

.no-children {
  text-decoration: none;
  color: var(--p-text-muted-color);
  cursor: default;
}

.button-root {
  height: var(--x8);
  overflow: hidden;
}
</style>
