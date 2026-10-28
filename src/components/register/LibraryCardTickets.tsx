import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { renderShareImage, shareOrDownload, type ShareBook } from './shareImage'
import type { ReadBook } from './api'

// upcoming → next (first still-open session) → now (latest closed) → read.
// Once every session has closed the event is over and tickets show no badge.
// Each book is a ticket stub on the reader's library card.
export type TicketState = 'upcoming' | 'next' | 'now' | 'read' | 'done'

export type Ticket = ShareBook & { state: TicketState }

const EYEBROW: Record<TicketState, string> = {
  upcoming: 'Admit one reader',
  next: 'Up next',
  now: 'On now',
  read: 'Admit one reader',
  done: 'Admit one reader',
}

const ANGLES = [-1.2, 0.9, -0.8, 1.1]

/** A book the reader read (from the server), as a ticket after the event. */
export function readBookTicket(b: ReadBook): Ticket {
  return {
    sessionNo: b.sessionName.match(/\d+/)?.[0] ?? '',
    time: b.startTime,
    title: b.title,
    tableNo: b.tableNo ?? '',
    state: 'done',
  }
}

export function TicketList({ tickets }: { tickets: Ticket[] }) {
  const prefersReducedMotion = useReducedMotion()
  return (
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
  )
}

/**
 * Shareable image of the tickets. It is drawn ahead of time: iOS only opens
 * the share sheet straight from a tap, so the button must not wait on rendering.
 */
export function useShareImage(readerName: string, dateLabel: string, tickets: Ticket[], enabled: boolean) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [sharing, setSharing] = useState(false)
  useEffect(() => {
    if (!enabled || !tickets.length) return
    let cancelled = false
    renderShareImage({ readerName, dateLabel, books: tickets })
      .then(b => { if (!cancelled) setBlob(b) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [enabled, tickets, readerName, dateLabel])

  async function share() {
    if (!blob) return
    setSharing(true)
    try {
      await shareOrDownload(blob, 'living-stories-library-card.png')
    } finally {
      setSharing(false)
    }
  }

  return { ready: Boolean(blob), sharing, share }
}
