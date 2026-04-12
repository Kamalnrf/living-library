import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Book } from './api'

type Props = {
  book: Book
  isDisabled?: boolean
  onToggle: () => void
}

export default function BookCard({ book, isDisabled, onToggle }: Props) {
  const [synopsisExpanded, setSynopsisExpanded] = useState(false)
  const synopsisRef = useRef<HTMLDivElement>(null)
  const slotsLeft = book.slotsLeft ?? 0
  const isFull = slotsLeft <= 0
  const isRegistered = book.isRegistered
  const fillPercent = book.maxSlots > 0
    ? Math.round(((book.maxSlots - slotsLeft) / book.maxSlots) * 100)
    : 100
  const urgency = slotsLeft > 3 ? 'available' : slotsLeft > 0 ? 'low' : 'full'
  
  const canInteract = (!isFull || isRegistered) && !isDisabled

  const classes = [
    'book-row',
    isRegistered && 'registered',
    (isFull || isDisabled) && !isRegistered && 'full',
  ].filter(Boolean).join(' ')

  return (
    <motion.div
      className={classes}
      role="button"
      tabIndex={canInteract ? 0 : -1}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={canInteract ? { scale: 0.98 } : undefined}
      onClick={canInteract ? onToggle : undefined}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && canInteract) {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div className="book-row-top">
        <span className="book-row-title">{book.title || 'Untitled'}</span>
        <div className="book-badges">
          {book.tableNo && (
            <span className="table-badge">Table {book.tableNo}</span>
          )}
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
             {isDisabled && !isRegistered && (
              <motion.span
                className="already-registered-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                Already Registered
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      {book.synopsis && (
        <div className="book-row-synopsis-wrap">
          <div
            ref={synopsisRef}
            className={`book-row-synopsis${synopsisExpanded ? ' expanded' : ''}`}
          >
            {book.synopsis}
          </div>
          <button
            type="button"
            className="synopsis-toggle"
            onClick={e => {
              e.stopPropagation()
              setSynopsisExpanded(prev => !prev)
            }}
          >
            {synopsisExpanded ? 'Show less' : 'Read more'}
          </button>
        </div>
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
