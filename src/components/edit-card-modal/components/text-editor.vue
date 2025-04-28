<script setup lang="ts">
import { ref } from 'vue'
import CardsAutocomplete from './cards-autocomplete.vue'
import { Button, Toolbar } from 'primevue'
import type { CardShortInfo } from '@/types'
import { useStore } from '@/use-store'

const text = defineModel<string>('text')

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const selectionRange = ref<{ start: number; end: number } | null>(null)
const isHyperLinkEditorVisible = ref(false)

const { isMobileView } = useStore()

const toggleHyperLinkEditor = () => {
  isHyperLinkEditorVisible.value = !isHyperLinkEditorVisible.value
}

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
    <p>*выдели слово в редакторе и выбери гиперссылку на статью Z10n</p>
    <Toolbar class="text-editor-toolbar">
      <template #start>
        <div class="left-toolbar-container">
          <Button
            v-tooltip="'Выделите фразу и нажмите эту кнопку, чтобы добавить гиперссылку'"
            icon="pi pi-external-link"
            severity="primary"
            size="small"
            class="button"
            @click="toggleHyperLinkEditor"
          />
          <CardsAutocomplete
            v-if="isHyperLinkEditorVisible"
            @updated="addHyperlinkToSelection($event)"
          />
        </div>
      </template>
    </Toolbar>
    <textarea
      ref="textareaRef"
      v-model="text"
      :class="('input-form', { 'input-form-mobile': isMobileView })"
      @blur="saveCurrentSelection"
    ></textarea>
  </div>
</template>

<style scoped>
.text-editor-wrapper {
  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 4px;
  width: 100%;
}

.input-form {
  height: 400px;
  resize: none;
  margin: 10px 0;
  font-size: 16px;
}

.input-form-mobile {
  font-size: 12px;
  height: 400px;
  resize: none;
}

.left-toolbar-container {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: var(--bg-lighter);
}
</style>

<style>
.text-editor-toolbar.p-toolbar {
  background-color: var(--bg-lighter);
}
</style>
