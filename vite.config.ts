import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import checkerPlugin from 'vite-plugin-checker'
import VueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/zettelkasten',
  plugins: [
    vue(),
    vueJsx(),
    VueDevTools(),
    checkerPlugin({
      typescript: true,
      vueTsc: true
    }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
