<script setup lang="ts">
import { RadioButton } from 'primevue'
import type { QuizGrade } from '@/types'
import { QUIZ_GRADES } from './grade-picker.consts'

const grade = defineModel<QuizGrade | null>()
</script>

<template>
  <div class="grade-picker">
    <div v-for="{ value, label } in QUIZ_GRADES" :key="value" class="grade-picker__option">
      <RadioButton
        v-model="grade"
        :inputId="`grade-${value}`"
        name="quiz-grade"
        :value="value"
      />
      <label :for="`grade-${value}`">{{ label }}</label>
    </div>
  </div>
</template>

<style scoped>
.grade-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.grade-picker__option {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
</style>
