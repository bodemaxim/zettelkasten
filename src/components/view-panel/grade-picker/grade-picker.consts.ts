import type { QuizGrade } from '@/types'

export const QUIZ_GRADES: { value: QuizGrade; label: string }[] = [
  { value: 'poor', label: 'Пока не усвоил' },
  { value: 'flawed', label: 'С недочетами' },
  { value: 'excellent', label: 'Отлично' }
]
