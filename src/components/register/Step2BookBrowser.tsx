import { useCallback, useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import BookCard from './BookCard'
import { formatDate, formatTime } from './utils'
import { fetchAvailability, registerForBook, unregisterFromBook } from './api'
import type { Session, Registration, AvailabilityData } from './api'
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
    refetchInterval: 2000,
    staleTime: 0,
  })

  const sessions = data?.sessions || []
  const myRegistrations = data?.myRegistrations || []

  useEffect(() => {
    if (sessions.length > 0 && !sessions[activeTab]?.registrationOpen) {
      const firstOpen = sessions.findIndex(s => s.registrationOpen)
      if (firstOpen !== -1 && firstOpen !== activeTab) {
        setActiveTab(firstOpen)
      }
    }
  }, [sessions, activeTab])

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
    onMutate: async ({ sessionId, bookSessionId, isCurrentlyRegistered }) => {
      const queryKey = ['availability', eventId, readerId]

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData<AvailabilityData>(queryKey)

      if (previousData) {
        // Optimistically update myRegistrations
        const newRegistrations = isCurrentlyRegistered
          ? // Unregistering: remove this registration
            previousData.myRegistrations.filter(r => r.sessionId !== sessionId)
          : // Registering: remove any existing registration for this session, add new one
            [
              ...previousData.myRegistrations.filter(r => r.sessionId !== sessionId),
              { sessionId, bookSessionId }
            ]

        // Optimistically update sessions (book.isRegistered and book.slotsLeft)
        const newSessions = previousData.sessions.map(session => {
          if (session.id !== sessionId) return session

          return {
            ...session,
            books: session.books.map(book => {
              if (isCurrentlyRegistered) {
                // Unregistering: only update the book being unregistered
                if (book.bookSessionId === bookSessionId) {
                  return {
                    ...book,
                    isRegistered: false,
                    slotsLeft: book.slotsLeft + 1,
                  }
                }
              } else {
                // Registering: update the target book and clear any other registered book in this session
                if (book.bookSessionId === bookSessionId) {
                  return {
                    ...book,
                    isRegistered: true,
                    slotsLeft: Math.max(0, book.slotsLeft - 1),
                  }
                } else if (book.isRegistered) {
                  // Another book was registered in this session, unregister it
                  return {
                    ...book,
                    isRegistered: false,
                    slotsLeft: book.slotsLeft + 1,
                  }
                }
              }
              return book
            }),
          }
        })

        queryClient.setQueryData<AvailabilityData>(queryKey, {
          sessions: newSessions,
          myRegistrations: newRegistrations,
        })
      }

      return { previousData }
    },
    onError: (err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['availability', eventId, readerId], context.previousData)
      }

      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message === 'CONFLICT') {
        onToast('This book just filled up', true)
        queryClient.invalidateQueries({ queryKey: ['availability', eventId, readerId] })
      } else {
        onToast(message, true)
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['availability', eventId, readerId] })
    },
  })

  const registeredSessionIds = useMemo(
    () => new Set(myRegistrations.map(r => r.sessionId)),
    [myRegistrations]
  )

  const registeredBookIds = useMemo(() => {
    const ids = new Set<string>()
    if (!sessions || !myRegistrations) return ids

    for (const reg of myRegistrations) {
      const session = sessions.find(s => s.id === reg.sessionId)
      if (session) {
        const book = session.books.find(b => b.bookSessionId === reg.bookSessionId)
        if (book) {
          ids.add(book.bookId)
        }
      }
    }
    return ids
  }, [sessions, myRegistrations])

  const activeSession = sessions[activeTab]

  const filteredBooks = useMemo(() => {
    if (!activeSession) return []
    let books = [...(activeSession.books || [])]

    // Sort by tableNo
    books.sort((a, b) => {
      const tA = a.tableNo
      const tB = b.tableNo
      if (tA === tB) return 0
      if (!tA) return 1
      if (!tB) return -1

      const nA = parseInt(tA, 10)
      const nB = parseInt(tB, 10)
      if (!isNaN(nA) && !isNaN(nB)) {
        return nA - nB
      }
      return tA.localeCompare(tB)
    })

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

    const session = sessions.find(s => s.id === sessionId)
    if (session && !session.registrationOpen) {
      onToast('Registration is closed for this session', true)
      return
    }

    const existing = myRegistrations.find(r => r.sessionId === sessionId)
    const isCurrentlyRegistered = !!(existing && existing.bookSessionId === bookSessionId)

    if (!isCurrentlyRegistered) {
      const session = sessions.find(s => s.id === sessionId)
      const book = session?.books.find(b => b.bookSessionId === bookSessionId)

      if (book && registeredBookIds.has(book.bookId)) {
        onToast("You can't register for the same book twice", true)
        return
      }
    }

    toggleMutation.mutate({ sessionId, bookSessionId, isCurrentlyRegistered })
  }, [toggleMutation, myRegistrations, sessions, registeredBookIds, onToast])

  const selectedCount = registeredSessionIds.size

  return (
    <div className="step-inner step-2-inner">
      <div style={{
        alignSelf: 'flex-start'
      }}>
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
                const isOpen = session.registrationOpen
                return (
                  <motion.button
                    key={session.id}
                    role="tab"
                    aria-selected={i === activeTab}
                    className={`session-tab ${i === activeTab ? 'active' : ''} ${!isOpen ? 'disabled' : ''}`}
                    onClick={() => {
                      if (isOpen) {
                        setActiveTab(i)
                        setSearch('')
                      }
                    }}
                    type="button"
                    whileTap={isOpen ? { scale: 0.97 } : undefined}
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
                placeholder="Search books…"
                value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div key={`${activeTab}-${search}`} className="book-list" role="tabpanel">
            {!activeSession?.registrationOpen ? (
              <p className="empty-msg">Registration is closed for this session.</p>
            ) : filteredBooks.length === 0 ? (
              <p className="empty-msg">
                {search ? 'No books match your search' : 'No books in this session'}
              </p>
            ) : (
              filteredBooks.map(book => (
                <BookCard
                  key={book.bookSessionId}
                  book={book}
                  isDisabled={registeredBookIds.has(book.bookId) && !book.isRegistered}
                  onToggle={() => handleToggle(activeSession.id, book.bookSessionId)}
                />
              ))
            )}
          </div>
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
