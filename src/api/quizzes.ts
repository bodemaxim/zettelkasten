import { createCard, deleteCardByUuid } from '@/api/cards'
import { supabase } from '@/api/supabaseClient'
import { useStore } from '@/use-store'
import type { Quiz, QuizEditable, QuizShortInfo } from './types'

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
    .order('priority_rating', { ascending: true })
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

export const getQuizzesShortInfo = async (): Promise<QuizShortInfo[]> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('uuid, priority_rating, card:cards(title)')

  if (error) {
    setErrorMessage({
      customText: 'Ошибка загрузки квизов',
      message: error.message
    })

    return []
  }

  return (data ?? []).map((quiz) => {
    const card = Array.isArray(quiz.card) ? quiz.card[0] : quiz.card

    return {
      uuid: quiz.uuid,
      title: card?.title ?? '',
      priority_rating: quiz.priority_rating
    }
  })
}

export const createQuiz = async (newQuiz: QuizEditable): Promise<Quiz> => {
  const { priority_rating, ...cardFields } = newQuiz

  const card = await createCard({ ...cardFields, type: 'quiz' })

  const { data, error } = await supabase
    .from('quizzes')
    .insert([{ card_id: card.uuid, priority_rating, task: card.title }])
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

