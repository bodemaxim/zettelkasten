import type { CardShortInfo } from '@/types'

//#region API компонента
export type CardsAutocompleteEmits = {
  (e: 'updated', value: CardShortInfo): void
}
//#endregion API компонента

