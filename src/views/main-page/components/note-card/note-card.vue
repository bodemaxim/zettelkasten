<script setup lang='ts'>
import type { Card } from '@/api/types';
import { deleteCardByUuid } from '@/api';

const props = defineProps<{ card: Card | null }>();

const editCard = () => {};

const deleteCard = async () => {
  if (props.card?.uuid) await deleteCardByUuid(props.card.uuid);
};
</script>

<template>
    <div class="note-card">
        <h2>{{ card?.title }}</h2>
        <div>{{ card?.text }}</div>
        <button @click="editCard">Редактировать</button>
        <button @click="deleteCard">Удалить</button>
    </div>
</template>

<style scoped>
.note-card {
    max-width: 100%;
    width: 500px;
    min-height: 20px;
    border: solid lightgrey 2px;
    border-radius: 10px;

}
</style>