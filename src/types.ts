import {type RichTextItemResponse} from '@notionhq/client'

type Event = {
  date: {
    start: string
    end: string | null
    time_zone: string
  }
  title: RichTextItemResponse
}

type Book = {
  title: RichTextItemResponse
}

export type ReadingSession = {
  book: Book
  event: Event
  session: Event
}

export type LibraryCard = {
  reader: RichTextItemResponse
  booksRead: ReadingSession[]
}

export type EventLibraryCard = {
  reader: RichTextItemResponse
  event: Event
  booksRead: ReadingSession[]
  memberSince: string
}
