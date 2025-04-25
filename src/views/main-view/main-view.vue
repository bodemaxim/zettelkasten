<script setup lang="ts">
import { type StyleValue, ref, onMounted, computed, watch } from 'vue'
import SearchPanel from './components/search-panel/search-panel.vue'
import ViewPanel from './components/view-panel/view-panel.vue'
import { getAllDefinitions } from '@/api'
import EditCardModal from './components/edit-card-modal/edit-card-modal.vue'
import { vResizeObserver } from '@vueuse/components'
import { useStore } from '@/use-store'
import CoolSpinner from '@/ui/cool-spinner.vue'

const viewedCardUuid = ref<string | null>(null)
const modalVisible = ref<boolean>(false)
const isNeedToRefreshSearchList = ref<boolean>(false)

const { definitions, setDefinitions, isMobileView, setScreenWidth, isLoading, setViewedCard } =
  useStore()

const fetchDefinitions = async () => {
  if (!definitions.value.length) {
    setDefinitions(await getAllDefinitions())
  }
}

onMounted(fetchDefinitions)

const isNewCard = true

const openModal = (isNewCard = false) => {
  if (isNewCard) setViewedCard(null)

  modalVisible.value = true
}

const onCardUpdate = async () => {
  await fetchDefinitions()
  isNeedToRefreshSearchList.value = true
  setViewedCard(null)
}

function onResizeObserver(entries: readonly ResizeObserverEntry[]) {
  const [entry] = entries
  const { width } = entry.contentRect
  setScreenWidth(width)
}

const searchPanelStyles = computed<StyleValue>(() => ({
  width: isMobileView.value ? '100%' : '300px',
  minWidth: isMobileView.value ? undefined : '300px'
}))

const viewLink = (uuid: string) => {
  viewedCardUuid.value = uuid
}
</script>

<template>
  <div v-resize-observer="onResizeObserver" class="main-view">
    <CoolSpinner v-if="isLoading" />
    <EditCardModal v-model:visible="modalVisible" @saved="onCardUpdate" />

    <ViewPanel
      v-if="isMobileView && viewedCardUuid"
      v-model="viewedCardUuid"
      @deleted="onCardUpdate"
      @edited="openModal"
      @click-on-link="viewLink($event)"
    />

    <div v-else class="panels-container">
      <SearchPanel
        v-model="isNeedToRefreshSearchList"
        :style="searchPanelStyles"
        class="search-panel"
        @card-uuid="viewedCardUuid = $event"
        @create-card="openModal(isNewCard)"
      />
      <ViewPanel
        v-if="!isMobileView"
        v-model="viewedCardUuid"
        @deleted="onCardUpdate"
        @edited="openModal"
        @click-on-link="viewLink($event)"
      />
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
