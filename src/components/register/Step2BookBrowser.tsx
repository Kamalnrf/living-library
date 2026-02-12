import { useCallback, useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import BookCard from './BookCard'
import { formatDate, formatTime } from './utils'
import { fetchAvailability, registerForBook, unregisterFromBook } from './api'
import type { Session, Registration } from './api'
import { SearchIcon, ArrowLeft, CircleCheck } from 'lucide-react'

type Props = {
  eventId: string
  eventName: string
  eventDate: string
  readerId: string
  onBack: () => void
  onViewCard: (sessions: Session[], registrations: Registration[]) => void
  onToast: (msg: string, isError?: boolean) => void
}

const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const

export default function Step2BookBrowser({ eventId, eventName, eventDate, readerId, onBack, onViewCard, onToast }: Props) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['availability', eventId, readerId],
    queryFn: () => fetchAvailability(eventId, readerId),
    refetchInterval: 3000,
    staleTime: 0,
  })

  const sessions = data?.sessions || []
  const myRegistrations = data?.myRegistrations || []

  const toggleMutation = useMutation({
    mutationFn: async ({ sessionId, bookSessionId, isCurrentlyRegistered }: {
      sessionId: string
      bookSessionId: string
      isCurrentlyRegistered: boolean
    }) => {
      if (isCurrentlyRegistered) {
        await unregisterFromBook(readerId, sessionId)
      } else {
        await registerForBook(readerId, bookSessionId, sessionId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', eventId, readerId] })
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message === 'CONFLICT') {
        onToast('This book just filled up', true)
        queryClient.invalidateQueries({ queryKey: ['availability', eventId, readerId] })
      } else {
        onToast(message, true)
      }
    },
  })

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

  const handleToggle = useCallback((sessionId: string, bookSessionId: string) => {
    if (toggleMutation.isPending) return

    const existing = myRegistrations.find(r => r.sessionId === sessionId)
    const isCurrentlyRegistered = !!(existing && existing.bookSessionId === bookSessionId)

    toggleMutation.mutate({ sessionId, bookSessionId, isCurrentlyRegistered })
  }, [toggleMutation.isPending, myRegistrations])

  const selectedCount = registeredSessionIds.size

  return (
    <div className="step-inner">
      <div>
        <h1>{eventName}</h1>
        <span className="event-date">{eventDate ? formatDate(eventDate) : ''}</span>
      </div>

      {isLoading ? (
        <p className="loading-msg" suppressHydrationWarning>Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="empty-msg">No sessions available yet.</p>
      ) : (
            <>
          <div className='sessions-header'>
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
                    style={{ position: 'relative', overflow: 'hidden', zIndex: 1 }}
                  >
                    <div>
                      <p className="tab-name" style={{ position: 'relative', zIndex: 1 }}>{session.name || `Session ${i + 1}`}</p>
                      <p className="tab-time" style={{ position: 'relative', zIndex: 1 }}>{time}</p>
                    </div>
                    {isRegistered && <div style={{paddingLeft: 10}}><CircleCheck color='green' /></div>}
                  </motion.button>
                )
              })}
            </div>

            <div className="book-search">
              <SearchIcon size="16" />
              <input
                type="text"
                placeholder="Search books or authors…"
                value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${search}`}
              className="book-list"
              role="tabpanel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: easeOutQuad }}
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
