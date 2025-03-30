<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SearchPanel from './components/search-panel/search-panel.vue'
import ViewPanel from './components/view-panel/view-panel.vue'
import { getCardByUuid, getAllDefinitions } from '@/api'
import type { Card } from '@/api/types'

const viewedCard = ref<Card | null>(null)
const definitions = ref<Card[]>([])

const fetchDefinition = (uuid: string): Card | null => {
  const result = definitions.value.find((item) => item.uuid === uuid)

  return result ? result : null
}

onMounted(async () => (definitions.value = await getAllDefinitions()))

const viewCard = async (cardUuid: string) => {
  if (definitions.value.find((item) => item.uuid === cardUuid)) {
    viewedCard.value = fetchDefinition(cardUuid)
    return
  }

  try {
    viewedCard.value = await getCardByUuid(cardUuid)
    console.debug('viewCard', viewedCard.value)
  } catch (e) {
    console.error(e)
  }
}

const onCardViewChanged = async (cardUuid: string | null) => {
  console.debug('эмит принят')

  if (cardUuid) await viewCard(cardUuid)
}
</script>

<template>
  <div class="main-view">
    <div class="panels-container">
      <SearchPanel @card-uuid="onCardViewChanged($event)" class="search-panel" />
      <ViewPanel v-model="viewedCard" />
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
