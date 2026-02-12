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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedName = localStorage.getItem('reader_name')
    const savedEmail = localStorage.getItem('reader_email')
    if (savedName) setName(savedName)
    if (savedEmail) setEmail(savedEmail)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('reader_name', name)
  }, [name])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('reader_email', email)
  }, [email])

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
