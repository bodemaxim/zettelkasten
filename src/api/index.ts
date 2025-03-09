import { supabase } from '@/api/supabaseClient'
import type { Card } from './types'

export const getAllCards = async () => {
  const { data } = await supabase.from('cards').select('*')

  return data
}


export const getCardTitles = async () => {
  const { data } = await supabase.from('cards').select('id,title')

  return data
}


export const createCard = async (newCard: Card) => {
  const { data, error } = await supabase
    .from('cards')
    .insert([
      {
        title: newCard.title,
        text: newCard.text,
        links: newCard.links
      },
    ])
    .select()
}




