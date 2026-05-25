<script setup lang="ts">
import { computed, onMounted, ref, watch, type StyleValue } from 'vue'
import { Button, Paginator } from 'primevue'
import { getCardByUuid, getNextQuiz, getQuizzesShortInfo } from '@/api'
import ExpandMenuButton from '@/components/menu-panel/expand-menu-button/expand-menu-button.vue'
import { MENU_HEIGHT } from '@/components/menu-panel/menu-panel.consts'
import MenuPanel from '@/components/menu-panel/menu-panel.vue'
import BreadcrumbSelect from '@/components/search-panel/breadcrumb-select/breadcrumb-select.vue'
import QuizViewer from '@/components/view-panel/quiz-viewer/quiz-viewer.vue'
import type { Pagination, QuizShortInfo, QuizzesShortInfoRequest } from '@/types'
import CoolPanel from '@/ui/cool-panel.vue'
import { useStore } from '@/use-store'

const {
  isMobileView,
  isMenuExpanded,
  currentFolderUuid,
  setCurrentFolderUuid,
  viewedCard,
  setViewedCard,
  setLoading,
  isLoading
} = useStore()

const isBreadcrumbSelectOpen = ref(false)
const showContentPanel = ref(false)
const hasNoQuiz = ref(false)
const quizzesList = ref<QuizShortInfo[]>([])

const defaultPagination: Pagination = {
  from: 0,
  to: 99
}

const rowsPerPage = ref(100)
const pagination = ref<Pagination>(defaultPagination)
const first = ref(0)
const recordsTotal = ref(0)

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

const initQuizzesList = async () => {
  setLoading(true)

  const request: QuizzesShortInfoRequest = { pagination: pagination.value }

  if (currentFolderUuid.value) {
    request.folderUuid = currentFolderUuid.value
  }

  const result = await getQuizzesShortInfo(request)

  quizzesList.value = result.data
  recordsTotal.value = result.count

  setLoading(false)
}

const changePage = (firstRow: number) => {
  first.value = firstRow

  pagination.value = {
    from: firstRow,
    to: firstRow + rowsPerPage.value - 1
  }

  initQuizzesList()
}

const nextPaginationBtnDisabled = computed<boolean>(() => {
  if (!pagination.value) return true
  return pagination.value.to >= recordsTotal.value
})

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

const openQuiz = async (quiz: QuizShortInfo) => {
  setLoading(true)

  const card = await getCardByUuid(quiz.card_id)

  if (card) {
    setViewedCard({ ...card, type: 'quiz' })
    if (isMobileView.value) showContentPanel.value = true
  }

  setLoading(false)
}

const resetPagination = () => {
  first.value = 0
  pagination.value = { ...defaultPagination }
}

const backToSettings = () => {
  showContentPanel.value = false
}

onMounted(async () => {
  setFolderFromStorage()
  await initQuizzesList()
  await loadNextQuiz()
})

watch(currentFolderUuid, async () => {
  resetPagination()
  await initQuizzesList()
  await loadNextQuiz()
})

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
      <div class="quiz-panel">
        <QuizViewer />
        <div class="next-quiz-actions">
          <Button
            type="button"
            label="К следующему квизу"
            severity="secondary"
            :disabled="isLoading"
            class="w-full lg:w-auto"
            @click="loadNextQuiz"
          />
        </div>
      </div>
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
          class="breadcrumb"
          @uuid-changed="saveFolderUuid"
        />
        <div v-show="!isBreadcrumbSelectOpen" class="quizzes-list-container">
          <div v-if="!isLoading && quizzesList.length" class="quizzes-list">
            <ul>
              <li
                v-for="quiz in quizzesList"
                :key="quiz.uuid"
                class="quiz-title"
                :class="{ active: viewedCard?.uuid === quiz.card_id }"
                @click="openQuiz(quiz)"
              >
                {{ quiz.title }}
              </li>
            </ul>
            <Paginator
              :rows="rowsPerPage"
              :first="first"
              :total-records="recordsTotal"
              class="lib-paginator"
              @update:first="changePage"
            >
              <template
                #container="{ first, last, page, prevPageCallback, nextPageCallback, totalRecords }"
              >
                <div class="paginator">
                  <Button
                    size="small"
                    class="h-8"
                    icon="pi pi-chevron-left"
                    rounded
                    text
                    :disabled="page === 0"
                    @click="prevPageCallback"
                  />
                  <div class="paginator-text">{{ first }}—{{ last }} из {{ totalRecords }}</div>
                  <Button
                    size="small"
                    class="h-8"
                    icon="pi pi-chevron-right"
                    rounded
                    text
                    :disabled="nextPaginationBtnDisabled"
                    @click="nextPageCallback"
                  />
                </div>
              </template>
            </Paginator>
          </div>
          <p v-else-if="!isLoading" class="quizzes-empty">Квизов не найдено</p>
        </div>
      </CoolPanel>
      <CoolPanel
        v-if="!isMobileView"
        :style="contentPanelStyles"
        class="content-panel"
      >
        <div v-if="viewedCard" class="quiz-panel">
          <QuizViewer />
          <div class="next-quiz-actions">
            <Button
              type="button"
              severity="secondary"
              label="К следующему квизу"
              :disabled="isLoading"
              class="w-full lg:w-auto"
              @click="loadNextQuiz"
            />
          </div>
        </div>
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

.quiz-panel {
  display: flex;
  flex-direction: column;
  background-color: var(--bg-dark);
}

.quiz-panel :deep(.article) {
  height: auto;
  overflow-y: visible;
  padding-bottom: 0;
}

.next-quiz-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
  padding: 0 15px 20px;
}

.breadcrumb {
  margin: 0 20px 0 0;
}

.quizzes-list-container {
  flex-grow: 1;
  overflow-y: auto;
  margin: 0;
  background-color: var(--bg-dark);
}

.quizzes-list {
  background-color: var(--bg-dark);
}

.quiz-title {
  margin: 10px 4px 10px 0;
  padding: 0 var(--x1);
  cursor: pointer;
}

.quiz-title:hover,
.quiz-title.active {
  border-radius: var(--x1);
  background-color: var(--bg-darker);
  transition: 0.5s;
}

.quizzes-empty {
  margin: 10px 0;
  padding: 0 var(--x1);
  color: var(--text-muted, #888);
}

.paginator {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.25rem 0;
  border: 1px solid var(--primary-color);
  border-radius: 9999px;
  background-color: var(--bg-darker);
}

.paginator-text {
  font-size: 12px;
  color: var(--accent-yellow);
  background-color: var(--bg-darker);
}
</style>

<style>
.lib-paginator .p-paginator {
  margin-right: 20px;
  padding: 0;
}
</style>
