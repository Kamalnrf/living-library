import { motion, AnimatePresence } from 'motion/react'
import type { Book } from './api'

type Props = {
  book: Book
  onToggle: () => void
}

export default function BookCard({ book, onToggle }: Props) {
  const slotsLeft = book.slotsLeft ?? 0
  const isFull = slotsLeft <= 0
  const isRegistered = book.isRegistered
  const fillPercent = book.maxSlots > 0
    ? Math.round(((book.maxSlots - slotsLeft) / book.maxSlots) * 100)
    : 100
  const urgency = slotsLeft > 3 ? 'available' : slotsLeft > 0 ? 'low' : 'full'

  const classes = [
    'book-row',
    isRegistered && 'registered',
    isFull && !isRegistered && 'full',
  ].filter(Boolean).join(' ')

  return (
    <motion.div
      className={classes}
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={!isFull || isRegistered ? { scale: 0.98 } : undefined}
      onClick={!isFull || isRegistered ? onToggle : undefined}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && (!isFull || isRegistered)) {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div className="book-row-top">
        <span className="book-row-title">{book.title || 'Untitled'}</span>
        <AnimatePresence>
          {isRegistered && (
            <motion.span
              className="book-row-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              Registered
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {book.synopsis && (
        <div className="book-row-synopsis">{book.synopsis}</div>
      )}
      <div className="book-row-bottom">
        <div className="book-row-slots">
          <div className="slots-bar">
            <div className={`slots-fill ${urgency}`} style={{ width: `${fillPercent}%` }} />
          </div>
          <span className={`slots-count ${urgency}`}>
            {isFull ? 'Full' : `${slotsLeft} of ${book.maxSlots} left`}
          </span>
        </div>
        <AnimatePresence>
          {!isRegistered && !isFull && (
            <motion.span
              className="book-row-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              Select
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
