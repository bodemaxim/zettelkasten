<script setup lang="ts">
import { useAttrs } from 'vue'
import { IftaLabel, InputText, Message, type InputTextPassThroughAttributes } from 'primevue'

const inputValue = defineModel<string>({ required: true })

const attrs: InputTextPassThroughAttributes = useAttrs()
</script>

<template>
  <IftaLabel :for="attrs.id" class="input-container">
    <label :for="attrs.id">{{ attrs.label }}</label>
    <InputText
      :id="attrs.id"
      v-model="inputValue"
      v-bind="attrs"
      :invalid="attrs.invalid"
      class="input"
    />
    <Message
      v-if="attrs.invalid && attrs.errorMessage"
      severity="error"
      :text="attrs.errorMessage"
    />
  </IftaLabel>
</template>

<style scoped>
.input-container {
  margin-bottom: 15px;
}

.input {
  width: 100%;
  margin: 5px 0 10px;
  color: var(--text-primary);
  background-color: var(--bg-dark);
}
</style>
