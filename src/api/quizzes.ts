import { createCard, deleteCardByUuid } from '@/api/cards'
import { getQuizEvents } from '@/api/quiz-events'
import { supabase } from '@/api/supabaseClient'
import { calculatePriorityDelta, clampPriority } from '@/use-quiz-priority'
import { useStore } from '@/use-store'
import type {
  Quiz,
  QuizEditable,
  QuizGrade,
  QuizShortInfo,
  QuizzesShortInfoRequest,
  ResponseWithCount
} from './types'

const { setErrorMessage } = useStore()

export const getQuizByUuid = async (uuid: string): Promise<Quiz | null> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, card:cards(*)')
    .eq('uuid', uuid)
    .single()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка получения квиза',
      message: error.message
    })

    return null
  }

  return data
}

export const getQuizByCardId = async (cardId: string): Promise<Quiz | null> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*, card:cards(*)')
    .eq('card_id', cardId)
    .single()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка получения квиза',
      message: error.message
    })

    return null
  }

  return normalizeQuiz(data)
}

export const deleteQuizByCardId = async (cardId: string): Promise<void> => {
  const { error } = await supabase.from('quizzes').delete().eq('card_id', cardId)

  if (error) {
    setErrorMessage({
      customText: 'Ошибка удаления квиза',
      message: error.message
    })

    throw error
  }
}

export const updateQuiz = async (
  cardId: string,
  fields: Pick<Quiz, 'task' | 'prefilled_answer'>
): Promise<void> => {
  const { error } = await supabase.from('quizzes').update(fields).eq('card_id', cardId)

  if (error) {
    setErrorMessage({
      customText: 'Ошибка обновления квиза',
      message: error.message
    })

    throw error
  }
}

export const getQuizPriorityRatingByCardId = async (
  cardId: string
): Promise<number | null> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('study_points')
    .eq('card_id', cardId)
    .single()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка получения очков квиза',
      message: error.message
    })

    return null
  }

  return data?.study_points ?? null
}

const normalizeQuiz = (quiz: Quiz & { card: Quiz['card'] | Quiz['card'][] }): Quiz => {
  const card = Array.isArray(quiz.card) ? quiz.card[0] : quiz.card
  return { ...quiz, card }
}

export const getNextQuiz = async (folderUuid?: string | null): Promise<Quiz | null> => {
  let cardsQuery = supabase.from('cards').select('uuid').eq('type', 'quiz')

  if (folderUuid) {
    cardsQuery = cardsQuery.like('folders', `%${folderUuid}%`)
  }

  const { data: cards, error: cardsError } = await cardsQuery

  if (cardsError) {
    setErrorMessage({
      customText: 'Ошибка получения карточек квизов',
      message: cardsError.message
    })

    return null
  }

  if (!cards?.length) return null

  const cardIds = cards.map((card) => card.uuid)

  const { data, error } = await supabase
    .from('quizzes')
    .select('*, card:cards(*)')
    .in('card_id', cardIds)
    .order('study_points', { ascending: true })
    .limit(1)

  if (error) {
    setErrorMessage({
      customText: 'Ошибка получения следующего квиза',
      message: error.message
    })

    return null
  }

  const quiz = data?.[0]
  return quiz ? normalizeQuiz(quiz) : null
}

export const getQuizzesShortInfo = async (
  request: QuizzesShortInfoRequest = {}
): Promise<ResponseWithCount<QuizShortInfo[]>> => {
  const { pagination, sorting, folderUuid } = request

  let cardsQuery = supabase.from('cards').select('uuid').eq('type', 'quiz')

  if (folderUuid) {
    cardsQuery = cardsQuery.like('folders', `%${folderUuid}%`)
  }

  const { data: cards, error: cardsError } = await cardsQuery

  if (cardsError) {
    setErrorMessage({
      customText: 'Ошибка получения карточек квизов',
      message: cardsError.message
    })

    return { data: [], count: 0 }
  }

  if (!cards?.length) {
    return { data: [], count: 0 }
  }

  const cardIds = cards.map((card) => card.uuid)

  let query = supabase
    .from('quizzes')
    .select('uuid, study_points, card_id, card:cards(title)', { count: 'exact', head: false })
    .in('card_id', cardIds)

  if (sorting?.field) {
    query = query.order(sorting.field, { ascending: sorting.order })
  }

  if (pagination) {
    query = query.range(pagination.from, pagination.to)
    if (!sorting) query = query.order('study_points', { ascending: true })
  } else if (!sorting) {
    query = query.order('study_points', { ascending: true })
  }

  const { data, error, count } = await query

  if (error) {
    setErrorMessage({
      customText: 'Ошибка загрузки квизов',
      message: error.message
    })

    return { data: [], count: 0 }
  }

  const quizzes = (data ?? []).map((quiz) => {
    const card = Array.isArray(quiz.card) ? quiz.card[0] : quiz.card

    return {
      uuid: quiz.uuid,
      card_id: quiz.card_id,
      title: card?.title ?? '',
      study_points: quiz.study_points
    }
  })

  return {
    data: quizzes,
    count: count || 0
  }
}

export const createQuiz = async (newQuiz: QuizEditable): Promise<Quiz> => {
  const { study_points, task, prefilled_answer, ...cardFields } = newQuiz

  const card = await createCard({ ...cardFields, type: 'quiz' })

  const { data, error } = await supabase
    .from('quizzes')
    .insert([{ card_id: card.uuid, study_points, task, prefilled_answer }])
    .select('*, card:cards(*)')

  if (error) {
    await deleteCardByUuid(card.uuid)

    setErrorMessage({
      customText: 'Ошибка создания квиза',
      message: error.message
    })

    throw error
  }

  return normalizeQuiz(data[0])
}

export const updateQuizPriorityAfterGrade = async (
  cardId: string,
  grade: QuizGrade,
  userId?: string | null
): Promise<number | null> => {
  const { data: quiz, error: fetchError } = await supabase
    .from('quizzes')
    .select('uuid, study_points')
    .eq('card_id', cardId)
    .single()

  if (fetchError) {
    setErrorMessage({
      customText: 'Ошибка получения квиза для обновления приоритета',
      message: fetchError.message
    })

    return null
  }

  const { data: events } = await getQuizEvents({
    cardId,
    userId: userId ?? undefined,
    sorting: { field: 'created_at', order: false },
    pagination: { from: 0, to: 49 }
  })

  const previousGrades = events
    .map((event) => event.grade)
    .filter((eventGrade): eventGrade is QuizGrade => eventGrade !== null)

  const currentRating = quiz.study_points ?? 0

  const priorityRating = clampPriority(
    currentRating + calculatePriorityDelta(grade, previousGrades)
  )

  const { error: updateError } = await supabase
    .from('quizzes')
    .update({ study_points: priorityRating })
    .eq('uuid', quiz.uuid)

  if (updateError) {
    setErrorMessage({
      customText: 'Ошибка обновления приоритета квиза',
      message: updateError.message
    })

    return null
  }

  return priorityRating
}

