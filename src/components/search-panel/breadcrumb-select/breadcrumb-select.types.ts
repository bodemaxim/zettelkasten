import type { FolderShortInfo } from '@/types'

//#region API компонента
export type OpenModel = boolean

export type BreadcrumbSelectProps = {
  currentFolderUuid: string | null
}

export type BreadcrumbSelectEmits = {
  (e: 'uuidChanged', value: string | null): void
  (e: 'path', value: FolderShortInfo[]): void
}
//#endregion API компонента

