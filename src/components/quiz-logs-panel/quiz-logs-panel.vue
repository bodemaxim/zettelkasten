<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { format } from 'date-fns'
import { DataTable, Column } from 'primevue'
import type { DataTablePageEvent } from 'primevue/datatable'
import { getQuizEvents, seeUser } from '@/api'
import QuizLogsAutocomplete from '@/components/quiz-logs-panel/quiz-logs-autocomplete.vue'
import { QUIZ_GRADES } from '@/components/view-panel/grade-picker/grade-picker.consts'
import type { CardShortInfo, QuizEvent, QuizGrade } from '@/types'

const ROWS_PER_PAGE = 25

const quizEvents = ref<QuizEvent[]>([])
const totalRecords = ref(0)
const first = ref(0)
const rowsPerPage = ref(ROWS_PER_PAGE)
const loading = ref(false)
const selectedCardId = ref<string | null>(null)

const gradeLabels = Object.fromEntries(QUIZ_GRADES.map((g) => [g.value, g.label])) as Record<
  QuizGrade,
  string
>

const formatDateTime = (value: string | null): string => {
  if (!value) return '—'
  return format(new Date(value), 'dd.MM.yy HH:mm')
}

const formatDuration = (seconds: number | null): string => {
  if (seconds == null) return '—'
  if (seconds < 60) return `${seconds} сек`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs ? `${mins} мин ${secs} сек` : `${mins} мин`
}

const formatGrade = (grade: QuizGrade | null): string => {
  if (!grade) return '—'
  return gradeLabels[grade] ?? grade
}

const loadQuizEvents = async (): Promise<void> => {
  loading.value = true

  const { data } = await seeUser()
  const userId = data.session?.user?.id

  const result = await getQuizEvents({
    userId,
    cardId: selectedCardId.value ?? undefined,
    pagination: {
      from: first.value,
      to: first.value + rowsPerPage.value - 1
    }
  })

  quizEvents.value = result.data
  totalRecords.value = result.count
  loading.value = false
}

const onPage = (event: DataTablePageEvent): void => {
  first.value = event.first
  rowsPerPage.value = event.rows
  loadQuizEvents()
}

const onQuizSelected = (card: CardShortInfo | null): void => {
  selectedCardId.value = card?.uuid ?? null
  first.value = 0
  loadQuizEvents()
}

onMounted(loadQuizEvents)
</script>

<template>
  <div class="quiz-logs-panel">
    <h1 class="quiz-logs-panel__title">Логи квизов</h1>

    <QuizLogsAutocomplete @selected="onQuizSelected" />

    <DataTable
      :value="quizEvents"
      lazy
      paginator
      :rows="rowsPerPage"
      :first="first"
      :total-records="totalRecords"
      :loading="loading"
      :rows-per-page-options="[10, 25, 50]"
      class="quiz-logs-panel__table"
      :pt="{ root: 'rounded-lg overflow-hidden', table: 'rounded-lg' }"
      @page="onPage"
    >
      <Column field="card_title" header="Карточка">
        <template #body="{ data }">
          {{ data.card_title ?? '—' }}
        </template>
      </Column>
      <Column field="created_at" header="Создано">
        <template #body="{ data }">
          {{ formatDateTime(data.created_at) }}
        </template>
      </Column>
      <Column field="duration" header="Длительность">
        <template #body="{ data }">
          {{ formatDuration(data.duration) }}
        </template>
      </Column>
      <Column field="grade" header="Оценка">
        <template #body="{ data }">
          {{ formatGrade(data.grade) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.quiz-logs-panel {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: var(--x2);
  min-height: 0;
}

.quiz-logs-panel__title {
  margin: 0;
  font-size: 1.5rem;
}

.quiz-logs-panel__table {
  flex-grow: 1;
}
</style>
