<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchPanel from './components/search-panel/search-panel.vue'
import ViewPanel from './components/view-panel/view-panel.vue'
import { getCardByUuid, getAllDefinitions } from '@/api'
import type { Card } from '@/api/types'
import EditCardModal from './components/edit-card-modal/edit-card-modal.vue'

const viewedCard = ref<Card | null>(null)
const definitions = ref<Card[]>([])
const modalVisible = ref<boolean>(false)
const cardUuidForEdit = ref<string | null>(null)
const isNeedToRefreshSearchList = ref<boolean>(false)

const setDefinitions = async() => {
  definitions.value = await getAllDefinitions()
}

onMounted(setDefinitions)

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

  try {
    viewedCard.value = await getCardByUuid(cardUuid)
  } catch (e) {
    console.error(e)
  }
}

const openModal = () => {
  modalVisible.value = true
}

const refreshDefinitions = async () => {
  await setDefinitions()
  isNeedToRefreshSearchList.value = true
}
</script>

<template>
  <div class="main-view">
    <EditCardModal
      v-model:visible="modalVisible"
      v-model:cardOnEdit="viewedCard"
      @saved="refreshDefinitions"
    />
    <div class="panels-container">
      <SearchPanel
        v-model="isNeedToRefreshSearchList"
        @card-uuid="viewCard($event)"
        @create-card="openModal()"
        class="search-panel"
      />
      <ViewPanel v-model="viewedCard" @deleted="refreshDefinitions" @edited="openModal()"/>
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
  min-width: 300px;
  max-width: 300px;
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
