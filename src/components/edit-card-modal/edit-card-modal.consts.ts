import type { CardEditable } from '@/types'
import type { TypeOption } from './edit-card-modal.types'

export const defaultCard: CardEditable = {
  title: '',
  text: '',
  links: [],
  type: 'definition'
}

export const typeOptionsList: TypeOption[] = [
  { value: 'definition', label: 'Определение' },
  { value: 'article', label: 'Статья' }
]

export const defaultType: TypeOption = typeOptionsList[0]
