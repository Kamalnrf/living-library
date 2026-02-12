import { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { isValidEmail, formatMonthYear } from './utils'

type Props = {
  onSubmit: (name: string, email: string) => Promise<void>
}

const ArrowRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

export default function Step1Registration({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      <motion.div
        className="card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
      >
        <div className="card-details">
          <span className="label">Name: <motion.b layout key={name.trim() || 'placeholder'}>{name.trim() || 'Your Name'}</motion.b></span>
          <span className="label">Member Since: {formatMonthYear(new Date())}</span>
        </div>
      </motion.div>

      <motion.div
        className="form-fields"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <input
          type="text"
          placeholder="Your name"
          autoComplete="name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email address"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </motion.div>

      <motion.button
        className="nav-btn forward"
        disabled={!isValid || isSubmitting}
        aria-label="Continue"
        type="button"
        onClick={handleSubmit}
        whileTap={{ scale: 0.93 }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 25 }}
      >
        <ArrowRight />
      </motion.button>
    </div>
  )
}
