<script setup lang="ts">
import { ref } from 'vue'
import { Toolbar, Button, Menu } from 'primevue'
import type { CardShortInfo } from '@/types'
import CardsAutocomplete from '../cards-autocomplete/cards-autocomplete.vue'
import { tables } from './text-editor.consts'
import type { TableSize } from './text-editor.types'

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

const cursorPosition = ref<number | null>(null)

const insertTable = (tableSize: TableSize) => {
  const textarea = textareaRef.value
  if (!textarea) return

  const insertPosition = cursorPosition.value ?? textarea.selectionStart
  const currentText = text.value || ''
  const tableTemplate = tables.get(tableSize)

  if (!tableTemplate) return

  const newText =
    currentText.substring(0, insertPosition) +
    '\n' +
    tableTemplate +
    '\n' +
    currentText.substring(insertPosition)
  text.value = newText

  setTimeout(() => {
    textarea.focus()
    const newCursorPosition = insertPosition + tableTemplate.length + 2
    textarea.setSelectionRange(newCursorPosition, newCursorPosition)
  }, 0)
}

const menu = ref()
const items = ref([
  {
    label: 'столбцы x строки',
    items: [
      {
        label: '2x5',
        command: () => insertTable('2x5')
      },
      {
        label: '3x5',
        command: () => insertTable('3x5')
      }
    ]
  }
])

const toggle = (event: Event) => {
  menu.value.toggle(event)
}
</script>

<template>
  <div class="text-editor-wrapper">
    <Toolbar class="text-editor-toolbar">
      <template #start>
        <div class="left-toolbar-container">
          <CardsAutocomplete @updated="addHyperlinkToSelection($event)" class="autocomplete" />
          <div class="table-button-container">
            <Button
              type="button"
              severity="secondary"
              size="small"
              icon="pi pi-table"
              @click="toggle"
              aria-haspopup="true"
              aria-controls="overlay_menu"
            />
            <Menu ref="menu" id="overlay_menu" :model="items" :popup="true" />
          </div>
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
  background-color: var(--bg-lighter);
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

.autocomplete,
.table-button-container {
  background-color: var(--bg-lighter);
}
</style>

<style>
.text-editor-toolbar.p-toolbar {
  margin: 4px;
  background-color: var(--bg-lighter);
}
</style>
