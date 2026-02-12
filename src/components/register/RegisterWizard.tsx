import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import './register.css'
import ProgressDots from './ProgressDots'
import Toast from './Toast'
import Step1Registration from './Step1Registration'
import Step2BookBrowser from './Step2BookBrowser'
import Step3LibraryCard from './Step3LibraryCard'
import { registerReader, fetchActiveEvent } from './api'
import type { Session, Registration } from './api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type ToastState = {
  message: string
  isError: boolean
  visible: boolean
}

function RegisterWizardComponent() {
  const [step, setStep] = useState(1)
  const [readerId, setReaderId] = useState('')
  const [readerName, setReaderName] = useState('')
  const [eventId, setEventId] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [finalSessions, setFinalSessions] = useState<Session[]>([])
  const [finalRegistrations, setFinalRegistrations] = useState<Registration[]>([])
  const [toast, setToast] = useState<ToastState>({ message: '', isError: false, visible: false })

  useEffect(() => {
    const savedStep = localStorage.getItem('wizard_step')
    if (savedStep) setStep(parseInt(savedStep, 10))

    const savedReaderId = localStorage.getItem('reader_id')
    if (savedReaderId) setReaderId(savedReaderId)

    const savedReaderName = localStorage.getItem('reader_name')
    if (savedReaderName) setReaderName(savedReaderName)

    const savedEventId = localStorage.getItem('event_id')
    if (savedEventId) setEventId(savedEventId)

    const savedEventName = localStorage.getItem('event_name')
    if (savedEventName) setEventName(savedEventName)

    const savedEventDate = localStorage.getItem('event_date')
    if (savedEventDate) setEventDate(savedEventDate)

    const savedSessions = localStorage.getItem('final_sessions')
    if (savedSessions) setFinalSessions(JSON.parse(savedSessions))

    const savedRegistrations = localStorage.getItem('final_registrations')
    if (savedRegistrations) setFinalRegistrations(JSON.parse(savedRegistrations))
  }, [])

  useEffect(() => {
    localStorage.setItem('wizard_step', step.toString())
  }, [step])

  useEffect(() => {
    localStorage.setItem('reader_id', readerId)
  }, [readerId])

  useEffect(() => {
    localStorage.setItem('reader_name', readerName)
  }, [readerName])

  useEffect(() => {
    localStorage.setItem('event_id', eventId)
  }, [eventId])

  useEffect(() => {
    localStorage.setItem('event_name', eventName)
  }, [eventName])

  useEffect(() => {
    localStorage.setItem('event_date', eventDate)
  }, [eventDate])

  useEffect(() => {
    localStorage.setItem('final_sessions', JSON.stringify(finalSessions))
  }, [finalSessions])

  useEffect(() => {
    localStorage.setItem('final_registrations', JSON.stringify(finalRegistrations))
  }, [finalRegistrations])

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ message, isError, visible: true })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }))
  }, [])

  const goToStep = useCallback((n: number) => {
    setStep(n)
    window.scrollTo(0, 0)
  }, [])

  const handleStep1Submit = useCallback(async (name: string, email: string) => {
    try {
      const reader = await registerReader(name, email)
      setReaderId(reader.id)
      setReaderName(name)

      const event = await fetchActiveEvent()
      setEventId(event.id)
      setEventName(event.name || '')
      setEventDate(event.date || '')

      goToStep(2)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      showToast(message, true)
      throw err
    }
  }, [goToStep, showToast])

  const handleViewCard = useCallback((sessions: Session[], registrations: Registration[]) => {
    setFinalSessions(sessions)
    setFinalRegistrations(registrations)
    goToStep(3)
  }, [goToStep])

  return (
    <>
      <ProgressDots currentStep={step} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.section
            key={step}
            className="step active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Step1Registration onSubmit={handleStep1Submit} />
          </motion.section>
        )}

        {step === 2 && (
          <motion.section
            key={step}
            className="step active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Step2BookBrowser
              eventId={eventId}
              eventName={eventName}
              eventDate={eventDate}
              readerId={readerId}
              onBack={() => goToStep(1)}
              onViewCard={handleViewCard}
              onToast={showToast}
            />
          </motion.section>
        )}

        {step === 3 && (
          <motion.section
            key={step}
            className="step active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Step3LibraryCard
              readerName={readerName}
              eventName={eventName}
              eventDate={eventDate}
              sessions={finalSessions}
              registrations={finalRegistrations}
              onBack={() => goToStep(2)}
            />
          </motion.section>
        )}
      </AnimatePresence>

      <Toast message={toast.message} isError={toast.isError} visible={toast.visible} onHide={hideToast} />
    </>
  )
}

export default function RegisterWizard() {
  const client = new QueryClient()

  return <QueryClientProvider client={client}>
    <RegisterWizardComponent />
  </QueryClientProvider>
}
