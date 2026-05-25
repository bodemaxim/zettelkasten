import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@/api/supabaseClient'
import { useStore } from '@/use-store'
import type { QuizEvent, QuizEventEditable, QuizEventsRequest, ResponseWithCount } from './types'

const { setErrorMessage } = useStore()

type QuizEventRow = Omit<QuizEvent, 'card_title'> & {
  card: { title: string } | { title: string }[] | null
}

const mapQuizEvents = (rows: QuizEventRow[] | null): QuizEvent[] =>
  (rows ?? []).map((row) => {
    const card = Array.isArray(row.card) ? row.card[0] : row.card
    const { card: _card, ...event } = row

    return {
      ...event,
      card_title: card?.title ?? null
    }
  })

export const getQuizEvents = async (
  request: QuizEventsRequest
): Promise<ResponseWithCount<QuizEvent[]>> => {
  let data: QuizEventRow[] | null = null
  let count: number | null = null
  let error: PostgrestError | null = null

  const { pagination, sorting, userId, cardId } = request

  let query = supabase
    .from('quiz_events')
    .select('*, card:cards(title)', { count: 'exact', head: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  if (cardId) {
    query = query.eq('card_id', cardId)
  }

  if (sorting?.field) {
    query = query.order(sorting.field, { ascending: sorting.order })
  }

  if (pagination) {
    query = query.range(pagination.from, pagination.to)
    if (!sorting) query = query.order('created_at', { ascending: false })
  }

  ;({ data, error, count } = await query)

  if (error) {
    setErrorMessage({
      customText: 'Ошибка загрузки событий квиза',
      message: error.message
    })
    return {
      data: [],
      count: 0
    }
  }

  return {
    data: mapQuizEvents(data),
    count: count || 0
  }
}

export const createQuizEvent = async (newQuizEvent: QuizEventEditable): Promise<QuizEvent> => {
  const { data, error } = await supabase
    .from('quiz_events')
    .insert([{ ...newQuizEvent }])
    .select()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка создания события квиза',
      message: error.message
    })

    throw error
  }

  return { ...data[0], card_title: null }
}
