import type { Folder } from '@/types'

//#region API компонента
export type FolderViewPanelModel = Folder | null

export type FolderViewPanelEmits = {
  (e: 'deleted'): void
  (e: 'edited'): void
}
//#endregion API компонента

export type FolderTableRow = {
  label: string
  value: string | null | undefined
}
