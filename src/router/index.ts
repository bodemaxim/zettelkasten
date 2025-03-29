import MainPage from '@/views/main-page/main-page.vue'
import LoginPage from '@/views/login-page/login-page.vue'
import UnauthorizedPage from '@/views/unauthorized-page/unauthorized-page.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/api/supabaseClient'

let localUser

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/notes',
      name: 'notes',
      component: MainPage,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedPage
    }
  ]
})

async function getUser(next: any) {
  localUser = await supabase.auth.getSession()
  if (localUser.data.session == null) {
    next('/unauthorized')
  } else {
    next()
  }
}

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    getUser(next)
  } else {
    next()
  }
})

export default router
