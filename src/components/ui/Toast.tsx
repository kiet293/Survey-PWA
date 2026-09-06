import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

export default function Toast({ message, type }: ToastProps) {
  const [visible, setVisible] = useState(true)
  const Icon = ICONS[type]

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3200)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className="toast-container">
      <div className={`toast toast--${type}`}>
        <Icon size={16} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
    </div>
  )
}
