//#region API компонента
export type QuizViewerEmits = {
  (e: 'clickOnLink', uuid: string): void
  (e: 'edited'): void
  (e: 'deleted'): void
}
//#endregion API компонента

