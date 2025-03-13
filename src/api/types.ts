export interface Card {
  uuid: string | null,
  createdAt: string,
  title: string,
  text: string,
  links: number[];
}