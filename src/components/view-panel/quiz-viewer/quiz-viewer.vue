<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import { Button, ConfirmDialog } from 'primevue'
import { useConfirm } from 'primevue/useconfirm'
import {
  createQuizEvent,
  deleteCardByUuid,
  deleteQuizByCardId,
  getCardsByUuid,
  getQuizByCardId,
  getQuizPriorityRatingByCardId,
  seeUser,
  updateCards,
  updateQuizPriorityAfterGrade
} from '@/api'
import type { Card, FolderShortInfo, QuizGrade } from '@/types'
import { useStore } from '@/use-store'
import TextEditor from '../../edit-card-modal/text-editor/text-editor.vue'
import GradePicker from '../grade-picker/grade-picker.vue'
import TextViewer from '../text-viewer/text-viewer.vue'

const emits = defineEmits<{
  clickOnLink: [uuid: string]
  edited: []
  deleted: []
}>()

const {
  viewedCard,
  folders,
  isLoading,
  setLoading,
  cardsShortInfo,
  setCardsShortInfo,
  setViewedCard
} = useStore()

const confirm = useConfirm()

const userAnswer = ref('')
const isAnswerSubmitted = ref(false)
const selectedGrade = ref<QuizGrade | null>(null)
const openedAt = ref<Date | null>(null)
const answerSubmittedAt = ref<Date | null>(null)
const isGradeSubmitted = ref(false)
const priorityRating = ref<number | null>(null)
const quizTask = ref('')

const loadQuizTask = async (cardId: string | undefined) => {
  if (!cardId) {
    quizTask.value = ''
    userAnswer.value = ''
    return
  }

  const quiz = await getQuizByCardId(cardId)
  quizTask.value = quiz?.task ?? ''
  // Заполняем редактор ответа заранее, если в квизе задан предзаполненный текст
  userAnswer.value = quiz?.prefilled_answer ?? ''
}

const loadPriorityRating = async (cardId: string | undefined) => {
  if (!cardId) {
    priorityRating.value = null
    return
  }

  priorityRating.value = await getQuizPriorityRatingByCardId(cardId)
}

onMounted(() => {
  openedAt.value = new Date()
  const cardId = viewedCard.value?.uuid
  loadPriorityRating(cardId)
  loadQuizTask(cardId)
})

watch(
  () => viewedCard.value?.uuid,
  (cardId) => {
    userAnswer.value = ''
    isAnswerSubmitted.value = false
    selectedGrade.value = null
    openedAt.value = new Date()
    answerSubmittedAt.value = null
    isGradeSubmitted.value = false
    loadPriorityRating(cardId)
    loadQuizTask(cardId)
  }
)

const foldersText = computed<string>(() => {
  const uuidsStr = viewedCard.value?.folders

  if (!uuidsStr || typeof uuidsStr !== 'string') return ''

  try {
    const parsedFolderUuids: string[] = JSON.parse(uuidsStr)

    const parsedFolders: FolderShortInfo[] = folders.value.filter((folder) =>
      parsedFolderUuids.includes(folder.uuid)
    )

    return Array.isArray(parsedFolders)
      ? parsedFolders
          .filter((folder) => folder?.name)
          .map((folder) => folder.name)
          .join(', ')
      : ''
  } catch {
    return ''
  }
})

const formattedDate = computed<string>(() => {
  if (!viewedCard.value?.createdAt) return ''
  return format(viewedCard.value.createdAt, 'dd.MM.yy HH:mm')
})

const onSubmit = () => {
  isAnswerSubmitted.value = true
  answerSubmittedAt.value = new Date()
}

const onEditQuiz = () => {
  emits('edited')
}

const deleteLinksToCard = async (card: Card): Promise<void> => {
  if (!card.links.length) return

  const cardUuids = card.links.map((link) => link.uuid)
  const cards = await getCardsByUuid(cardUuids)

  const updatedCards = cards.map<Card>((item) => ({
    ...item,
    links: (item.links || []).filter((link) => link.uuid !== card.uuid)
  }))

  await updateCards(updatedCards)
}

const onDeleteQuiz = () => {
  confirm.require({
    message: 'Вы уверены, что хотите удалить квиз?',
    header: 'Подтверждение',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Нет',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Да'
    },
    accept: deleteQuizOnAccept
  })
}

const deleteQuizOnAccept = async () => {
  const card = viewedCard.value
  if (!card) return

  setLoading(true)

  try {
    await deleteQuizByCardId(card.uuid)
    await deleteCardByUuid(card.uuid)
    await deleteLinksToCard(card)

    setCardsShortInfo(cardsShortInfo.value.filter((item) => item.uuid !== card.uuid))
    setViewedCard(null)
    emits('deleted')
  } finally {
    setLoading(false)
  }
}

const onSubmitGrade = async () => {
  if (!selectedGrade.value || isGradeSubmitted.value) return

  setLoading(true)

  try {
    const { data } = await seeUser()
    const userId = data.session?.user?.id ?? null
    const startTime = openedAt.value
    const endTime = answerSubmittedAt.value

    const cardId = viewedCard.value?.uuid ?? null

    if (cardId) {
      const newPriority = await updateQuizPriorityAfterGrade(
        cardId,
        selectedGrade.value,
        userId
      )
      if (newPriority !== null) priorityRating.value = newPriority
    }

    await createQuizEvent({
      start_time: startTime?.toISOString() ?? null,
      end_time: endTime?.toISOString() ?? null,
      duration:
        startTime && endTime
          ? Math.round((endTime.getTime() - startTime.getTime()) / 1000)
          : null,
      grade: selectedGrade.value,
      user_id: userId,
      card_id: cardId
    })

    isGradeSubmitted.value = true
  } finally {
    setLoading(false)
  }
}
</script>

<template>
  <ConfirmDialog />
  <article v-if="viewedCard" class="article">
    <div class="toolbar">
      <Button
        v-tooltip.bottom="'Редактировать квиз'"
        icon="pi pi-file-edit"
        severity="primary"
        size="small"
        class="h-8"
        @click="onEditQuiz"
      />
      <Button
        v-tooltip.bottom="'Удалить квиз'"
        icon="pi pi-file-excel"
        severity="secondary"
        size="small"
        class="h-8"
        @click="onDeleteQuiz"
      />
    </div>
    <h2 class="text-xl">{{ viewedCard.title }}</h2>
    <div class="info my-5">
      <p>Тип: квиз</p>
      <p v-if="foldersText">Папки: {{ foldersText }}</p>
      <p v-if="priorityRating !== null">Уровень изученности: {{ priorityRating }}</p>
      <p>{{ formattedDate }}</p>
    </div>
    <div v-if="quizTask" class="quiz-task my-5">
      <h3 class="text-lg">Задание</h3>
      <TextViewer v-model="quizTask" @click-on-link="emits('clickOnLink', $event)" />
    </div>
    <TextEditor v-model:text="userAnswer" />
    <div class="flex-e my-5">
      <Button
        type="button"
        label="Отправить решение"
        :severity="isAnswerSubmitted ? 'secondary' : undefined"
        :disabled="isLoading || isAnswerSubmitted"
        class="w-full lg:w-40"
        @click="onSubmit"
      />
    </div>
    <div v-if="isAnswerSubmitted">
      <h3 class="text-lg">Правильный ответ:</h3>
      <TextViewer
        v-model="viewedCard.text"
        @click-on-link="emits('clickOnLink', $event)"
      />
      <div class="text-lg">Сравните свой ответ с правильным и оцените</div>
      <GradePicker v-model="selectedGrade" class="my-5" />
      <div class="flex-e my-5">
        <Button
          type="button"
          label="Отправить оценку"
          :disabled="isLoading || !selectedGrade || isGradeSubmitted"
          class="w-full lg:w-40"
          @click="onSubmitGrade"
        />
      </div>
      <p v-if="isGradeSubmitted" class="text-lg w-full text-right text-emerald-500">Оценка отправлена</p>
      <div class="text-lg">Посмотрите статистику решения этого квиза (в разработке)</div>
    </div>
  </article>
</template>

<style scoped>
.article {
  height: calc(100vh - 130px);
  overflow-y: auto;
  padding: 30px 15px 10px;
  background-color: var(--bg-dark);
}

@media (width <= 768px) {
  .article {
    height: 100%;
  }
}

.toolbar {
  display: flex;
  flex-direction: row;
  gap: 5px;
  float: right;
  background-color: var(--bg-dark);
}

.info {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-dark);
}
</style>
