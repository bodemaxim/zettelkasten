import { supabase } from '@/api/supabaseClient'
import { useStore } from '@/use-store'
import type { Folder, FolderEditable, FolderShortInfo } from './types'

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

export const createFolder = async (newFolder: FolderEditable): Promise<Folder> => {
  const { data, error } = await supabase
    .from('folders')
    .insert([{ ...newFolder }])
    .select()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка создания папки',
      message: error.message
    })

    throw error
  }

  return data[0]
}

export const deleteFolderByUuid = async (uuid: string): Promise<void> => {
  const { error } = await supabase.from('folders').delete().eq('uuid', uuid)

  if (error) {
    setErrorMessage({
      customText: 'Ошибка удаления папки',
      message: error.message
    })
  }
}
