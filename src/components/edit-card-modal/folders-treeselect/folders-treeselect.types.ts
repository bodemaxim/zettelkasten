//#region API компонента
export type FoldersTreeselectModel = string
//#endregion API компонента

export type SelectedValues = {
  [key: string]: true
}

export type ChangedValue = {
  uuid: string
  isSelected: boolean
}
