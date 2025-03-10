<template>
  <div class="wrapper">
    <div ref="editor" class = "text-editor"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import Quill from "quill";

const editor = ref<HTMLElement | null>(null);

onMounted(() => {
  if (editor.value) {
    new Quill(editor.value, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          ['image', 'blockquote', 'code-block'],
        ]
      }
    });
  }
});
</script>

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
