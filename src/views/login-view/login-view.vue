<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { login, seeUser } from '@/api/auth'
import router from '@/router'
import { InputText, Button } from 'primevue'
import { IftaLabel } from 'primevue'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'

const email = ref('')
const password = ref('')
const { isLoading, toggleLoading } = useStore()

const handleSignIn = async () => {
  toggleLoading()
  await login(email.value, password.value)
  await seeUser()

  toggleLoading()

  localStorage.setItem('email', email.value)
  localStorage.setItem('password', password.value)

  router.push('/notes')
}

const loginAutomatically = () => {
  const storedEmail = localStorage.getItem('email')
  const storedPassword = localStorage.getItem('password')

  if (storedEmail) {
    email.value = storedEmail
  }

  if (storedPassword) {
    password.value = storedPassword
  }

  if (storedEmail && storedPassword) {
    handleSignIn()
  }
}

onMounted(() => {
  loginAutomatically()
})
</script>

<template>
  <div class="login-view">
    <CoolSpinner v-if="isLoading" class="spinner" />
    <div v-else class="signin">
      <h1>Войти</h1>

      <form @submit.prevent="handleSignIn">
        <div class="form-group">
          <IftaLabel for="email">эл. почта:</IftaLabel>
          <InputText
            id="email"
            v-model="email"
            autocomplete="username"
            required
            class="input-form"
          />
        </div>
        <div class="form-group">
          <IftaLabel for="password">Пароль:</IftaLabel>
          <InputText
            id="password"
            type="password"
            v-model="password"
            autocomplete="current-password"
            required
            class="input-form"
          />
        </div>
        <Button @click="handleSignIn" class="submit-button">войти</Button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  width: 100vw;
  height: 100vh;
  background: black;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  background: transparent;
}

.signin {
  width: 450px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: var(--bg-primary);
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: auto;
}

h1 {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.input-form {
  width: 100%;
  background-color: var(--bg-dark);
  color: var(--text-primary);
  margin: 5px 0px 10px;
}

.submit-button {
  width: 100%;
}
</style>
