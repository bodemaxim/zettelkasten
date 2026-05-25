<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import { Button } from 'primevue'
import type { FolderShortInfo } from '@/types'
import { useStore } from '@/use-store'
import TextEditor from '../../edit-card-modal/text-editor/text-editor.vue'
import TextViewer from '../text-viewer/text-viewer.vue'

const emits = defineEmits<{
  clickOnLink: [uuid: string]
}>()

const { viewedCard, folders, isLoading } = useStore()

const userAnswer = ref('')
const isAnswerSubmitted = ref(false)

watch(
  () => viewedCard.value?.uuid,
  () => {
    userAnswer.value = ''
    isAnswerSubmitted.value = false
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
        :disabled="isLoading"
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
      <div  class="text-lg">Сравните свой ответ с правильным и оцените</div>
      <div  class="text-lg">Посмотрите статистику решения этого квиза</div>
      <div  class="text-lg">Перейдите к следующему квизу</div>  
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
