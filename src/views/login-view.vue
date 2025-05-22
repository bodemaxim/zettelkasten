<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { InputText, Button, IftaLabel } from 'primevue'
import { login, seeUser } from '@/api/auth'
import router from '@/router'
import CoolSpinner from '@/ui/cool-spinner.vue'
import { useStore } from '@/use-store'

const email = ref('')
const password = ref('')
const { isLoading, setLoading } = useStore()

const handleSignIn = async () => {
  setLoading(true)
  await login(email.value, password.value)
  await seeUser()

  setLoading(false)

  localStorage.setItem('email', email.value)
  localStorage.setItem('password', password.value)

  router.push('/')
}

const loginAutomatically = () => {
  const storedEmail = localStorage.getItem('email')
  const storedPassword = localStorage.getItem('password')

  if (storedEmail) email.value = storedEmail
  if (storedPassword) password.value = storedPassword
  if (storedEmail && storedPassword) handleSignIn()
}

onMounted(loginAutomatically)
</script>

<template>
  <div class="login-view">
    <CoolSpinner v-if="isLoading" />
    <div v-else class="form-container">
      <h1 class="form-title">Войти</h1>

      <form @submit.prevent="handleSignIn">
        <IftaLabel for="email" class="input-container">
          <label for="email">эл. почта:</label>
          <InputText id="email" v-model="email" autocomplete="email" required class="input" />
        </IftaLabel>
        <IftaLabel for="password" class="input-container">
          <label for="password">Пароль:</label>
          <InputText
            id="password"
            type="password"
            v-model="password"
            autocomplete="password"
            required
            class="input"
          />
        </IftaLabel>
        <Button @click="handleSignIn" class="submit-button">войти</Button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  width: 100vw;
  height: 100vh;
  background: var(--bg-darker);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 450px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: var(--bg-primary);
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin: auto;
}

.form-title {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 20px;
}

.input-container {
  margin-bottom: 15px;
}

.input {
  width: 100%;
  background-color: var(--bg-dark);
  color: var(--text-primary);
  margin: 5px 0px 10px;
}

.submit-button {
  width: 100%;
}
</style>
