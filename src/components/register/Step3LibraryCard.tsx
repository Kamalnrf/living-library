import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { formatDate, formatMonthYear, generateCelebrationBlob, PALETTE } from './utils'
import { fetchFeedbackLink, type ReadBook } from './api'
import { renderShareImage, shareOrDownload, type ShareBook } from './shareImage'
import type { Session, Registration } from './api'

type Props = {
  readerId: string
  readerName: string
  eventName: string
  eventDate: string
  sessions: Session[]
  registrations: Registration[]
  onBack: () => void
}

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   component mounts
 *  100ms   card slides up from y:50, rotates -3deg → 0, scales 0.95 → 1
 *  400ms   card details fade in (staggered 80ms each)
 *  700ms   table rows slide in from right (staggered 100ms)
 *  900ms   "See you at the event!" fades in
 * ───────────────────────────────────────────────────────── */

export default function Step3LibraryCard({ readerId, readerName, eventName, eventDate, sessions, registrations, onBack }: Props) {
  const prefersReducedMotion = useReducedMotion()

  // Once all sessions have closed, the card offers a link to leave feedback.
  const [feedbackUrl, setFeedbackUrl] = useState<string | null>(null)
  const [readBooks, setReadBooks] = useState<ReadBook[]>([])
  useEffect(() => {
    if (!readerId) return
    fetchFeedbackLink(readerId)
      .then(({ url, books }) => {
        setFeedbackUrl(url)
        setReadBooks(books)
      })
      .catch(() => {})
  }, [readerId])

  const books = useMemo(() => {
    return registrations.map(reg => {
      const session = sessions.find(s => s.id === reg.sessionId)
      const book = session?.books?.find(b => b.bookSessionId === reg.bookSessionId)
      return {
        title: book?.title || '',
        sessionName: session?.name || '',
        startTime: session?.startTime || '',
        tableNo: book?.tableNo || session?.tableNo || ''
      }
    }).filter(b => b.title)
  }, [sessions, registrations])

  // Shareable ticket-stub image, offered alongside the feedback link once the
  // event is over, built from the books they actually read.
  const [shareBlob, setShareBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  useEffect(() => {
    if (!feedbackUrl || !readBooks.length) return
    let cancelled = false
    const shareBooks: ShareBook[] = readBooks.map(b => ({
      sessionNo: b.sessionName.match(/\d+/)?.[0] ?? '',
      time: b.startTime,
      title: b.title,
      tableNo: b.tableNo ?? '',
    }))
    renderShareImage({
      readerName,
      dateLabel: eventDate ? formatDate(eventDate) : formatDate(new Date()),
      books: shareBooks,
    }).then(blob => {
      if (cancelled) return
      setShareBlob(blob)
      setPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(blob)
      })
    }).catch(() => {})
    return () => { cancelled = true }
  }, [feedbackUrl, readBooks, readerName, eventDate])

  async function handleShare() {
    if (!shareBlob) return
    setSharing(true)
    try {
      await shareOrDownload(shareBlob, 'living-stories-tickets.png')
    } finally {
      setSharing(false)
    }
  }

  const cardLabels = [
    { text: <>Name: <b>{readerName}</b></>, className: 'label' },
    { text: <>Member Since: {formatMonthYear(new Date())}</>, className: 'label' },
    { text: <>Event: {eventName}</>, className: 'label card-event-title' },
    { text: <>Date: {eventDate ? formatDate(eventDate) : formatDate(new Date())}</>, className: 'label' },
  ]

  return (
    <div className="step-inner">
      <motion.div
        className="card final-card"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 50, rotate: -3, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24, delay: 0.1 }}
        style={{
          marginTop: 8
        }}
      >
        <div className="card-details">
          {cardLabels.map((label, index) => (
            <motion.span
              key={index}
              className={label.className}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 28, delay: 0.4 + index * 0.08 }}
            >
              {label.text}
            </motion.span>
          ))}
        </div>
        {/* One row per book: session + time on a small typed line, the title
            handwritten underneath at full width, the table stamp on the right. */}
        <table className="card-books">
          <tbody>
            {books.map((b, i) => (
              <motion.tr
                key={i}
                initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28, delay: 0.7 + i * 0.1 }}
              >
                <td>
                  <span className="card-books__session">
                    {b.sessionName}{b.startTime && ` · ${b.startTime}`}
                  </span>
                  <span className="card-books__title">{b.title}</span>
                </td>
                <td className="card-books__stamp">
                  {b.tableNo && <span className="table-stamp">T{b.tableNo}</span>}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <motion.div
        className="below-card"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {feedbackUrl ? (
          <>
            <p className="see-you-msg">Your books would love to hear what stayed with you.</p>
            <a className="view-card-btn feedback-btn" href={feedbackUrl} target="_blank" rel="noopener noreferrer">
              Leave a note for your books
            </a>

            {previewUrl && (
              <div className="share-block">
                <img className="share-preview" src={previewUrl} alt="Your Living Stories tickets" />
                <div className="share-controls">
                  <p className="share-heading">Share your day</p>
                  <p className="share-sub">Post your tickets to your story, or save them.</p>
                  <button className="share-btn" type="button" onClick={handleShare} disabled={sharing || !shareBlob}>
                    {sharing ? 'Opening…' : 'Share or save image'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="see-you-msg">Find a Volunteer to guide you!</p>
            <button className="back-link" type="button" onClick={onBack}>
              &larr; Select Different Books
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
