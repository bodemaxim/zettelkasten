export type CardShortInfo = {
  uuid: string
  title: string
}

export type Card = CardShortInfo & {
  createdAt: string
  text: string
  links: CardShortInfo[]
  type: 'definition' | 'article'
  folders: string //приходит массив JSON в формате string
}

export type CardEditable = Omit<Card, 'uuid' | 'createdAt'>

export type FolderShortInfo = {
  uuid: string
  name: string
}

export type Folder = FolderShortInfo & {
  createdAt: string
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

export type Profile = {
  uuid: string
  first_name: string
  last_name: string
  created_at: string
}

export type NewUser = {
  email: string
  password: string
  first_name: string
  last_name: string
}
