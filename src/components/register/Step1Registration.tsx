import { useState, useCallback, useEffect } from 'react'
import { isValidEmail, formatMonthYear } from './utils'
import { ArrowRight } from 'lucide-react';

type Props = {
  onSubmit: (name: string, email: string) => Promise<void>
}

export default function Step1Registration({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedName = localStorage.getItem('reader_name')
    const savedEmail = localStorage.getItem('reader_email')
    if (savedName) setName(savedName)
    if (savedEmail) setEmail(savedEmail)
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return
    localStorage.setItem('reader_name', name)
  }, [name, isInitialized])

  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return
    localStorage.setItem('reader_email', email)
  }, [email, isInitialized])

  const isValid = name.trim().length > 0 && isValidEmail(email.trim())

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onSubmit(name.trim(), email.trim())
    } finally {
      setIsSubmitting(false)
    }
  }, [name, email, isValid, isSubmitting, onSubmit])

  return (
    <div className="step-inner">
      <div className="welcome-header">
        <h1>Welcome</h1>
        <p>Follow these steps to get started</p>
      </div>

      <div className="instructions">
        <div className="instruction-item">
          <span className="instruction-badge">1</span>
          <div className="instruction-content">
            <strong>Register</strong>
            <span>Enter your name and email</span>
          </div>
        </div>
        <div className="instruction-item">
          <span className="instruction-badge">2</span>
          <div className="instruction-content">
            <strong>Register</strong>
            <span>Select books for your sessions</span>
          </div>
        </div>
        <div className="instruction-item">
          <span className="instruction-badge">3</span>
          <div className="instruction-content">
            <strong>Check-in</strong>
            <span>Show your card to a volunteer at the venue</span>
          </div>
        </div>
      </div>

      <div className="form-fields">
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            placeholder="Your name"
            autoComplete="name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className='field'>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email address"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
      </div>

      <button
        className="nav-btn forward"
        disabled={!isValid || isSubmitting}
        aria-label="Continue"
        type="button"
        onClick={handleSubmit}
      >
        <ArrowRight />
      </button>
    </div>
  )
}
