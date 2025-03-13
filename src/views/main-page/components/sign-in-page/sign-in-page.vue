<script setup lang='ts'>
import { onMounted, ref } from 'vue';
import useAuthUser from '@/composables/use-auth-user';

const { signIn } = useAuthUser();

const email = ref('');
const password = ref('');

const handleSignIn = async () => {
  localStorage.setItem('rememberAuth', JSON.stringify({
    email: email.value,
    password: password.value,
  }));

  await signIn(email.value, password.value)
};

onMounted(() => {
  const rememberedAuth = localStorage.getItem('rememberAuth');

  if (rememberedAuth) {
    const { email: storedEmail, password: storedPassword } = JSON.parse(rememberedAuth);
    email.value = storedEmail;
    password.value = storedPassword;
  }
})
</script>

<template>
  <div class="signin">
    <h1>Войти</h1>
    <form @submit.prevent="handleSignIn">
      <div>
        <label for="email">эл. почта:</label>
        <input type="text" v-model="email" id="email" required />
      </div>
      <div>
        <label for="password">Пароль:</label>
        <input type="password" v-model="password" id="password" required />
      </div>
      <button type="submit">войти</button>
    </form>
  </div>
</template>

<style scoped>
.signin {
  max-width: 300px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>