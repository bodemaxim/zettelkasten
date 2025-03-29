<script setup lang="ts">
import { ref } from 'vue'
import { getCardByUuid, getCardTitles, createCard } from '@/api'
import TextEditor from '@/components/text-editor/text-editor.vue'
import NoteCard from './components/note-card/note-card.vue'

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
</script>

<template>
  <div class="main-page">
    <!--v-if="!user"-->
    <div>
      <h1>Мои карточки</h1>
      <ul class="card-list">
        <li v-for="card in cards" :key="card.uuid" @click="viewCard(card.uuid)" class="card">
          {{ card.title }}
        </li>
      </ul>
      <h1>Просмотр карточки</h1>
      <NoteCard :card="viewedCard" />
      <h1>Добавление карточки</h1>
      <form id="cardForm">
        <div>
          <label for="title">Заголовок:</label>
          <input type="text" id="title" name="title" v-model="newCard.title" />
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
  </div>
</template>

<style scoped>
:root {
  --bg-darkel: #333; /* Определение переменной */
}

.main-page {
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-darker);
  display: flex;
  align-items: center;
}

.signin {
  margin: 0 auto;
}

.card {
  cursor: pointer;
}

.card-list {
  border: 2px solid red;
  min-height: 100px;
}
</style>
