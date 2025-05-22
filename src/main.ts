import { createApp } from 'vue'
import './assets/base.css'
import 'primeicons/primeicons.css'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
import App from '@/App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.my-app-dark',
      cssLayer: false
    }
  }
})

app.use(ConfirmationService)

app.directive('tooltip', Tooltip)

app.mount('#app')
