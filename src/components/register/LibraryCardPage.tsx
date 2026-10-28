import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import './register.css'
import { formatDate } from './utils'
import { fetchCard, type CardData } from './api'
import { firstName } from './shareImage'
import { readBookTicket, TicketList, useShareImage } from './LibraryCardTickets'

/**
 * A reader's library card after the event, opened from the feedback email
 * (/card?t=<token>). Works on any device: it doesn't need the registration
 * page's saved state.
 */
export default function LibraryCardPage() {
  const prefersReducedMotion = useReducedMotion()
  const [card, setCard] = useState<CardData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('t')
    if (!token) {
      setFailed(true)
      return
    }
    fetchCard(token).then(setCard).catch(() => setFailed(true))
  }, [])

  const tickets = useMemo(() => (card?.books ?? []).map(readBookTicket), [card])
  const dateLabel = card?.eventDate ? formatDate(card.eventDate) : ''
  const shareImage = useShareImage(card?.name ?? '', dateLabel, tickets, Boolean(card))

  if (failed) {
    return (
      <div className="step-inner tickets-page">
        <p className="empty-msg">We couldn't find this library card.</p>
        <a className="back-link" href="/">Visit Living Stories Collective</a>
      </div>
    )
  }
  if (!card) return <p className="loading-msg">Loading your library card…</p>

  return (
    <div className="step-inner tickets-page">
      <motion.header
        className="tickets-header"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="tickets-eyebrow">Living Stories · {dateLabel}</p>
        <h1 className="tickets-headline">{firstName(card.name)} was there.</h1>
      </motion.header>

      {tickets.length > 0 && (
        <>
          <TicketList tickets={tickets} />
          <p className="tickets-tally">
            {tickets.length} human book{tickets.length === 1 ? '' : 's'}, read across a table.
          </p>
        </>
      )}

      <motion.div
        className="below-card"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {tickets.length > 0 && (
          <button
            className="view-card-btn"
            type="button"
            onClick={shareImage.share}
            disabled={shareImage.sharing || !shareImage.ready}
          >
            {shareImage.sharing ? 'Opening…' : 'Share or save your library card'}
          </button>
        )}
        <a className="share-btn feedback-btn" href={card.feedbackUrl} target="_blank" rel="noopener noreferrer">
          Leave a note for your books
        </a>
      </motion.div>
    </div>
  )
}
