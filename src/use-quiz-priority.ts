import type { QuizGrade } from '@/types'

/** Наивысшее значение приоритета */
export const MAX_PRIORITY = 0

/** Наименьшее значение приоритета */
export const MIN_PRIORITY = 1000

/** Дефолтное значение приоритета */
export const DEFAULT_PRIORITY = MAX_PRIORITY

/** Изменение PRIORITY_RATING при получении плохой оценки */
export const POINTS_FOR_POOR_GRADE = -10

/** Изменение PRIORITY_RATING при получении оценки с недочетами */
export const POINTS_FOR_FLAWED_GRADE = 5

/** Изменение PRIORITY_RATING при получении отличной оценки */
export const POINTS_FOR_EXCELLENT_GRADE = 10

/** Дополнитетельные очки PRIORITY_RATING за второе отличное решение подряд */
export const REWARD_POINTS_SECOND_EXCELLENT_IN_ROW = 10

/** Дополнительные очки PRIORITY_RATING за третье отличное решение подряд */
export const REWARD_POINTS_THIRD_EXCELLENT_IN_ROW = 20

/** Штрафные очки PRIORITY_RATING за плохое решение после отличного */
export const FINE_POINTS_WORSE_AFTER_EXCELLENT = -30

export const clampPriority = (value: number): number =>
  Math.min(MIN_PRIORITY, Math.max(MAX_PRIORITY, value))

const countLeadingExcellents = (grades: QuizGrade[]): number => {
  let count = 0
  for (const grade of grades) {
    if (grade !== 'excellent') break
    count++
  }
  return count
}

/** Смещение priority_rating по оценке и предыдущим оценкам (от новых к старым). */
export const calculatePriorityDelta = (
  grade: QuizGrade,
  previousGrades: QuizGrade[]
): number => {
  let delta: number

  switch (grade) {
    case 'poor':
      delta = POINTS_FOR_POOR_GRADE
      break
    case 'flawed':
      delta = POINTS_FOR_FLAWED_GRADE
      break
    case 'excellent': {
      delta = POINTS_FOR_EXCELLENT_GRADE
      const streakLength = countLeadingExcellents(previousGrades) + 1
      if (streakLength === 2) delta += REWARD_POINTS_SECOND_EXCELLENT_IN_ROW
      if (streakLength === 3) delta += REWARD_POINTS_THIRD_EXCELLENT_IN_ROW
      break
    }
  }

  if (
    previousGrades[0] === 'excellent' &&
    (grade === 'poor' || grade === 'flawed')
  ) {
    delta += FINE_POINTS_WORSE_AFTER_EXCELLENT
  }

  return delta
}
