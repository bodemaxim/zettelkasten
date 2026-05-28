//#region API компонента
export type TextModel = string

export type TextEditorProps = {
  title?: string
  /**
   * Высота текстового поля:
   * - number: пиксели
   * - string: CSS-строка (например, "200px", "30vh")
   */
  height?: number | string
}
//#endregion API компонента

export type TableSize = '2x5' | '3x5'
