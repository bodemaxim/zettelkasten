//#region API компонента
export type VisibleModel = boolean

export type EditCardModalEmits = {
  (e: 'saved', uuid: string): void
}
//#endregion API компонента

export type TypeOption = {
  value: 'definition' | 'article' | 'quiz'
  label: string
}
