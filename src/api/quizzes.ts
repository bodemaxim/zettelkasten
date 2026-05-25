import { createCard } from '@/api/cards'
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
  const card = await createCard(cardFields)

  const { data, error } = await supabase
    .from('quizzes')
    .insert([{ card_id: card.uuid, priority_rating }])
    .select('*, card:cards(*)')

  if (error) {
    setErrorMessage({
      customText: 'Ошибка создания квиза',
      message: error.message
    })

    throw error
  }

  return data[0]
}

