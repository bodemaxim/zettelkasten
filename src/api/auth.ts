//import type { User } from '@supabase/supabase-js'
import { supabase } from '@/api/supabaseClient'
import type { NewUser } from './types'

export async function createAccount(newUser: NewUser) {
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
    console.log(error)
  } else {
    console.log(data.user)
  }
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })
  if (error) {
    console.log(error)
  } else {
    console.log(data)
  }
}

export async function seeUser() {
  const localUser = await supabase.auth.getSession()
  return localUser
}

export async function logout() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error)
  } else {
    console.log('Sign out success')
  }
}
