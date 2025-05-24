import { supabase } from '@/api/supabaseClient'
import { useStore } from '@/use-store'
import type { Folder, FolderShortInfo } from './types'

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

  return data
}

export const getFoldersShortInfo = async (): Promise<FolderShortInfo[]> => {
  const { error, data } = await supabase.from('folders').select('uuid, name')

  if (error) {
    setErrorMessage({
      customText: 'Ошибка загрузки папок',
      message: error.message
    })
    return []
  }

  return data
}
