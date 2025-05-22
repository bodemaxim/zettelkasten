import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueDevTools from 'vite-plugin-vue-devtools'
import checker from 'vite-plugin-checker'

export default defineConfig({
  base: '/zettelkasten',
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
    checker({
      typescript: true,
      vueTsc: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
