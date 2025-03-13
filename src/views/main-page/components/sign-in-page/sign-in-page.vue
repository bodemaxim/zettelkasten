<script setup lang='ts'>
import { ref } from 'vue';
import useAuthUser from '@/composables/use-auth-user';

const { signIn } = useAuthUser();

const email = ref('');
const password = ref('');

const handleSignIn = async () => {
  await signIn(email.value, password.value)
};
</script>

<template>
  <div class="signin">
    <h1>Sign In</h1>
    <form @submit.prevent="handleSignIn">
      <div>
        <label for="email">email:</label>
        <input type="text" v-model="email" id="email" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" id="password" required />
      </div>
      <button type="submit">Sign In</button>
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