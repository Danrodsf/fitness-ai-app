import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { clsx } from 'clsx'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  onClose?: () => void
}

interface ToastProps extends Toast {
  onRemove: (id: string) => void
}

const ToastComponent = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  action,
  onClose,
  onRemove 
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Entrada animada
    requestAnimationFrame(() => {
      setIsVisible(true)
    })

    // Auto-remove después del duration
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose()
      }, duration)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [duration])

  useEffect(() => {
    // Animación de progreso
    if (duration > 0 && progressRef.current) {
      progressRef.current.style.width = '0%'
      progressRef.current.style.transition = `width ${duration}ms linear`
    }
  }, [duration])

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsExiting(true)
    onClose?.()
    
    // Esperar a que termine la animación
    setTimeout(() => {
      onRemove(id)
    }, 300)
  }

  const getIcon = () => {
    const iconProps = { size: 20, className: 'flex-shrink-0' }
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className={clsx(iconProps.className, 'text-green-500')} />
      case 'error':
        return <AlertCircle {...iconProps} className={clsx(iconProps.className, 'text-red-500')} />
      case 'warning':
        return <AlertTriangle {...iconProps} className={clsx(iconProps.className, 'text-yellow-500')} />
      case 'info':
        return <Info {...iconProps} className={clsx(iconProps.className, 'text-blue-500')} />
    }
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
      case 'error':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  return (
    <div
      className={clsx(
        'max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 border-l-4 overflow-hidden',
        getTypeStyles(),
        'transform transition-all duration-300 ease-out',
        isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95',
        isExiting && 'translate-x-full opacity-0 scale-95'
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
          <div
            ref={progressRef}
            className={clsx(
              'h-full transition-all ease-linear',
              type === 'success' && 'bg-green-500',
              type === 'error' && 'bg-red-500',
              type === 'warning' && 'bg-yellow-500',
              type === 'info' && 'bg-blue-500'
            )}
            style={{ width: '100%' }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </p>
            {message && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {message}
              </p>
            )}
            
            {action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    action.onClick()
                    handleClose()
                  }}
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              aria-label="Cerrar notificación"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Container para los toasts
export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const newToast: Toast = {
      ...toast,
      id: Math.random().toString(36).substring(7)
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      const patterns = {
        success: 10,
        info: 10,
        warning: [10, 50, 10],
        error: [50, 50, 50]
      }
      navigator.vibrate(patterns[toast.type] || 10)
    }
    
    return newToast.id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Exponer funciones globalmente
  useEffect(() => {
    ;(window as any).addToast = addToast
    ;(window as any).removeToast = removeToast
    
    return () => {
      delete (window as any).addToast
      delete (window as any).removeToast
    }
  }, [])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map(toast => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onRemove={removeToast}
        />
      ))}
    </div>,
    document.body
  )
}

// Hook para usar toasts
export const useToast = () => {
  const toast = {
    success: (title: string, message?: string, options?: Partial<Toast>) => {
      return (window as any).addToast?.({ type: 'success', title, message, ...options })
    },
    error: (title: string, message?: string, options?: Partial<Toast>) => {
      return (window as any).addToast?.({ type: 'error', title, message, ...options })
    },
    warning: (title: string, message?: string, options?: Partial<Toast>) => {
      return (window as any).addToast?.({ type: 'warning', title, message, ...options })
    },
    info: (title: string, message?: string, options?: Partial<Toast>) => {
      return (window as any).addToast?.({ type: 'info', title, message, ...options })
    },
    remove: (id: string) => {
      return (window as any).removeToast?.(id)
    }
  }
  
  return toast
}