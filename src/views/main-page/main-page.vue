 <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getCardByUuid, getCardTitles, createCard } from '@/api'
  import useAuthUser from '@/composables/use-auth-user';
  import TextEditor from '@/components/text-editor/text-editor.vue';
  import NoteCard from './components/note-card/note-card.vue';
  import SignInPage from './components/sign-in-page/sign-in-page.vue';

  const { user } = useAuthUser()

  const cards: any = ref([])
  const viewedCard: any | null = ref(null)

  const emptyCard = {
    title: "",
    text: "",
    links: []
  }

  const newCard: any =ref(emptyCard)

  const fetchCards = async () => {
    try {
      cards.value = await getCardTitles();
    } catch(e) {
      console.error(e)
    }
  }

  const viewCard = async (cardUuid: string) => {
    try {
      viewedCard.value = await getCardByUuid(cardUuid)
    } catch(e) {
      console.error(e)
    }
  }

  const saveNewCard = async () => {
    try {
      await createCard(newCard.value)
      await fetchCards()
    } catch(e) {
      console.error(e)
    }
  }

const tryInitUser  = () => {
  if (user.value) return;

  const userData = localStorage.getItem('user');

  if (!userData) return;

  const userParsed = JSON.parse(userData);
  user.value = userParsed;
  console.debug("user.value", user.value)
};

  onMounted(async () => {
    tryInitUser();
    if (user.value) fetchCards()
  })
  </script>

  <template>
    <SignInPage v-if="!user" />
    <div v-else>
      <h1>Мои карточки</h1>
      <ul>
        <li v-for="card in cards" :key="card.uuid" @click="viewCard(card.uuid)" class="card">{{ card.title }}</li>
      </ul>
      <h1>Просмотр карточки</h1>
      <NoteCard :card="viewedCard"/>
      <h1>Добавление карточки</h1>
      <form id="cardForm">
          <div>
              <label for="title">Заголовок:</label>
              <input type="text" id="title" name="title" v-model="newCard.title">
          </div>
          <div>
              <label for="text">Текст:</label>
              <textarea id="text" name="text" v-model="newCard.text"></textarea>
          </div>
          <button type="submit" @click="saveNewCard">Создать карточку</button>
      </form>
      <h1>Редактор</h1>
      <TextEditor />
    </div>
  </template>

  <style scoped>
  .card {
    cursor: pointer;
  }
  </style>