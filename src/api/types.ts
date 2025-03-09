export interface Card {
  id: number | null,
  createdAt: string,
  title: string,
  text: string,
  links: number[];
}