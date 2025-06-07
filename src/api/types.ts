export type CardShortInfo = {
  uuid: string
  title: string
}

export type Card = CardShortInfo & {
  created_at: string
  text: string
  links: CardShortInfo[]
  type: 'definition' | 'article'
  folders: string //приходит массив JSON в формате string
}

export type CardEditable = Omit<Card, 'uuid' | 'created_at'>

export type FolderShortInfo = {
  uuid: string
  name: string
}

export type Folder = FolderShortInfo & {
  created_at: string
  description: string
  defaultDisplay: string
  path: FolderShortInfo[]
}

export type ResponseWithCount<T> = {
  data: T
  count: number
}

export type Pagination = {
  from: number
  to: number
} | null

export type Sorting = {
  field: string
  order: boolean
}

export type CardsShortInfoRequest = {
  searchQuery?: string
  pagination?: Pagination
  sorting?: Sorting
  folderUuid?: string
}
