//#region API компонента
export type ViewPanelModel = string | null

export type ViewPanelEmits = {
  (e: 'deleted'): void
  (e: 'edited'): void
  (e: 'clickOnLink', uuid: string): void
}
//#endregion API компонента

