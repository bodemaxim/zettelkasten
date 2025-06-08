<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MultiSelect } from 'primevue'
import { getCardsShortInfo } from '@/api'
import type { CardShortInfo } from '@/types'
import { useStore } from '@/use-store'

const selectedCards = defineModel<CardShortInfo[]>()

const allCardsShortInfo = ref<CardShortInfo[]>([])

const isDropdownOpen = ref(false)

const { setLoading } = useStore()

/**
 * TODO: возможно это все можно удалить
 * Скрипт ниже: фикс последствий бага, из-за которого была нарушена цельность данных.
 * Есть ощущение, что проблема связана не с переименованиями, а с наличием
 * необходимых юидов в опшнс. Если это так, то надо при инициализации компонента
 * брать опции для выбранных компонентов запросом, чтобы они точно отображались
 */
const brokenLinks = ref<CardShortInfo[]>([])

const brokenLinksText = computed<string>(() => {
  return brokenLinks.value.map((link) => link.title).join(', ')
})

const fixBrokenLinks = async () => {
  if (!selectedCards.value) {
    brokenLinks.value = []
    return
  }

  //TODO: переделать инициализацию опций автокомплита под более большие данные
  setLoading(true)
  allCardsShortInfo.value = (await getCardsShortInfo({})).data
  setLoading(false)

  brokenLinks.value = selectedCards.value.reduce<CardShortInfo[]>((acc, card) => {
    const maybeRenamedCard: CardShortInfo | undefined = allCardsShortInfo.value.find(
      (item) => item.uuid === card.uuid
    )

    if (maybeRenamedCard && card.title !== maybeRenamedCard.title) {
      acc.push({ ...maybeRenamedCard })

      //и сразу фиксим
      const cardIndex = selectedCards.value!.findIndex((c) => c.uuid === card.uuid)
      if (cardIndex !== -1) {
        selectedCards.value![cardIndex] = maybeRenamedCard
      }
    }

    return acc
  }, [])
}

onMounted(fixBrokenLinks)
</script>

<template>
  <div class="wrapper">
    <MultiSelect
      v-model="selectedCards"
      :options="allCardsShortInfo"
      optionLabel="title"
      filter
      placeholder="Выберите связанные карточки"
      display="chip"
      fluid
      :selectionLimit="8"
      class="card-multiselect"
      @before-show="isDropdownOpen = true"
      @before-hide="isDropdownOpen = false"
    >
      <template #dropdownicon>
        <i :class="isDropdownOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />
      </template>
      <template #filtericon>
        <i class="pi pi-search" />
      </template>
      <template #header>
        <p class="header">Доступные карточки</p>
      </template>
    </MultiSelect>
    <p v-if="brokenLinks.length">
      При сохранении будут восстановлены нарушенные связи: {{ brokenLinksText }}
    </p>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
}

.card-multiselect {
  margin: 10px 0;
}

.option {
  display: flex;
  align-items: center;
}

.header {
  margin: 20px;
  font-size: 16px;
}

.footer {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
</style>

<style>
/* TODO: изолировать */
.p-multiselect-overlay {
  width: calc(100% - 100px);
  transform: translateX(-40px);
}

.card-multiselect .p-multiselect-label {
  display: flex;
  flex-wrap: wrap;
  overflow-x: auto;
  font-size: 12px;
}

@media (width <= 768px) {
  .p-multiselect-overlay {
    width: calc(100% - 60px);
    transform: translateX(30px);
  }
}
</style>
