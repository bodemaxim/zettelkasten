<script setup lang="ts">
import { ref } from 'vue'
import { login, seeUser } from '@/api/auth'
import router from '@/router'

const email = ref('')
const password = ref('')

const handleSignIn = async () => {
  await login(email.value, password.value)
  await seeUser()
  router.push('/notes')
}
</script>

<template>
  <div class="background">
    <div class="signin">
      <h1>Войти</h1>
      <form @submit.prevent="handleSignIn">
        <div class="form-group">
          <label for="email">эл. почта:</label>
          <input type="text" v-model="email" id="email" autocomplete="username" required />
        </div>
        <div class="form-group">
          <label for="password">Пароль:</label>
          <input
            type="password"
            v-model="password"
            id="password"
            autocomplete="current-password"
            required
          />
        </div>
        <button type="submit">войти</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.background {
  width: 100vw;
  height: 100vh;
  background: black;
  padding: 20px;
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

label {
  display: block;
  margin-bottom: 5px;
  color: var(--text-beige);
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  color: var(--text-primary);
  background-color: var(--bg-dark);
}

input:focus {
  border-color: var(--accent-blue);
  outline: none;
  background-color: var(--bg-lighter);
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: var(--accent-green);
  color: var(--text-primary);
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: var(--accent-azure);
}
</style>
