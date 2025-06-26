<script setup lang="ts">
import { ref } from 'vue'
import { Toolbar } from 'primevue'
import type { CardShortInfo } from '@/types'
import CardsAutocomplete from './cards-autocomplete.vue'

const text = defineModel<string>('text')

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const selectionRange = ref<{ start: number; end: number } | null>(null)

const saveCurrentSelection = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  selectionRange.value = {
    start: textarea.selectionStart,
    end: textarea.selectionEnd
  }
}

const addHyperlinkToSelection = (hyperlink: CardShortInfo) => {
  const textarea = textareaRef.value

  if (!textarea) return

  const start = selectionRange.value?.start || textarea.selectionStart
  const end = selectionRange.value?.end || textarea.selectionEnd
  const selectedText = textarea.value.substring(start, end)

  const markdownLink = `[${selectedText}](${hyperlink.uuid})`
  const newText = textarea.value.substring(0, start) + markdownLink + textarea.value.substring(end)

  text.value = newText
  selectionRange.value = null
}
</script>

<template>
  <div class="text-editor-wrapper">
    <Toolbar class="text-editor-toolbar">
      <template #start>
        <div class="left-toolbar-container">
          <CardsAutocomplete
            @updated="addHyperlinkToSelection($event)"
            placeholder="Выдели текст, выбери ссылку"
            class="autocomplete"
          />
        </div>
      </template>
    </Toolbar>
    <textarea
      ref="textareaRef"
      v-model="text"
      class="input-form"
      @blur="saveCurrentSelection"
    ></textarea>
  </div>
</template>

<style scoped>
.text-editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: left;
  width: 100%;
}

.autocomplete {
  width: 300px;
}

.input-form {
  height: 400px;
  margin: 10px 0;
  font-size: 16px;
  resize: none;
}

.left-toolbar-container {
  display: flex;
  gap: 10px;
  align-items: center;
  background-color: var(--bg-lighter);
}
</style>

<style>
.text-editor-toolbar.p-toolbar {
  background-color: var(--bg-lighter);
}
</style>
