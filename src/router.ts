import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/api/supabaseClient'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

let localUser

const MainView = () => import('@/views/main-view.vue')
const LoginView = () => import('@/views/login-view.vue')
const UnauthorizedView = () => import('@/views/unauthorized-view.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'notes',
      component: MainView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
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

async function getUser(next: NavigationGuardNext) {
  localUser = await supabase.auth.getSession()
  if (localUser.data.session == null) {
    next('/unauthorized')
  } else {
    next()
  }
}

router.beforeEach(
  (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    if (to.meta.requiresAuth) {
      getUser(next)
    } else {
      next()
    }
  }
)

export default router
