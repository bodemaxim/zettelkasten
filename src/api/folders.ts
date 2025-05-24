import { supabase } from '@/api/supabaseClient'
import { useStore } from '@/use-store'
import type { Folder } from './types'

const { setErrorMessage } = useStore()

export const getAllFolders = async (): Promise<Folder[]> => {
  const { error, data } = await supabase.from('folders').select('*')

  if (error) {
    setErrorMessage({
      customText: 'Ошибка загрузки папок',
      message: error.message
    })
    return []
  }

  console.log(data)
  return data
}
