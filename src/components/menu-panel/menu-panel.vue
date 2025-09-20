<script setup lang="ts">
import { computed, onMounted, ref, type StyleValue } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import { seeUser } from '@/api'
import { getProfileByUuid } from '@/api/profiles'
import type { Profile } from '@/types'
import { useStore } from '@/use-store'
import ExpandMenuButton from './expand-menu-button/expand-menu-button.vue'
import { MENU_HEIGHT } from './menu-panel.consts'

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

onMounted(async () => {
  const { data } = await seeUser()
  if (!data.session) return

  const userId = data.session.user.id
  profile.value = await getProfileByUuid(userId)
})
</script>

<template>
  <div v-if="!isMobileView">
    <div v-if="!isMenuExpanded" class="collapsed-menu_mobile">
      <ExpandMenuButton class="expand-button_desktop" />
    </div>
    <div v-else class="expanded-menu_desktop" :style="menuStyles">
      <div class="left-block">
        <img src="/public/favicon.ico" alt="лого" />
        <div class="user-name_desktop">{{ userName }}</div>
      </div>
      <ExpandMenuButton class="expand-button_desktop" />
    </div>
  </div>

  <div
    v-if="isMenuExpanded && isMobileView"
    class="expanded-menu_mobile"
    v-on-click-outside="() => setIsMenuExpanded(false)"
  >
    <div class="first-row">
      <div class="left-block">
        <img src="/public/favicon.ico" alt="лого" />
        <div class="user-name_desktop">{{ userName }}</div>
      </div>
      <ExpandMenuButton class="expand-button_mobile" />
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

.expanded-menu-container_mobile > *,
.expanded-menu_desktop > * {
  background-color: transparent;
}

.expaned-menu-container_mobile {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 4px;
  padding: 10px 15px;
  background-color: transparent;
}

.expaned-menu-container_mobile > * {
  background-color: transparent;
}

.expand-button_mobile,
.expand-button_desktop,
.first-row,
.first-row > *,
.left-block > * {
  background-color: transparent;
}

.expanded-menu_mobile {
  position: absolute;
  right: 0;
  z-index: 1;
  width: 60%;
  height: 100vh;
  padding: 20px;
  background-color: gray;
}

.collapsed-menu_mobile {
  position: fixed;
  top: 4px;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-right: 4px;
  padding: 0;
  background-color: transparent;
}

.first-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-block {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  padding-left: 4px;
}
</style>
