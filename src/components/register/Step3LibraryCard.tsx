import { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { formatDate, formatMonthYear, generateCelebrationBlob, PALETTE } from './utils'
import type { Session, Registration } from './api'

type Props = {
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

export default function Step3LibraryCard({ readerName, eventName, eventDate, sessions, registrations, onBack }: Props) {
  const prefersReducedMotion = useReducedMotion()

  const books = useMemo(() => {
    return registrations.map(reg => {
      const session = sessions.find(s => s.id === reg.sessionId)
      const book = session?.books?.find(b => b.bookSessionId === reg.bookSessionId)
      return { title: book?.title || '', sessionName: session?.name || '' }
    }).filter(b => b.title)
  }, [sessions, registrations])

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
          margin: "auto 0"
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
        <table>
          <thead>
            <tr><th>Book Title</th><th>Session</th></tr>
          </thead>
          <tbody>
            {books.map((b, i) => (
              <motion.tr
                key={i}
                initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 28, delay: 0.7 + i * 0.1 }}
              >
                <td>{b.title}</td><td>{b.sessionName}</td>
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
        <p className="see-you-msg">Find a Volunteer to guide you!</p>
        <button className="back-link" type="button" onClick={onBack}>
          &larr; Select Different Books
        </button>
      </motion.div>
    </div>
  )
}
