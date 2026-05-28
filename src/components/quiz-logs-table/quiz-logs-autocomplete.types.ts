import type { CardShortInfo } from '@/types'

//#region API компонента
export type QuizLogsAutocompleteEmits = {
  (e: 'selected', value: CardShortInfo | null): void
}
//#endregion API компонента

