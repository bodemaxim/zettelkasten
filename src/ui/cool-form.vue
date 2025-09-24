<script setup lang="ts">
import { computed } from 'vue'
import { IftaLabel, InputText, Message } from 'primevue'

const inputValue = defineModel<string>({ required: true })

type CoolFormProps = {
  id: string
  label: string
  invalid?: boolean | null
  type?: string
  errorMessage?: string
}

const props = withDefaults(defineProps<CoolFormProps>(), {
  id: '',
  label: '',
  invalid: null,
  type: 'text',
  errorMessage: ''
})

const showError = computed(() => props.invalid && props.errorMessage)
</script>

<template>
  <IftaLabel :for="id">
    <label :for="id" class="label">{{ label }} </label>
    <InputText
      :id="id"
      v-model="inputValue"
      v-bind="$attrs"
      :invalid="invalid"
      :type="type"
      class="input"
    />
    <Message v-if="showError" severity="error" class="error-message">{{ errorMessage }}</Message>
  </IftaLabel>
</template>

<style scoped>
.input {
  width: 100%;
  margin: 0;
  color: var(--text-primary);
}

.label {
  padding-top: 2px !important;
}

.error-message {
  margin: 8px 0 0;
}
</style>
