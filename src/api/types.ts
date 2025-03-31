export type CardMinimal = {
  uuid: string
  title: string
}

export type Card = CardMinimal & {
  created_at: string
  text: string
  links: string[]
}

export type NewCard = {
  title: string
  text: string
  links: string[]
}
