import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { formatDate } from './utils'
import { fetchAvailability, fetchFeedbackLink, type ReadBook } from './api'
import { firstName, renderShareImage, shareOrDownload, type ShareBook } from './shareImage'
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

// upcoming → next (first still-open session) → now (latest closed) → read.
// Once every session has closed the event is over and tickets show no badge.
// Each book is a ticket stub on the reader's library card.
type TicketState = 'upcoming' | 'next' | 'now' | 'read' | 'done'

type Ticket = ShareBook & { state: TicketState }

const EYEBROW: Record<TicketState, string> = {
  upcoming: 'Admit one reader',
  next: 'Up next',
  now: 'On now',
  read: 'Admit one reader',
  done: 'Admit one reader',
}

const ANGLES = [-1.2, 0.9, -0.8, 1.1]

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
      return readBooks.map(b => ({
        sessionNo: b.sessionName.match(/\d+/)?.[0] ?? '',
        time: b.startTime,
        title: b.title,
        tableNo: b.tableNo ?? '',
        state: 'done',
      }))
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

  // The share image is drawn ahead of time: iOS only opens the share sheet
  // straight from a tap, so the button must not wait on rendering.
  const [shareBlob, setShareBlob] = useState<Blob | null>(null)
  const [sharing, setSharing] = useState(false)
  useEffect(() => {
    if (!feedbackUrl || !tickets.length) return
    let cancelled = false
    renderShareImage({ readerName, dateLabel, books: tickets })
      .then(blob => { if (!cancelled) setShareBlob(blob) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [feedbackUrl, tickets, readerName, dateLabel])

  async function handleShare() {
    if (!shareBlob) return
    setSharing(true)
    try {
      await shareOrDownload(shareBlob, 'living-stories-library-card.png')
    } finally {
      setSharing(false)
    }
  }

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
        <ol className="tickets">
          {tickets.map((t, i) => (
            <motion.li
              key={`${t.sessionNo}-${t.title}`}
              className={`ticket ticket--${t.state}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: ANGLES[i % ANGLES.length] }}
              transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.15 + i * 0.09 }}
            >
              <div className="ticket__paper">
                <div className="ticket__stub">
                  <span className="ticket__label">Session</span>
                  <span className="ticket__no">{t.sessionNo}</span>
                  <span className="ticket__time">{t.time}</span>
                </div>
                <div className="ticket__body">
                  <span className="ticket__eyebrow">{EYEBROW[t.state]}</span>
                  <span className="ticket__title">{t.title}</span>
                  {t.tableNo && <span className="ticket__table">Table {t.tableNo}</span>}
                </div>
                {t.state === 'read' && <span className="ticket__punch" aria-label="Read">Read</span>}
              </div>
            </motion.li>
          ))}
        </ol>
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
            <button className="share-btn" type="button" onClick={handleShare} disabled={sharing || !shareBlob}>
              {sharing ? 'Opening…' : 'Share or save your library card'}
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
