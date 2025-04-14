import { supabase } from '@/api/supabaseClient'
import type { Card, CardMinimal, CardEditable } from './types'

export const getAllCards = async () => {
  const { error, data } = await supabase.from('cards').select('*')

  if (error) {
    console.error('Error fetching definitions:', error)
    return null
  }

  return data
}

export const getAllDefinitions = async (): Promise<Card[]> => {
  const { data, error } = await supabase.from('cards').select('*').eq('type', 'definition')

  if (error) {
    console.error('Error fetching definitions:', error)
    return []
  }

  return data
}

export const getCardTitles = async (): Promise<CardMinimal[]> => {
  const { data, error } = await supabase.from('cards').select('uuid, title')

  if (error) {
    console.error('Error fetching card titles:', error)
    return []
  }

  return data
}

export const createCard = async (newCard: CardEditable) => {
  await supabase
    .from('cards')
    .insert([{ ...newCard }])
    .select()
}

export const updateCard = async (card: Card): Promise<void> => {
  const { error } = await supabase
    .from('cards')
    .update({
      title: card.title,
      text: card.text,
      links: card.links,
      type: card.type,
    })
    .eq('uuid', card.uuid)

  if (error) {
    console.error('Error updating card:', error)
    throw error
  }
}

export const getCardByUuid = async (uuid: string): Promise<Card | null> => {
  const { data, error } = await supabase.from('cards').select('*').eq('uuid', uuid).single()

  if (error) {
    console.error('Error fetching card by UUID:', error)
    return null
  }

  return data
}

export const deleteCardByUuid = async (uuid: string): Promise<void> => {
  const { error } = await supabase.from('cards').delete().eq('uuid', uuid)
}
