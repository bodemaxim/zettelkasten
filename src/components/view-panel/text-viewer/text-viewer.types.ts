//#region API компонента
export type TextViewerModel = string

export type TextViewerEmits = {
  (e: 'clickOnLink', uuid: string): void
}
//#endregion API компонента

