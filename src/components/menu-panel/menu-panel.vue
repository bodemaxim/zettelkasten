<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, type StyleValue } from 'vue'
import { useRouter } from 'vue-router'
import { vOnClickOutside } from '@vueuse/components'
import { Button, Divider } from 'primevue'
import { logout, seeUser } from '@/api'
import { getProfileByUuid } from '@/api/profiles'
import type { Profile } from '@/types'
import { useStore } from '@/use-store'
import ExpandMenuButton from './expand-menu-button/expand-menu-button.vue'
import { MENU_HEIGHT } from './menu-panel.consts'

const router = useRouter()

const { isMobileView, isMenuExpanded, setIsMenuExpanded } = useStore()

const menuStyles = computed<StyleValue>(() => ({
  minHeight: `${MENU_HEIGHT}px`
}))

const profile = ref<Profile | null>(null)

const userName = computed(() => {
  const first = profile.value?.first_name ?? ''
  const last = profile.value?.last_name ?? ''
  return first || last ? `${first} ${last}`.trim() : 'Пользователь'
})

const activeRoute = computed(() => router.currentRoute.value.path)

onMounted(async () => {
  const { data } = await seeUser()
  if (!data.session) return

  const userId = data.session.user.id
  profile.value = await getProfileByUuid(userId)
})

const exitProfile = () => {
  localStorage.removeItem('email')
  localStorage.removeItem('password')

  logout()

  router.push('login')
}

const onHoverStart = () => {
  setIsMenuExpanded(true)
}

const hoverTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const onHoverEnd = () => {
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
  }

  hoverTimer.value = setTimeout(() => {
    setIsMenuExpanded(false)
    hoverTimer.value = null
  }, 1200)
}

onUnmounted(() => {
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value)
  }
})

const onLinkClick = () => {
  setIsMenuExpanded(false)
}
</script>

<template>
  <!--Десктопная-->
  <div v-if="!isMobileView" @mouseenter="onHoverStart" @mouseleave="onHoverEnd">
    <div v-if="!isMenuExpanded" class="collapsed-menu_mobile">
      <span class="pi pi-angle-double-down"></span>
    </div>
    <div v-else class="expanded-menu_desktop" :style="menuStyles">
      <div class="left-block">
        <img src="/public/favicon.ico" alt="лого" />
        <div class="user-name_desktop">{{ userName }}</div>
        <Button
          type="button"
          icon="pi pi-sign-out"
          size="small"
          severity="secondary"
          class="menu-button h-8"
          @click="exitProfile"
        ></Button>
        <!--TODO: возможно использовать компонент Menu. Возможно вынести в отдельный компонент -->
        <div class="flex items-center text-md ml-10">
          <span class="pi pi-align-justify mr-3"></span>
          <router-link to="/" :class="{ active: activeRoute === '/' }"> Заметки </router-link>
        </div>
        <div class="flex items-center text-md ml-5">
          <span class="pi pi-folder mr-3"></span>
          <router-link to="/folders" :class="{ active: activeRoute === '/folders' }">
            Папки
          </router-link>
        </div>
        <div class="flex items-center text-md ml-5">
          <span class="pi pi-cog mr-3"></span>
          <span :class="{ active: activeRoute === '/settings' }">Настройки</span>
        </div>
      </div>
    </div>
  </div>

  <!--Мобильная-->
  <div
    v-if="isMenuExpanded && isMobileView"
    class="expanded-menu_mobile"
    v-on-click-outside="() => setIsMenuExpanded(false)"
  >
    <div class="flex-b">
      <div class="flex-s">
        <img src="/public/favicon.ico" alt="лого" />
        <div class="text-xl">Z10N</div>
      </div>
      <ExpandMenuButton class="expand-button_mobile" />
    </div>

    <Divider />

    <div class="flex items-center text-md my-3">
      <span class="pi pi-align-justify mr-3"></span>
      <router-link to="/" :class="{ active: activeRoute === '/' }" @click="onLinkClick">
        Заметки
      </router-link>
    </div>
    <div class="flex items-center text-md my-3">
      <span class="pi pi-folder mr-3"></span>
      <router-link
        to="/folders"
        :class="{ active: activeRoute === '/folders' }"
        @click="onLinkClick"
      >
        Папки
      </router-link>
    </div>
    <div class="flex items-center text-md my-3">
      <span class="pi pi-cog mr-3"></span>
      <span :class="{ active: activeRoute === '/settings' }" @click="onLinkClick">Настройки</span>
      <!-- Аналогично -->
    </div>

    <div class="flex justify-between flex-grow items-end">
      <div class="user-name_desktop">{{ userName }}</div>
      <Button
        type="button"
        icon="pi pi-sign-out"
        size="small"
        severity="secondary"
        class="menu-button h-8"
        @click="exitProfile"
      ></Button>
    </div>
  </div>
</template>

<style scoped>
.expanded-desktop {
  width: 100vw;
  min-height: 100px;
  padding: 8px;
  background-color: gray;
}

.expanded-menu_desktop {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: space-between;
  width: 100vw;
  padding: 4px;
  background-color: gray;
}

.user-name_desktop {
  margin-left: 20px;
}

.expanded-menu_mobile {
  position: absolute;
  right: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 60%;
  height: 100vh;
  padding: 20px;
  background-color: var(--bg-lighter);
}

.collapsed-menu_mobile {
  position: fixed;
  top: 4px;
  right: 0;
  z-index: 1;
  display: flex;
  justify-content: center;
  width: 100%;
  margin-right: 4px;
  padding: 0;
  background-color: transparent;
}

.left-block {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  padding-left: 4px;
}

/* Стили для активного пункта меню */
.active {
  text-decoration: underline;
  color: var(--accent-green);
}
</style>
