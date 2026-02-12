import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import BookCard from './BookCard'
import { formatDate, formatTime } from './utils'
import { fetchAvailability, registerForBook, unregisterFromBook } from './api'
import type { Session, Registration } from './api'

type Props = {
  eventId: string
  eventName: string
  eventDate: string
  readerId: string
  onBack: () => void
  onViewCard: (sessions: Session[], registrations: Registration[]) => void
  onToast: (msg: string, isError?: boolean) => void
}

const ArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const

export default function Step2BookBrowser({ eventId, eventName, eventDate, readerId, onBack, onViewCard, onToast }: Props) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const loadAvailability = useCallback(async () => {
    try {
      const data = await fetchAvailability(eventId, readerId)
      setSessions(data.sessions || [])
      setMyRegistrations(data.myRegistrations || [])
      setLoading(false)
    } catch {
      if (loading) setLoading(false)
    }
  }, [eventId, readerId, loading])

  useEffect(() => {
    loadAvailability()
    pollRef.current = setInterval(loadAvailability, 3000)
    return () => clearInterval(pollRef.current)
  }, [eventId, readerId])

  const registeredSessionIds = useMemo(
    () => new Set(myRegistrations.map(r => r.sessionId)),
    [myRegistrations]
  )

  const activeSession = sessions[activeTab]

  const filteredBooks = useMemo(() => {
    if (!activeSession) return []
    const books = activeSession.books || []
    if (!search.trim()) return books
    const q = search.toLowerCase()
    return books.filter(b =>
      (b.title || '').toLowerCase().includes(q) ||
      (b.authorName || '').toLowerCase().includes(q) ||
      (b.synopsis || '').toLowerCase().includes(q)
    )
  }, [activeSession, search])

  const handleToggle = useCallback(async (sessionId: string, bookSessionId: string) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const existing = myRegistrations.find(r => r.sessionId === sessionId)
    const isCurrentlyRegistered = existing && existing.bookSessionId === bookSessionId

    try {
      if (isCurrentlyRegistered) {
        await unregisterFromBook(readerId, sessionId)
      } else {
        await registerForBook(readerId, bookSessionId, sessionId)
      }
      await loadAvailability()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message === 'CONFLICT') {
        onToast('This book just filled up', true)
        await loadAvailability()
      } else {
        onToast(message, true)
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, myRegistrations, readerId, loadAvailability, onToast])

  const selectedCount = registeredSessionIds.size
  const totalBooks = activeSession?.books?.length || 0

  return (
    <div className="step-inner step-2-inner">
      <div className="event-header">
        <h1>{eventName}</h1>
        <span className="event-date">{eventDate ? formatDate(eventDate) : ''}</span>
      </div>

      {loading ? (
        <p className="loading-msg">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="empty-msg">No sessions available yet.</p>
      ) : (
        <>
          <div className="session-tabs" role="tablist">
            {sessions.map((session, i) => {
              const isRegistered = registeredSessionIds.has(session.id)
              const time = session.startTime ? formatTime(session.startTime) : ''
              return (
                <motion.button
                  key={session.id}
                  role="tab"
                  aria-selected={i === activeTab}
                  className={`session-tab ${i === activeTab ? 'active' : ''}`}
                  onClick={() => { setActiveTab(i); setSearch('') }}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {i === activeTab && (
                    <motion.div
                      layoutId="activeTab"
                      className="active-tab-indicator"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        background: 'var(--tab-active-bg, rgba(0,0,0,0.06))',
                        zIndex: 0,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="tab-name" style={{ position: 'relative', zIndex: 1 }}>{session.name || `Session ${i + 1}`}</span>
                  <span className="tab-time" style={{ position: 'relative', zIndex: 1 }}>{time}</span>
                  {isRegistered && <span className="tab-check" aria-label="registered" style={{ position: 'relative', zIndex: 1 }}>✓</span>}
                </motion.button>
              )
            })}
          </div>

          {totalBooks > 6 && (
            <div className="book-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search books or authors…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${search}`}
              className="book-list"
              role="tabpanel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: easeOutQuad as unknown as number[] }}
            >
              {filteredBooks.length === 0 ? (
                <p className="empty-msg">
                  {search ? 'No books match your search' : 'No books in this session'}
                </p>
              ) : (
                filteredBooks.map(book => (
                  <BookCard
                    key={book.bookSessionId}
                    book={book}
                    onToggle={() => handleToggle(activeSession.id, book.bookSessionId)}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      <div className="summary-bar">
        <button className="nav-btn back" type="button" aria-label="Back" onClick={onBack}>
          <ArrowLeft />
        </button>
        <span className="summary-text">
          {selectedCount > 0
            ? `${selectedCount} session${selectedCount !== 1 ? 's' : ''} registered`
            : 'Pick a book to get started'}
          {selectedCount > 0 && selectedCount < sessions.length && (
            <span className="summary-hint"> · add more anytime</span>
          )}
        </span>
        <AnimatePresence mode="wait">
          <motion.button
            key={selectedCount > 0 ? 'enabled' : 'disabled'}
            className="view-card-btn"
            disabled={selectedCount === 0}
            type="button"
            onClick={() => onViewCard(sessions, myRegistrations)}
            whileTap={selectedCount > 0 ? { scale: 0.96 } : undefined}
            initial={selectedCount > 0 ? { scale: 0.95, opacity: 0.8 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={selectedCount > 0
              ? { type: 'spring', stiffness: 400, damping: 25 }
              : { duration: 0.15 }
            }
          >
            View My Card
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  )
}
