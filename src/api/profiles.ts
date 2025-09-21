import { supabase } from '@/api/supabaseClient'
import { useStore } from '@/use-store'
import type { Profile } from './types'

const { setErrorMessage } = useStore()

export const getProfileByUuid = async (uuid: string): Promise<Profile | null> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_uuid', uuid).single()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка получения данных профиля',
      message: error.message
    })

    return null
  }

  return data
}

export const setProfileByUuid = async (
  uuid: string,
  profileData: Partial<Profile>
): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...profileData, user_uuid: uuid })
    .select('*')
    .single()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка обновления профиля',
      message: error.message
    })

    return null
  }

  return data
}
