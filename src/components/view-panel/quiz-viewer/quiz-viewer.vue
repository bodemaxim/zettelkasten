<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { format } from 'date-fns'
import { Button } from 'primevue'
import { createQuizEvent, seeUser } from '@/api'
import type { FolderShortInfo, QuizGrade } from '@/types'
import { useStore } from '@/use-store'
import TextEditor from '../../edit-card-modal/text-editor/text-editor.vue'
import GradePicker from '../grade-picker/grade-picker.vue'
import TextViewer from '../text-viewer/text-viewer.vue'

const emits = defineEmits<{
  clickOnLink: [uuid: string]
}>()

const { viewedCard, folders, isLoading, setLoading } = useStore()

const userAnswer = ref('')
const isAnswerSubmitted = ref(false)
const selectedGrade = ref<QuizGrade | null>(null)
const openedAt = ref<Date | null>(null)
const answerSubmittedAt = ref<Date | null>(null)
const isGradeSubmitted = ref(false)

onMounted(() => {
  openedAt.value = new Date()
})

watch(
  () => viewedCard.value?.uuid,
  () => {
    userAnswer.value = ''
    isAnswerSubmitted.value = false
    selectedGrade.value = null
    openedAt.value = new Date()
    answerSubmittedAt.value = null
    isGradeSubmitted.value = false
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

const onSubmitGrade = async () => {
  if (!selectedGrade.value || isGradeSubmitted.value) return

  setLoading(true)

  try {
    const { data } = await seeUser()
    const userId = data.session?.user?.id ?? null
    const startTime = openedAt.value
    const endTime = answerSubmittedAt.value

    await createQuizEvent({
      start_time: startTime?.toISOString() ?? null,
      end_time: endTime?.toISOString() ?? null,
      duration:
        startTime && endTime
          ? Math.round((endTime.getTime() - startTime.getTime()) / 1000)
          : null,
      grade: selectedGrade.value,
      user_id: userId,
      card_id: viewedCard.value?.uuid ?? null
    })

    isGradeSubmitted.value = true
  } finally {
    setLoading(false)
  }
}
</script>

<template>
  <article v-if="viewedCard" class="article">
    <h2 class="text-xl">{{ viewedCard.title }}</h2>
    <div class="info my-5">
      <p>Тип: квиз</p>
      <p v-if="foldersText">Папки: {{ foldersText }}</p>
      <p>{{ formattedDate }}</p>
    </div>
    <TextEditor v-model="userAnswer" />
    <div class="flex-e my-5">
      <Button
        type="button"
        label="Отправить"
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

.info {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-dark);
}
</style>
