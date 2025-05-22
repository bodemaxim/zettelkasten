import { supabase } from '@/api/supabaseClient'
import { useStore } from '@/use-store'
import type { Card, CardShortInfo, CardEditable } from './types'

const { setErrorMessage } = useStore()

export const getCardsShortInfo = async (): Promise<CardShortInfo[]> => {
  const { data, error } = await supabase.from('cards').select('uuid, title')

  if (error) {
    setErrorMessage({
      customText: 'Ошибка загрузки сокращенной информации карточек',
      message: error.message
    })
    return []
  }

  return data
}

export const getAllCards = async () => {
  const { error, data } = await supabase.from('cards').select('*')

  if (error) {
    setErrorMessage({
      customText: 'Ошибка загрузки карточек',
      message: error.message
    })
    return null
  }

  return data
}

export const getAllDefinitions = async (): Promise<Card[]> => {
  const { data, error } = await supabase.from('cards').select('*').eq('type', 'definition')

  if (error) {
    setErrorMessage({
      customText: 'Ошибка загрузки определений',
      message: error.message
    })

    return []
  }

  return data
}

export const createCard = async (newCard: CardEditable): Promise<Card> => {
  const { data, error } = await supabase
    .from('cards')
    .insert([{ ...newCard }])
    .select()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка создания карточки',
      message: error.message
    })

    throw error
  }

  return data[0]
}

export const updateCard = async (card: Card): Promise<void> => {
  const { error } = await supabase
    .from('cards')
    .update({
      title: card.title,
      text: card.text,
      links: card.links,
      type: card.type
    })
    .eq('uuid', card.uuid)

  if (error) {
    setErrorMessage({
      customText: 'Ошибка обновления карточки',
      message: error.message
    })

    throw error
  }
}

export const updateCards = async (cards: Card[]): Promise<void> => {
  await Promise.all(
    cards.map(async (card) => {
      const { error } = await supabase
        .from('cards')
        .update({
          title: card.title,
          text: card.text,
          links: card.links,
          type: card.type
        })
        .eq('uuid', card.uuid)

      if (error) {
        setErrorMessage({
          customText: 'Ошибка обновления карточек',
          message: error.message
        })

        throw error
      }
    })
  )
}

export const getCardsByUuid = async (uuids: string[]): Promise<Card[]> => {
  if (uuids.length === 0) {
    return []
  }

  const { data, error } = await supabase.from('cards').select('*').in('uuid', uuids)

  if (error) {
    setErrorMessage({
      customText: 'Ошибка получения карточек по UUID',
      message: error.message
    })

    return []
  }

  return data || []
}

export const getCardByUuid = async (uuid: string): Promise<Card | null> => {
  const { data, error } = await supabase.from('cards').select('*').eq('uuid', uuid).single()

  if (error) {
    setErrorMessage({
      customText: 'Ошибка получения карточки',
      message: error.message
    })

    return null
  }

  return data
}

export const deleteCardByUuid = async (uuid: string): Promise<void> => {
  const { error } = await supabase.from('cards').delete().eq('uuid', uuid)

  if (error) {
    setErrorMessage({
      customText: 'Ошибка удаления карточки',
      message: error.message
    })
  }
}
