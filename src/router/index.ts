import MainView from '@/views/main-view/main-view.vue'
import LoginView from '@/views/login-view/login-view.vue'
import UnauthorizedView from '@/views/unauthorized-view/unauthorized-view.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/api/supabaseClient'

let localUser

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/notes',
      name: 'notes',
      component: MainView,
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView
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
