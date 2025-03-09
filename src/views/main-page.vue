 <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { supabase } from '@/lib/supabaseClient'

  const cards :any = ref([])

  async function getCards() {
    const { data } = await supabase.from('cards').select()
    cards.value = data
  }

  onMounted(() => {
    getCards()
  })
  </script>

  <template>
    <ul>
      <li v-for="card in cards" :key="card.id">{{ card.title }}</li>
    </ul>
  </template>