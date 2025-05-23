<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
import { getIsUuid } from '@/utils'

const markdownText = defineModel<string>()

const emits = defineEmits<{
  clickOnLink: [uuid: string]
}>()

const parsedMarkdown = computed<string>(() => {
  const result = marked.parse(markdownText.value ?? '')
  return typeof result === 'string' ? result : ''
})

const textViewerRef = ref<HTMLElement | null>(null)

const delegateClickHandler = (event: MouseEvent) => {
  event.stopPropagation()
  event.preventDefault()

  const target = event.target as HTMLElement
  const link = target.closest('a')

  if (!link) return

  const href = link.getAttribute('href')

  if (!href) return

  if (getIsUuid(href)) emits('clickOnLink', href)
  else if (href.startsWith('http')) window.open(href, '_blank')
}

onMounted(() => {
  if (textViewerRef.value) {
    textViewerRef.value.addEventListener('click', delegateClickHandler)
  }
})

onBeforeUnmount(() => {
  if (textViewerRef.value) {
    textViewerRef.value.removeEventListener('click', delegateClickHandler)
  }
})
</script>

<template>
  <div v-html="parsedMarkdown" class="text-display" @click="delegateClickHandler"></div>
</template>

<style scoped>
.text-display {
  background-color: var(--bg-dark);
}

:deep(img) {
  display: block;
  max-width: calc(100% - 30px);
  margin: 30px auto;
  border: 3px solid var(--bg-lighter);
  border-radius: 5px;
  box-shadow: 0 0 15px var(--accent-blue);
}

:deep(h1) {
  margin: 15px 0;
  font-size: 24px;
  color: var(--accent-yellow);
}

:deep(h2) {
  margin: 15px 0;
  font-size: 22px;
  color: var(--accent-yellow);
}

:deep(h3) {
  margin: 15px 0 5px 10px;
  font-size: 20px;
  color: var(--accent-yellow);
}

:deep(h4) {
  margin: 10px 0 5px 20px;
  font-size: 18px;
  color: var(--accent-yellow);
}

:deep(p) {
  margin: 10px 0 10px 40px;
  font-size: 16px;
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
  max-width: calc(100% - 100px);
  overflow-y: auto;
  margin: 10px 40px;
  padding: 15px 80px 15px 15px;
  border-radius: 8px;
  background-color: var(--accent-blue);
}

:deep(a) {
  color: var(--accent-azure);
}

@media (width >= 320px) and (width <= 768px) {
  :deep(h1) {
    margin: 15px 0;
    font-size: 17px;
  }

  :deep(h2) {
    margin: 15px 0;
    font-size: 16px;
  }

  :deep(h3) {
    margin: 15px 0 5px;
    font-size: 15px;
  }

  :deep(h4) {
    margin: 10px 0 5px;
    font-size: 14px;
  }

  :deep(p) {
    margin: 10px 0;
    font-size: 13px;
  }

  :deep(ul, ol) {
    margin: 12px 20px;
  }

  :deep(li) {
    margin: 0 0 5px;
    font-size: 12px;
  }

  :deep(pre) {
    max-width: 100%;
    margin: 10px 0;
    padding: 15px 20px 15px 15px;
    font-size: 11px;
  }
}
</style>
