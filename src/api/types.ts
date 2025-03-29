export type CardMinimal = {
  uuid: string
  title: string
}

export type Card = CardMinimal & {
  created_at: string
  text: string
  links: number[]
}
