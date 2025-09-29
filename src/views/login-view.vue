<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Button } from 'primevue'
import { createAccount, login, seeUser } from '@/api/auth'
import { setProfileByUuid } from '@/api/profiles'
import router from '@/router'
import type { NewUser } from '@/types'
import CoolForm from '@/ui/cool-form.vue'
import { useStore } from '@/use-store'

const isNewUser = ref(false)

const email = ref('')
const password = ref('')

const passwordConfirm = ref('')
const firstName = ref('')
const lastName = ref('')

const { setLoading } = useStore()

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

const isPasswordMismatch = computed<boolean>(() =>
  Boolean(password.value && passwordConfirm.value && password.value !== passwordConfirm.value)
)

const successfulUserCreationText = ref<string | null>(null)

const handleCreateNew = async () => {
  if (isPasswordMismatch.value) return

  setLoading(true)

  const request: NewUser = {
    email: email.value,
    password: password.value,
    first_name: firstName.value,
    last_name: lastName.value
  }

  const data = await createAccount(request)

  if (!data?.user) {
    setLoading(false)
    return
  }
  successfulUserCreationText.value =
    'Профиль успешно создан. Зайдите на указанную почту для подтверждения'

  const userId = data.user.id

  setLoading(true)
  await setProfileByUuid(userId, {
    first_name: firstName.value,
    last_name: lastName.value
  })

  setLoading(false)
}

const title = computed<string>(() => (isNewUser.value ? 'Создать аккаунт' : 'Войти'))

const handleSubmit = () => {
  if (isNewUser.value) handleCreateNew()
  else handleSignIn()
}

const question = computed<string>(() => (isNewUser.value ? 'Уже есть аккаунт?' : 'Впервые тут?'))
const suggestedAction = computed<string>(() => (isNewUser.value ? 'Войти' : 'Создать аккаунт'))
</script>

<template>
  <div class="login-view">
    <div class="form-container">
      <h1 class="form-title">{{ title }}</h1>

      <CoolForm v-model="email" label="Эл. почта" id="email" autocomplete="email" required />
      <CoolForm
        id="password"
        v-model="password"
        autocomplete="password"
        type="password"
        required
        label="Пароль"
        class="input-form"
      />
      <CoolForm
        v-if="isNewUser"
        v-model="passwordConfirm"
        label="Подтвердите пароль"
        id="passwordConfirm"
        type="password"
        required
        :invalid="isPasswordMismatch"
        error-message="Пароли не совпадают"
        class="input-form"
      />
      <CoolForm
        v-if="isNewUser"
        v-model="firstName"
        label="Имя"
        id="firstName"
        type="text"
        required
        class="input-form"
      />
      <CoolForm
        v-if="isNewUser"
        v-model="lastName"
        label="Фамилия"
        id="lastName"
        type="text"
        required
        class="input-form"
      />
      <Button @click="handleSubmit" class="submit-button">{{ title }}</Button>
      <div class="alternative-offer">
        {{ question }}
        <span class="alternative-link" @click="isNewUser = !isNewUser">{{ suggestedAction }}</span>
      </div>
      <p v-if="successfulUserCreationText" class="successful-creation">
        {{ successfulUserCreationText }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  padding: 20px;
  background: var(--bg-darker);
}

.form-container {
  width: 450px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
  background-color: var(--bg-dark);
}

.form-title {
  margin-bottom: 20px;
  text-align: center;
  color: var(--text-primary);
}

.input-container {
  margin-bottom: 15px;
}

.input-form {
  margin: 5px 0 10px;
}

.submit-button {
  width: 100%;
}

.successful-creation,
.alternative-offer {
  width: 100%;
  margin: 20px 0 0;
  text-align: center;
}

.successful-creation {
  color: lightgreen;
}

.alternative-link {
  color: var(--accent-azure);
  cursor: pointer;
}
</style>
