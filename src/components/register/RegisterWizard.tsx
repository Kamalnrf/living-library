import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import './register.css'
import ProgressDots from './ProgressDots'
import Toast from './Toast'
import Step1Registration from './Step1Registration'
import Step2BookBrowser from './Step2BookBrowser'
import Step3LibraryCard from './Step3LibraryCard'
import { registerReader, fetchActiveEvent } from './api'
import type { Session, Registration } from './api'

type ToastState = {
  message: string
  isError: boolean
  visible: boolean
}

const stepTransition = {
  duration: 0.25,
  ease: [0.25, 0.46, 0.45, 0.94],
}

export default function RegisterWizard() {
  const [step, setStep] = useState(1)
  const [readerId, setReaderId] = useState('')
  const [readerName, setReaderName] = useState('')
  const [eventId, setEventId] = useState('')
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [finalSessions, setFinalSessions] = useState<Session[]>([])
  const [finalRegistrations, setFinalRegistrations] = useState<Registration[]>([])
  const [toast, setToast] = useState<ToastState>({ message: '', isError: false, visible: false })

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

      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />
      <div className="bg-blob blob-4" />
      <div className="bg-blob blob-5" />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.section
            key={step}
            className="step active"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={stepTransition}
          >
            <Step1Registration onSubmit={handleStep1Submit} />
          </motion.section>
        )}

        {step === 2 && (
          <motion.section
            key={step}
            className="step active"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={stepTransition}
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={stepTransition}
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
