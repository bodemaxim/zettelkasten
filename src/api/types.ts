export type CardShortInfo = {
  uuid: string
  title: string
}

export type Card = CardShortInfo & {
  createdAt: string
  text: string
  links: CardShortInfo[]
  type: 'definition' | 'article' | 'quiz'
  folders: string //приходит массив JSON в формате string
}

export type CardEditable = Omit<Card, 'uuid'>

export type FolderShortInfo = {
  uuid: string
  name: string
}

export type Folder = FolderShortInfo & {
  createdAt: string
  description: string
  defaultDisplay: string
  path: string[]
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
  type?: Card['type']
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

export type DefaultFolderDisplay = 'diary' | 'list' | 'dictionary'

export type FolderEditable = {
  name: string
  createdAt: Date | null
  description: string
  defaultDisplay: DefaultFolderDisplay
  path: string[]
}

export type CardPath = {
  uuid: string
  folders: string //json с массивом юидов
}

export type QuizShortInfo = {
  uuid: string
  card_id: string
  title: string
  study_points: number
}

export type QuizzesShortInfoRequest = {
  pagination?: Pagination
  sorting?: Sorting
  folderUuid?: string
}

export type QuizEditable = CardEditable & {
  study_points: number
  task: string
  prefilled_answer: string
}

export type Quiz = {
  uuid: string
  created_at: string
  card_id: string
  /** Задание */
  task: string
  /** Часть ответа на квиз, сразу вписанная за пользователя */
  prefilled_answer: string;
  /** Наградные очки, присуждаемые за правильное выполнение квиза */
  study_points: number
  card: Card
}

export type QuizGrade = 'poor' | 'flawed' | 'excellent'

export type QuizEvent = {
  id: string
  created_at: string
  start_time: string | null
  end_time: string | null
  duration: number | null
  grade: QuizGrade | null
  card_id: string | null
  card_title: string | null
  user_id: string | null
}

export type QuizEventEditable = Omit<QuizEvent, 'id' | 'created_at' | 'card_title'>

export type QuizEventsRequest = {
  pagination?: Pagination
  sorting?: Sorting
  userId?: string
  cardId?: string
}

