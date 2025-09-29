<script setup lang="ts">
import { type StyleValue, computed, ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button, Tree } from 'primevue'
import type { TreeNode } from 'primevue/treenode'
import { getAllFolders } from '@/api'
import type { Folder } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import { useFolders } from '@/use-folders'

const { buildFolderTree } = useFolders()

//TODO: написать обертку?

const folders = ref<Folder[] | null>(null)

const folderNodes = ref<TreeNode[]>([])

const initData = async () => {
  folders.value = await getAllFolders()
  console.log('folders', folders.value)

  folderNodes.value = buildFolderTree(folders.value)
}

const selectedFolder = ref<Folder | null>(null)

const onSelect = (e: any) => {
  console.log(e)
  selectedFolder.value = e
  console.log(1, selectedFolder.value)
}

onMounted(initData)
</script>

<template>
  <div class="flex-b">
    <CoolPanel class="w-[300px] m-5">
      <Tree
        :value="folderNodes"
        class="w-full"
        selectionMode="single"
        @node-select="onSelect"
      ></Tree>
    </CoolPanel>
    <CoolPanel class="w-[300px] m-5">
      <div v-if="selectedFolder">
        <h2 class="text-xl">{{ selectedFolder?.name }}</h2>
        <p>{{ selectedFolder?.description }}</p>
        <p>{{ selectedFolder?.createdAt }}</p>
        <p>{{ selectedFolder?.defaultDisplay }}</p>
        <p>{{ selectedFolder?.path }}</p>
      </div>
      <p v-else>Кликните папку, чтобы посмотреть информацию о ней.</p>
    </CoolPanel>
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
