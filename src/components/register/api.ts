const API_BASE = 'https://kamalnrf--dee1179407c611f19da142dde27851f2.web.val.run'

export type Book = {
  bookSessionId: string
  bookId: string
  title: string
  authorName: string
  synopsis: string
  maxSlots: number
  registeredCount: number
  slotsLeft: number
  isRegistered: boolean
  tableNo: string | null
}

export type Session = {
  id: string
  name: string
  startTime: string
  endTime: string
  tableNo: string
  registrationOpen: boolean
  books: Book[]
}

export type Registration = {
  sessionId: string
  bookSessionId: string
}

export type ActiveEvent = {
  id: string
  name: string
  date: string
}

export type AvailabilityData = {
  sessions: Session[]
  myRegistrations: Registration[]
}

export async function registerReader(name: string, email: string): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/reader`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Registration failed')
  }
  return res.json()
}

export async function fetchActiveEvent(): Promise<ActiveEvent> {
  const res = await fetch(`${API_BASE}/api/events/active`)
  if (!res.ok) throw new Error('No active event right now')
  return res.json()
}

export async function fetchAvailability(eventId: string, readerId: string): Promise<AvailabilityData> {
  const res = await fetch(`${API_BASE}/api/events/${eventId}/availability?readerId=${readerId}`)
  if (!res.ok) throw new Error('Failed to load')
  return res.json()
}

export async function registerForBook(readerId: string, bookSessionId: string, sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readerId, bookSessionId, sessionId }),
  })
  if (res.status === 409) throw new Error('CONFLICT')
  if (!res.ok) throw new Error('Registration failed')
}

export async function unregisterFromBook(readerId: string, sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readerId, sessionId }),
  })
  if (!res.ok) throw new Error('Failed to unregister')
}
