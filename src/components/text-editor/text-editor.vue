<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Quill from 'quill'
import hljs from 'highlight.js'

const editor = ref<HTMLElement | null>(null)
const quill = ref<any>(null)
const modelValue = defineModel<string>()

const updateContent = () => {
  if (quill.value) {
    modelValue.value = quill.value.root.innerHTML
  }
}

watch(
  modelValue,
  (newContent) => {
    if (quill.value && newContent !== quill.value.root.innerHTML) {
      quill.value.root.innerHTML = newContent
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (editor.value) {
    quill.value = new Quill(editor.value, {
      theme: 'snow',
      modules: {
        syntax: { hljs },
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['code-block', 'blockquote', 'image']
        ]
      }
    })
  }

  if (modelValue.value) {
    quill.value.root.innerHTML = modelValue.value
  }

  quill.value.on('text-change', updateContent)

  //quill.value.root.addEventListener('click', handleLinkClick)
})

//eslint-disable-next-line
const handleLinkClick = async (event: any) => {
  const target = event.target
  if (target.tagName === 'A') {
    event.preventDefault() // предотвращаем переход по ссылке

    const uuid = target.getAttribute('data-uuid')
    if (uuid) {
      // Выполняем асинхронный запрос
      try {
        const response = await fetch(`/api/data/${uuid}`)
        const data = await response.json()
        // Здесь вы можете обработать данные и открыть новую страницу
        console.log(data)
        // Например, можно использовать router для перехода на новую страницу
        // this.$router.push({ name: 'PageName', params: { uuid } });
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      }
    }
  }
}
</script>

<template>
  <div class="wrapper">
    <div ref="editor" class="text-editor"></div>
    <button @click="console.log(editor)">показать editor</button>
    <button @click="console.log(quill)">показать quill</button>
  </div>
</template>

<style scoped>
.wrapper {
  width: calc(100% - 20px);
  margin: 0px auto;
}

.text-editor {
  height: 300px;
}
</style>

<style>
@import '/node_modules/quill/dist/quill.snow.css';
@import 'highlight.js/styles/github.css';

.ql-editor {
  font-size: 18px;
}

.ql-toolbar .ql-formats {
  font-size: 18px;
}

.ql-toolbar button {
  padding: 10px;
}
</style>
