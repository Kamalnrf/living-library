import { motion } from "motion/react"

type Props = {
  currentStep: number
}

export default function ProgressDots({ currentStep }: Props) {
  return (
    <div className="progress">
      {[1, 2, 3].map(step => {
        const isActive = step === currentStep
        const className = ['dot',
          isActive && 'active',
          step < currentStep && 'completed',
        ].filter(Boolean).join(' ')

        return (
          <motion.div
            key={step}
            layout
            className={className}
            animate={{
              boxShadow: isActive
                ? "0 0 8px hsla(24, 88%, 45%, 0.4)"
                : "0 0 0px hsla(24, 88%, 45%, 0)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        )
      })}
    </div>
  )
}
