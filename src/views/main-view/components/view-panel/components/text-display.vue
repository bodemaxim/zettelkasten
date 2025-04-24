<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { marked } from 'marked'
import 'highlight.js/styles/atom-one-dark.css'

const markdownText = defineModel<string>()

const emits = defineEmits<{
  clickOnLink: [uuid: string]
}>()

const parsedMarkdown = computed(() => marked.parse(markdownText.value ?? ''))

const handleLinkClicks = () => {
  const links = document.querySelectorAll('.text-display a')

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()

      const href = link.getAttribute('href')

      if (!href) return

      if (href.startsWith('http') && href.includes('/')) {
        window.open(href, '_blank')
        return
      }

      console.log('Clicked on card UUID:', href)
      emits('clickOnLink', href)
    })
  })
}

onMounted(async () => {
  handleLinkClicks()
})
</script>

<template>
  <div v-html="parsedMarkdown" class="text-display"></div>
</template>

<style scoped>
.text-display {
  background-color: var(--bg-dark);
}

:deep(img) {
  max-width: calc(100% - 30px);
  margin: 30px auto;
  display: block;
  border: 3px solid var(--bg-lighter);
  border-radius: 5px;
  box-shadow: 0 0 15px var(--accent-blue);
}

:deep(h1) {
  font-size: 24px;
  margin: 15px 0;
  color: var(--accent-yellow);
}

:deep(h2) {
  font-size: 22px;
  color: rgb(116, 138, 236);
  margin: 15px 0;
  color: var(--accent-yellow);
}

:deep(h3) {
  font-size: 20px;
  color: lightpink;
  margin: 15px 0 5px 10px;
  color: var(--accent-yellow);
}

:deep(h4) {
  font-size: 18px;
  color: lightblue;
  margin: 10px 0 5px 20px;
  color: var(--accent-yellow);
}

:deep(p) {
  font-size: 16px;
  margin: 10px 0 10px 40px;
}

:deep(ul) {
  margin: 12px 50px;
  list-style: disc;
}

:deep(ol) {
  margin: 12px 50px;
  list-style: decimal;
}

:deep(pre) {
  display: inline-block;
  background-color: var(--accent-blue);
  border-radius: 8px;
  padding: 15px 80px 15px 15px;
  margin: 10px 40px;
  max-width: calc(100% - 100px);
  overflow-y: auto;
}

/* XS */
@media (min-width: 320px) and (max-width: 768px) {
  :deep(h1) {
    font-size: 17px;
    margin: 15px 0;
  }

  :deep(h2) {
    font-size: 16px;
    margin: 15px 0;
  }

  :deep(h3) {
    font-size: 15px;
    margin: 15px 0 5px 0;
  }

  :deep(h4) {
    font-size: 14px;
    margin: 10px 0 5px;
  }

  :deep(p) {
    font-size: 13px;
    margin: 10px 0;
  }

  :deep(ul, ol) {
    margin: 12px 20px;
  }

  :deep(li) {
    font-size: 12px;
    margin: 0 0 5px;
  }

  :deep(pre) {
    padding: 15px 20px 15px 15px;
    margin: 10px 0;
    max-width: 100%;
    font-size: 11px;
  }
}
</style>
