<script setup lang="ts">
import { ref, onMounted } from "vue";
import Quill from "quill";
import hljs from "highlight.js";

const editor = ref<HTMLElement | null>(null);

onMounted(() => {
  if (editor.value) {
    new Quill(editor.value, {
      theme: 'snow',
      modules: {
        syntax: { hljs },
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['code-block', 'blockquote', 'image'],
        ]
      }
    });
  }
});
</script>

<template>
  <div class="wrapper">
    <div ref="editor" class = "text-editor"></div>
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
@import "/node_modules/quill/dist/quill.snow.css";
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
