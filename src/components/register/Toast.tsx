import { useEffect, useRef } from 'react'

type Props = {
  message: string
  isError?: boolean
  visible: boolean
  onHide: () => void
}

export default function Toast({ message, isError, visible, onHide }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (visible) {
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(onHide, 3000)
    }
    return () => clearTimeout(timerRef.current)
  }, [visible, onHide])

  const className = ['toast', visible && 'visible', isError && 'error']
    .filter(Boolean)
    .join(' ')

  return <div className={className}>{message}</div>
}
