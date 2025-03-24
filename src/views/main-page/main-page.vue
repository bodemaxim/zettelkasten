<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SearchPanel from '@/components/search-panel/search-panel.vue'
import type { IQuestion } from '@/components/search-panel/search-panel.types'
import BottomShade from '@/ui/bottom-shade/bottom-shade.vue'
//новое V
import { getCardByUuid, getCardTitles, createCard } from '@/api'
import useAuthUser from '@/composables/use-auth-user'
import NoteCard from './components/note-card/note-card.vue'
import SignInPage from '@/components/sign-in-page/sign-in-page.vue'
import ProgressSpinner from 'primevue/progressspinner'

const { user } = useAuthUser()

const cards: any = ref([])
const viewedCard: any | null = ref(null)

const emptyCard = {
  title: '',
  text: '',
  links: []
}

const newCard: any = ref(emptyCard)

const fetchCards = async () => {
  try {
    cards.value = await getCardTitles()
    console.debug('cards fetched', cards.value)
  } catch (e) {
    console.error(e)
  }
}

const viewCard = async (cardUuid: string) => {
  try {
    viewedCard.value = await getCardByUuid(cardUuid)
  } catch (e) {
    console.error(e)
  }
}

const saveNewCard = async () => {
  try {
    await createCard(newCard.value)
    await fetchCards()
  } catch (e) {
    console.error(e)
  }
}

watch(
  () => user.value,
  () => {
    console.debug(user.value)
    fetchCards()
  },
  { immediate: true }
)

//новое ^

//const isLoading = computed(() => store.getters.isLoading)

const passwordCorrect = ref(false)

const question = ref<IQuestion | null>(null)

const onCardViewChanged = (questionView: IQuestion | null) => {
  question.value = questionView
}

const onPasswordCorrect = () => {
  passwordCorrect.value = true
}
</script>

<template>
  <main>
    <SignInPage class="signin" v-if="false" />
    <div v-else>
      <div class="d-flex flex-column">
        <div class="panels-container">
          <SearchPanel @question-view="onCardViewChanged($event)" class="search-panel" />
          <div class="view-panel">
            <div v-if="question" class="view-panel-question">
              <h2>{{ question.title }}</h2>
              <p>{{ question.text }}</p>
              <hr />
            </div>
            <p v-else class="mt-7 ml-5">Выберите вопрос, чтобы посмотреть ответ на него.</p>
            <BottomShade />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  height: 100vh;
  width: 100vw;
  overflow-y: hidden;
  background-color: var(--primary-dark);
}

.panels-container {
  display: flex;
  flex-grow: 1;
}

.view-panel {
  border: 1px solid var(--primary-accent);
  border-radius: 10px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin: 3em 1em;
  background-color: var(--bg-dark);
  overflow: hidden;
  height: calc(100vh - 80px);
}

.search-panel {
  border-radius: 10px;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  margin: 3em 1em;
  background-color: var(--bg-dark);
  overflow: hidden;
  height: calc(100vh - 80px);
}

.search-panel {
  min-width: 300px;
  max-width: 300px;
}

.view-panel {
  position: relative;
  flex-grow: 1;
  margin-right: 2em;
}

.view-panel-question {
  height: calc(100vh - 80px);
  padding: 30px 15px 10px;
  overflow-y: auto;
}

.search-panel {
  margin-left: 2em;
}

hr {
  border: 2px solid gray;
}
</style>
