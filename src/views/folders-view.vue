<script setup lang="ts">
import { ref, onMounted, computed, type StyleValue } from 'vue'
import { Button, Tree } from 'primevue'
import type { TreeNode } from 'primevue/treenode'
import { getAllFolders } from '@/api'
import EditFolderModal from '@/components/edit-folder-modal/edit-folder-modal.vue'
import FolderViewPanel from '@/components/folder-view-panel/folder-view-panel.vue'
import ExpandMenuButton from '@/components/menu-panel/expand-menu-button/expand-menu-button.vue'
import { MENU_HEIGHT } from '@/components/menu-panel/menu-panel.consts'
import MenuPanel from '@/components/menu-panel/menu-panel.vue'
import type { Folder } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import { useFolders } from '@/use-folders'
import { useStore } from '@/use-store'

const { buildFolderTree } = useFolders()

const { isMobileView, isMenuExpanded } = useStore()

const modalVisible = ref<boolean>(false)

//TODO: написать обертку?

const folders = ref<Folder[] | null>(null)

const folderNodes = ref<TreeNode[]>([])

const initData = async () => {
  folders.value = await getAllFolders()

  folderNodes.value = buildFolderTree(folders.value)
}

const selectedFolder = ref<Folder | null>(null)

const onSelect = (e: any) => {
  selectedFolder.value = e
}

onMounted(initData)

//TODO: понять почему нужна загадочная поправка на 20px
const searchPanelStyles = computed<StyleValue>(() => {
  let heightValue: string

  if (isMobileView.value) {
    heightValue = '100vh'
  } else if (isMenuExpanded.value) {
    heightValue = `calc(100vh - 100px - ${MENU_HEIGHT}px + 20px)`
  } else {
    heightValue = 'calc(100vh - 80px)'
  }

  return {
    width: isMobileView.value ? '100%' : '300px',
    minWidth: isMobileView.value ? undefined : '300px',
    height: heightValue
  }
})

//TODO: понять почему нужна загадочная поправка на 20px
const viewPanelStyles = computed<StyleValue>(() => ({
  height: isMenuExpanded.value
    ? `calc(100vh - 100px - ${MENU_HEIGHT}px + 20px)`
    : 'calc(100vh - 80px)'
}))

const onFolderSave = () => {}

const onEdit = () => {
  modalVisible.value = true
}

const onDelete = () => {}

const createCard = () => {
  modalVisible.value = true
}
</script>

<template>
  <div class="main-view">
    <EditFolderModal
      v-model:visible="modalVisible"
      v-model:selected-folder="selectedFolder"
      @saved="onFolderSave"
    />
    <MenuPanel />

    <FolderViewPanel
      v-if="isMobileView && selectedFolder"
      v-model="selectedFolder"
      :class="['view-panel', { 'mobile-panel': isMobileView }]"
      @edited="onEdit"
      @deleted="onDelete"
    />

    <div v-show="!isMobileView || !selectedFolder" class="panels-container">
      <CoolPanel
        :class="['search-panel', { 'mobile-panel': isMobileView }]"
        :style="searchPanelStyles"
      >
        <div class="mb-5">
          <div class="flex-e mx-2">
            <Button
              v-tooltip="'Создать папку'"
              icon="pi pi-file-plus"
              severity="primary"
              size="small"
              class="h-8"
              @click="createCard"
            />
            <ExpandMenuButton v-if="isMobileView" />
          </div>
          <Tree :value="folderNodes" selectionMode="single" @node-select="onSelect"></Tree>
        </div>
      </CoolPanel>
      <FolderViewPanel
        v-if="!isMobileView"
        v-model="selectedFolder"
        :style="viewPanelStyles"
        class="view-panel"
        @edited="onEdit"
        @deleted="onDelete"
      />
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: absolute;
  z-index: 2;
  width: 100vw;
  height: 100vh;
  overflow-y: auto;
  background-color: var(--bg-darker);
}

.header {
  display: flex;
  gap: var(--x2);
  align-items: center;
  justify-content: space-between;
}

:deep(.p-tree) {
  background-color: transparent;
}
</style>

<style scoped>
.main-view {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow-y: hidden;
}

.panels-container {
  display: flex;
  flex-grow: 1;
}

.search-panel {
  height: calc(100vh - 80px);
  overflow-y: auto;
  margin: 3em 0 3em 2em;
}

.view-panel {
  position: relative;
  flex-grow: 1;
  height: calc(100vh - 80px);
  overflow-y: auto;
  margin: 3em 2em;
}

.mobile-panel {
  height: 100vh;
  margin: 0;
}
</style>
