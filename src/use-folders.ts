import type { TreeNode } from 'primevue/treenode'
import type { Folder } from '@/types'

export const useFolders = () => {
  /*
   * Строит дерево папок из плоского массива.
   * @param folders - массив всех папок
   * @param parentUuid - uuid родительской папки (для рекурсии), по умолчанию null для корня
   * @returns массив папок с вложенными children
   */
  const buildFolderTree = (folders: Folder[], parentUuid: string | null = null): TreeNode[] => {
    const children = folders.filter((folder) => {
      if (parentUuid === null) {
        return folder.path.length === 0
      } else {
        return folder.path.length > 0 && folder.path[folder.path.length - 1].uuid === parentUuid
      }
    })

    return children.map((folder) => {
      const folderChildren = buildFolderTree(folders, folder.uuid)
      return {
        //TODO: рефакторинг: удалить поле uuid, name
        key: folder.uuid,
        label: folder.name,
        ...folder,
        ...(folderChildren.length > 0 && { children: folderChildren })
      }
    })
  }

  return {
    buildFolderTree
  }
}
