import { useEffect } from 'react'
import { useAppContext } from '@/store'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { clsx } from 'clsx'

export const NotificationSystem = () => {
  const { state, dispatch } = useAppContext()

  const removeNotification = (id: string) => {
    dispatch({ type: 'NOTIFICATION_REMOVE', payload: { id } })
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-3">
      {state.notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    timestamp: string
  }
  onRemove: () => void
}

const NotificationItem = ({ notification, onRemove }: NotificationItemProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove()
    }, 5000) // Auto-remove after 5 seconds

    return () => clearTimeout(timer)
  }, [onRemove])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: 'bg-success-50 border-success-200 text-success-900 dark:bg-success-900/20 dark:border-success-800 dark:text-success-100',
    error: 'bg-danger-50 border-danger-200 text-danger-900 dark:bg-danger-900/20 dark:border-danger-800 dark:text-danger-100',
    warning: 'bg-warning-50 border-warning-200 text-warning-900 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-100',
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-100',
  }

  const iconColors = {
    success: 'text-success-600 dark:text-success-400',
    error: 'text-danger-600 dark:text-danger-400',
    warning: 'text-warning-600 dark:text-warning-400',
    info: 'text-blue-600 dark:text-blue-400',
  }

  const Icon = icons[notification.type]

  return (
    <div
      className={clsx(
        'animate-slide-down p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300',
        colors[notification.type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={clsx('flex-shrink-0 w-5 h-5 mt-0.5', iconColors[notification.type])} />
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          {notification.message && (
            <p className="mt-1 text-sm opacity-90">{notification.message}</p>
          )}
        </div>
        
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}