//import type { User } from '@supabase/supabase-js'
import type { AuthResponse } from '@supabase/supabase-js'
import { supabase } from '@/api/supabaseClient'
import { useStore } from '@/use-store'
import type { NewUser } from './types'

const { setErrorMessage } = useStore()

export async function createAccount(newUser: NewUser): Promise<AuthResponse['data'] | null> {
  const { email, password, first_name, last_name } = newUser

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name
      }
    }
  })

  if (error) {
    setErrorMessage({
      customText: 'Ошибка создания аккаунта',
      message: error.message
    })
    return null
  }

  return data
}

export async function login(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })
  if (error) {
    setErrorMessage({
      customText: 'Ошибка входа',
      message: error.message
    })
    return []
  }
}

export async function seeUser() {
  const localUser = await supabase.auth.getSession()
  return localUser
}

export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка выхода из профиля',
      message: error.message
    })
    return []
  }
}
