export type CardMinimal = {
  uuid: string
  title: string
}

export type Card = CardMinimal & {
  created_at: string
  text: string
  links: CardMinimal[]
  type: 'definition' | 'article'
}

export type CardEditable = Omit<Card, 'uuid' | 'created_at'>
