 <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getAllCards } from '@/api'
  import TextEditor from '@/components/text-editor/text-editor.vue';

  const cards :any = ref([])

  //изменение

  const fetchCards = async () => {
    try {
      cards.value = await getAllCards();
    } catch(e) {
      console.error(e)
    }
  }

  onMounted(() => {
    fetchCards()
  })
  </script>

  <template>
    <h1>Мои карточки</h1>
    <ul>
      <li v-for="card in cards" :key="card.id">{{ card.title }}</li>
    </ul>

    <TextEditor />
  </template>