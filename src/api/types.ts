export type CardShortInfo = {
  uuid: string
  title: string
}

export type Card = CardShortInfo & {
  created_at: string
  text: string
  links: CardShortInfo[]
  type: 'definition' | 'article'
}

export type CardEditable = Omit<Card, 'uuid' | 'created_at'>
