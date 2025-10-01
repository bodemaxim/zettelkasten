<script setup lang="ts">
import { Button } from 'primevue'
import type { Folder } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import { useStore } from '@/use-store'

const { isMobileView } = useStore()

const selectedFolder = defineModel<Folder | null>()
</script>

<template>
  <CoolPanel>
    <div>
      <div v-if="isMobileView" class="flex-e">
        <Button
          type="button"
          icon="pi pi-times"
          size="small"
          severity="secondary"
          class="h-8 m-2"
          @click="selectedFolder = null"
        ></Button>
      </div>
      <h2 class="text-xl">{{ selectedFolder?.name }}</h2>
      <p>{{ selectedFolder?.description }}</p>
      <p>{{ selectedFolder?.createdAt }}</p>
      <p>{{ selectedFolder?.defaultDisplay }}</p>
      <p>{{ selectedFolder?.path }}</p>
    </div>
  </CoolPanel>
</template>
