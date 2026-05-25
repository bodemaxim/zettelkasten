import type { CardEditable } from '@/types'
import type { TypeOption } from './edit-card-modal.types'

export const defaultCard: CardEditable = {
  title: '',
  createdAt: '',
  text: '',
  links: [],
  type: 'definition',
  folders: ''
}

export const typeOptionsList: TypeOption[] = [
  { value: 'definition', label: 'Определение' },
  { value: 'article', label: 'Статья' },
  { value: 'quiz', label: 'Квиз' }
]

export const defaultType: TypeOption = typeOptionsList[0]

export const defaultQuizPriorityRating = 0
