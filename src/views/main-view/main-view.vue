<script setup lang="ts">
import { type StyleValue, ref, onMounted, computed } from 'vue'
import SearchPanel from './components/search-panel/search-panel.vue'
import ViewPanel from './components/view-panel/view-panel.vue'
import { getCardByUuid, getAllDefinitions } from '@/api'
import type { Card } from '@/api/types'
import EditCardModal from './components/edit-card-modal/edit-card-modal.vue'
import { vResizeObserver } from "@vueuse/components";
import { useStore } from '@/composables/use-store'
import CoolSpinner from '@/ui/cool-spinner.vue'

const viewedCard = ref<Card | null>(null)
const modalVisible = ref<boolean>(false)
const isNeedToRefreshSearchList = ref<boolean>(false)
const { definitions, setDefinitions, isMobileView, setScreenWidth, isLoading, toggleLoading } = useStore()

const fetchDefinitions = async() => {
  if (!definitions.value.length) setDefinitions(await getAllDefinitions())
}

onMounted(fetchDefinitions)

const fetchDefinition = (uuid: string): Card | null => {
  const result = definitions.value.find((item) => item.uuid === uuid)

  return result ?? null
}

const viewCard = async (cardUuid: string | null) => {
  if (!cardUuid) {
    viewedCard.value = null
    return
  }

  if (definitions.value.find((item) => item.uuid === cardUuid)) {
    viewedCard.value = fetchDefinition(cardUuid)
    return
  }

  toggleLoading()

  try {
    viewedCard.value = await getCardByUuid(cardUuid)
  } catch (e) {
    console.error(e)
  }
  toggleLoading()
}

const openModal = () => {
  modalVisible.value = true
}

const refreshDefinitions = async () => {
  await fetchDefinitions()
  isNeedToRefreshSearchList.value = true
}

function onResizeObserver(entries: readonly ResizeObserverEntry[]) {
  const [entry] = entries
  const { width } = entry.contentRect
  setScreenWidth(width)
}

const searchPanelStyles = computed<StyleValue>(() => ({
  width: isMobileView.value ? '100%' : "300px",
  minWidth: isMobileView.value ? undefined : "300px",
}))


</script>

<template>
  <div  v-resize-observer="onResizeObserver" class="main-view">
    <CoolSpinner v-if="isLoading"/>
    <EditCardModal
      v-model:visible="modalVisible"
      v-model:cardOnEdit="viewedCard"
      @saved="refreshDefinitions"
    />
    <ViewPanel v-if="isMobileView && viewedCard" v-model="viewedCard" @deleted="refreshDefinitions" @edited="openModal"/>

    <div v-else class="panels-container">
      <SearchPanel
        v-model="isNeedToRefreshSearchList"
        :style="searchPanelStyles"
        class="search-panel"
        @card-uuid="viewCard($event)"
        @create-card="openModal"
      />
      <ViewPanel v-if="!isMobileView" v-model="viewedCard" @deleted="refreshDefinitions" @edited="openModal"/>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  height: 100vh;
  width: 100vw;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
}

.panels-container {
  display: flex;
  flex-grow: 1;
}

.search-panel {
  margin: 3em 1em;
  height: calc(100vh - 80px);
}

.view-panel {
  margin: 3em 1em;
  height: calc(100vh - 80px);
  position: relative;
  flex-grow: 1;
  margin-right: 2em;
  margin-left: 2em;
}

hr {
  border: 2px solid gray;
}
</style>
