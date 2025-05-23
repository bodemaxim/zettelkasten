<script setup lang="ts">
import { type StyleValue, ref, onMounted, computed, watch } from 'vue'
import { vResizeObserver } from '@vueuse/components'
import { getAllDefinitions, getCardByUuid } from '@/api'
import EditCardModal from '@/components/edit-card-modal/edit-card-modal.vue'
import SearchPanel from '@/components/search-panel/search-panel.vue'
import ViewPanel from '@/components/view-panel/view-panel.vue'
import CoolErrorDialog from '@/ui/cool-error-dialog.vue'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'

const viewedCardUuid = ref<string | null>(null)
const modalVisible = ref<boolean>(false)

const {
  definitions,
  setDefinitions,
  isMobileView,
  setScreenWidth,
  isLoading,
  setViewedCard,
  errorMessage
} = useStore()

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

const onCardSave = async (uuid: string) => {
  setViewedCard(await getCardByUuid(uuid))
}

const onCardDelete = () => {
  setViewedCard(null)
  viewedCardUuid.value = null
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

const isError = ref<boolean>(false)

watch(
  () => errorMessage.value,
  () => {
    isError.value = !!errorMessage.value
  }
)
</script>

<template>
  <div v-resize-observer="onResizeObserver" class="main-view">
    <CoolSpinner v-if="isLoading" />
    <CoolErrorDialog v-model:visible="isError" />
    <EditCardModal v-model:visible="modalVisible" @saved="onCardSave" />
    <ViewPanel
      v-if="isMobileView && viewedCardUuid"
      v-model="viewedCardUuid"
      :class="['view-panel', { 'mobile-panel': isMobileView }]"
      @deleted="onCardDelete"
      @edited="openModal"
      @click-on-link="viewedCardUuid = $event"
    />
    <div v-show="!isMobileView || !viewedCardUuid" class="panels-container">
      <SearchPanel
        v-model="viewedCardUuid"
        :class="['search-panel', { 'mobile-panel': isMobileView }]"
        :style="searchPanelStyles"
        @create-card="openModal(isNewCard)"
      />
      <ViewPanel
        v-if="!isMobileView"
        v-model="viewedCardUuid"
        class="view-panel"
        @deleted="onCardDelete"
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
  margin: 3em 0 3em 2em;
}

.view-panel {
  position: relative;
  flex-grow: 1;
  height: calc(100vh - 80px);
  margin: 3em 2em;
}

.mobile-panel {
  height: 100vh;
  margin: 0;
}
</style>
