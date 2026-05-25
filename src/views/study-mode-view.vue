<script setup lang="ts">
import { computed, onMounted, ref, watch, type StyleValue } from 'vue'
import { Button } from 'primevue'
import { getNextQuiz } from '@/api'
import ExpandMenuButton from '@/components/menu-panel/expand-menu-button/expand-menu-button.vue'
import { MENU_HEIGHT } from '@/components/menu-panel/menu-panel.consts'
import MenuPanel from '@/components/menu-panel/menu-panel.vue'
import BreadcrumbSelect from '@/components/search-panel/breadcrumb-select/breadcrumb-select.vue'
import QuizViewer from '@/components/view-panel/quiz-viewer/quiz-viewer.vue'
import CoolPanel from '@/ui/cool-panel.vue'
import { useStore } from '@/use-store'

const {
  isMobileView,
  isMenuExpanded,
  currentFolderUuid,
  setCurrentFolderUuid,
  viewedCard,
  setViewedCard,
  setLoading
} = useStore()

const isBreadcrumbSelectOpen = ref(false)
const showContentPanel = ref(false)
const hasNoQuiz = ref(false)

const setFolderFromStorage = () => {
  const storedValue = localStorage.getItem('folderUuid')
  const newValue = storedValue !== null ? removeQuotes(JSON.parse(storedValue)) : null
  setCurrentFolderUuid(newValue)
}

const saveFolderUuid = (value: string | null) => {
  setCurrentFolderUuid(value)
  localStorage.setItem('folderUuid', JSON.stringify(value ?? ''))
}

const removeQuotes = (str: string) => {
  if (str.startsWith('"') && str.endsWith('"')) return str.slice(1, -1)
  return str
}

const loadNextQuiz = async () => {
  setLoading(true)
  hasNoQuiz.value = false

  const quiz = await getNextQuiz(currentFolderUuid.value)

  if (quiz?.card) {
    setViewedCard({ ...quiz.card, type: 'quiz' })
    if (isMobileView.value) showContentPanel.value = true
  } else {
    setViewedCard(null)
    hasNoQuiz.value = true
    showContentPanel.value = false
  }

  setLoading(false)
}

const backToSettings = () => {
  showContentPanel.value = false
}

onMounted(async () => {
  setFolderFromStorage()
  await loadNextQuiz()
})

watch(currentFolderUuid, loadNextQuiz)

const settingsPanelStyles = computed<StyleValue>(() => {
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

const contentPanelStyles = computed<StyleValue>(() => ({
  height: isMenuExpanded.value
    ? `calc(100vh - 100px - ${MENU_HEIGHT}px + 20px)`
    : 'calc(100vh - 80px)'
}))
</script>

<template>
  <div class="main-view">
    <MenuPanel />

    <CoolPanel
      v-if="isMobileView && showContentPanel && viewedCard"
      :class="['content-panel', { 'mobile-panel': isMobileView }]"
    >
      <div class="content-toolbar">
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          size="small"
          class="h-8"
          @click="backToSettings"
        />
      </div>
      <QuizViewer />
    </CoolPanel>

    <div v-show="!isMobileView || !showContentPanel" class="panels-container">
      <CoolPanel
        :class="['settings-panel', { 'mobile-panel': isMobileView }]"
        :style="settingsPanelStyles"
      >
        <div class="panel-header">
          <h2 class="panel-title">Настройки</h2>
          <ExpandMenuButton v-if="isMobileView" />
        </div>
        <BreadcrumbSelect
          v-model:open="isBreadcrumbSelectOpen"
          :current-folder-uuid="currentFolderUuid"
          @uuid-changed="saveFolderUuid"
        />
      </CoolPanel>
      <CoolPanel
        v-if="!isMobileView"
        :style="contentPanelStyles"
        class="content-panel"
      >
        <QuizViewer v-if="viewedCard" />
        <p v-else-if="hasNoQuiz" class="placeholder">Квизов не найдено</p>
      </CoolPanel>
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

.settings-panel {
  height: calc(100vh - 80px);
  overflow-y: auto;
  margin: 3em 0 3em 2em;
}

.content-panel {
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

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: 1em;
}

.panel-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.content-toolbar {
  display: flex;
  justify-content: flex-start;
  padding: 1em 1em 0;
}

.placeholder {
  margin: 0;
  color: var(--text-muted, #888);
}
</style>
