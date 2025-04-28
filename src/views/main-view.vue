<script setup lang="ts">
import { type StyleValue, ref, onMounted, computed } from 'vue'
import { vResizeObserver } from '@vueuse/components'
import SearchPanel from '@/components/search-panel.vue'
import ViewPanel from '@/components/view-panel/view-panel.vue'
import EditCardModal from '@/components/edit-card-modal/edit-card-modal.vue'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { getAllDefinitions } from '@/api'
import { useStore } from '@/use-store'

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

const searchPanelStyles = computed<StyleValue>(() => ({
  width: isMobileView.value ? '100%' : '300px',
  minWidth: isMobileView.value ? undefined : '300px'
}))

const onResizeObserver = (entries: readonly ResizeObserverEntry[]) => {
  const [entry] = entries
  const { width } = entry.contentRect
  setScreenWidth(width)
}
</script>

<template>
  <div v-resize-observer="onResizeObserver" class="main-view">
    <CoolSpinner v-if="isLoading" />
    <EditCardModal v-model:visible="modalVisible" @saved="onCardUpdate" />
    <ViewPanel
      v-if="isMobileView && viewedCardUuid"
      v-model="viewedCardUuid"
      :class="['view-panel', { 'mobile-panel': isMobileView }]"
      @deleted="onCardUpdate"
      @edited="openModal"
      @click-on-link="viewedCardUuid = $event"
    />
    <div v-else class="panels-container">
      <SearchPanel
        v-model="isNeedToRefreshSearchList"
        :class="['search-panel', { 'mobile-panel': isMobileView }]"
        :style="searchPanelStyles"
        @viewed-card-uuid="viewedCardUuid = $event"
        @create-card="openModal(isNewCard)"
      />
      <ViewPanel
        v-if="!isMobileView"
        v-model="viewedCardUuid"
        :class="['view-panel', { 'mobile-panel': isMobileView }]"
        @deleted="onCardUpdate"
        @edited="openModal"
        @click-on-link="viewedCardUuid = $event"
      />
    </div>
  </div>
</template>

<style scoped>
.main-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow-y: hidden;
}

.panels-container {
  display: flex;
  flex-grow: 1;
}

.search-panel {
  margin: 3em 0 3em 2em;
  height: calc(100vh - 80px);
}

.view-panel {
  margin: 3em 2em;
  height: calc(100vh - 80px);
  position: relative;
  flex-grow: 1;
}

.mobile-panel {
  margin: 0;
  height: 100vh;
}
</style>
