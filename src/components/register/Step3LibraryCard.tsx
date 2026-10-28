import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { formatDate } from './utils'
import { fetchAvailability, fetchFeedbackLink, type ReadBook } from './api'
import { firstName } from './shareImage'
import { readBookTicket, TicketList, useShareImage, type Ticket, type TicketState } from './LibraryCardTickets'
import type { Session, Registration } from './api'

type Props = {
  eventId: string
  readerId: string
  readerName: string
  eventDate: string
  sessions: Session[]
  registrations: Registration[]
  onBack: () => void
}

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   header fades in
 *  150ms   tickets drop in from y:24, settling at a slight tilt (staggered 90ms)
 *  600ms   actions fade in
 * ───────────────────────────────────────────────────────── */

export default function Step3LibraryCard({ eventId, readerId, readerName, eventDate, sessions, registrations, onBack }: Props) {
  const prefersReducedMotion = useReducedMotion()

  // Keep sessions fresh so tickets move through up next / on now / read as the
  // day goes on. Polling stops once every session has closed.
  const [eventOver, setEventOver] = useState(false)
  const { data } = useQuery({
    queryKey: ['availability', eventId, readerId],
    queryFn: () => fetchAvailability(eventId, readerId),
    enabled: Boolean(eventId && readerId),
    refetchInterval: eventOver ? false : 60_000,
  })
  const liveSessions = data?.sessions ?? sessions
  const liveRegistrations = data?.myRegistrations ?? registrations
  const allClosed = liveSessions.length > 0 && liveSessions.every(s => !s.registrationOpen)
  useEffect(() => setEventOver(allClosed), [allClosed])

  // After the event: tracked feedback link and the books they actually read
  // (the server skips cancelled books).
  const [feedbackUrl, setFeedbackUrl] = useState<string | null>(null)
  const [readBooks, setReadBooks] = useState<ReadBook[]>([])
  useEffect(() => {
    if (!readerId || !allClosed) return
    fetchFeedbackLink(readerId)
      .then(({ url, books }) => {
        setFeedbackUrl(url)
        setReadBooks(books)
      })
      .catch(() => {})
  }, [readerId, allClosed])

  const tickets = useMemo<Ticket[]>(() => {
    if (feedbackUrl && readBooks.length) {
      return readBooks.map(readBookTicket)
    }
    const nextIdx = liveSessions.findIndex(s => s.registrationOpen)
    const nowIdx = (nextIdx === -1 ? liveSessions.length : nextIdx) - 1
    return liveRegistrations.flatMap(reg => {
      const idx = liveSessions.findIndex(s => s.id === reg.sessionId)
      const session = liveSessions[idx]
      const book = session?.books?.find(b => b.bookSessionId === reg.bookSessionId)
      if (!session || !book) return []
      const state: TicketState = allClosed ? 'done'
        : idx === nextIdx ? 'next'
        : idx === nowIdx ? 'now'
        : idx < nowIdx ? 'read'
        : 'upcoming'
      return [{
        sessionNo: session.name.match(/\d+/)?.[0] ?? '',
        time: session.startTime,
        title: book.title,
        tableNo: String(book.tableNo || session.tableNo || ''),
        state,
      }]
    }).sort((a, b) => Number(a.sessionNo) - Number(b.sessionNo))
  }, [feedbackUrl, readBooks, liveSessions, liveRegistrations, allClosed])

  const dateLabel = eventDate ? formatDate(eventDate) : formatDate(new Date())
  const name = firstName(readerName)

  const shareImage = useShareImage(readerName, dateLabel, tickets, Boolean(feedbackUrl))

  const anyOpen = liveSessions.some(s => s.registrationOpen)

  return (
    <div className="step-inner tickets-page">
      <motion.header
        className="tickets-header"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="tickets-eyebrow">Living Stories · {dateLabel}</p>
        <h1 className="tickets-headline">{feedbackUrl ? `${name} was there.` : `${name}'s library card`}</h1>
      </motion.header>

      {tickets.length > 0 ? (
        <TicketList tickets={tickets} />
      ) : (
        <p className="see-you-msg tickets-empty">You haven't picked any books yet.</p>
      )}

      {feedbackUrl && tickets.length > 0 && (
        <p className="tickets-tally">
          {tickets.length} human book{tickets.length === 1 ? '' : 's'}, read across a table.
        </p>
      )}

      <motion.div
        className="below-card"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {feedbackUrl ? (
          <>
            <p className="see-you-msg">Your books would love to hear what stayed with you.</p>
            <a className="view-card-btn feedback-btn" href={feedbackUrl} target="_blank" rel="noopener noreferrer">
              Leave a note for your books
            </a>
            <button className="share-btn" type="button" onClick={shareImage.share} disabled={shareImage.sharing || !shareImage.ready}>
              {shareImage.sharing ? 'Opening…' : 'Share or save your library card'}
            </button>
          </>
        ) : (
          <>
            {tickets.length > 0 && <p className="see-you-msg">Find a Volunteer to guide you to your table!</p>}
            {anyOpen && (
              <button className="back-link" type="button" onClick={onBack}>
                &larr; Select Different Books
              </button>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
