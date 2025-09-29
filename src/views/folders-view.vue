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
import { useStore } from '@/use-store'

const { isMobileView, isLoading } = useStore()
const { buildFolderTree } = useFolders()

const router = useRouter()

//TODO: написать обертку?
const containerStyles = computed<StyleValue>(() => ({
  padding: isMobileView ? '8px' : '40px'
}))

const close = () => {
  router.push('/')
}

const folders = ref<Folder[] | null>(null)

const folderNodes = ref<TreeNode[]>([])

const initData = async () => {
  folders.value = await getAllFolders()
  console.log('folders', folders.value)

  folderNodes.value = buildFolderTree(folders.value)
}

onMounted(initData)
</script>

<template>
  <div class="flex-b">
    <CoolPanel class="w-[300px] m-5">
      <Tree :value="folderNodes" class="w-full"></Tree>
    </CoolPanel>
    <CoolPanel class="w-[300px] m-5">
      <div>мяу</div>
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
