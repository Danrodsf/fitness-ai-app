import { clsx } from 'clsx'
import { Loader2, Sparkles } from 'lucide-react'

export type LoadingType = 'spinner' | 'skeleton' | 'overlay' | 'inline' | 'ai-generation'

interface LoadingStateProps {
  type?: LoadingType
  message?: string
  details?: string[]
  size?: 'sm' | 'md' | 'lg'
  className?: string
  overlay?: boolean // Para crear overlay sobre contenido existente
  fullScreen?: boolean // Para loading de página completa
}

export const LoadingState = ({ 
  type = 'spinner', 
  message, 
  details = [], 
  size = 'md', 
  className,
  overlay = false,
  fullScreen = false
}: LoadingStateProps) => {
  
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4'
      case 'md': return 'w-8 h-8'
      case 'lg': return 'w-12 h-12'
      default: return 'w-8 h-8'
    }
  }

  const getMessageSize = () => {
    switch (size) {
      case 'sm': return 'text-sm'
      case 'md': return 'text-base'
      case 'lg': return 'text-lg'
      default: return 'text-base'
    }
  }

  const renderSpinner = () => (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={clsx(getSpinnerSize(), "animate-spin text-primary-600 mb-3")} />
      {message && (
        <p className={clsx(getMessageSize(), "text-gray-700 dark:text-gray-300 font-medium")}>
          {message}
        </p>
      )}
      {details.length > 0 && (
        <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400 text-center">
          {details.map((detail, index) => (
            <p key={index}>• {detail}</p>
          ))}
        </div>
      )}
    </div>
  )

  const renderAIGeneration = () => (
    <div className="flex flex-col items-center justify-center">
      <div className="relative mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-primary-600 animate-pulse" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {message || '🤖 Generando con IA'}
      </h3>
      
      {details.length > 0 && (
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-center">
          {details.map((detail, index) => (
            <p key={index} className="animate-pulse" style={{ animationDelay: `${index * 0.5}s` }}>
              • {detail}
            </p>
          ))}
        </div>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
        Esto puede tomar unos segundos...
      </p>
    </div>
  )

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  )

  const renderInline = () => (
    <div className="flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {message || 'Cargando...'}
      </span>
    </div>
  )

  const renderContent = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner()
      case 'ai-generation':
        return renderAIGeneration()
      case 'skeleton':
        return renderSkeleton()
      case 'inline':
        return renderInline()
      case 'overlay':
        return renderSpinner()
      default:
        return renderSpinner()
    }
  }

  const baseClasses = clsx(
    className,
    {
      // Overlay styles
      'absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg': 
        overlay || type === 'overlay',
      
      // Full screen styles
      'fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center': 
        fullScreen,
      
      // Default container styles
      'flex items-center justify-center p-4': 
        !overlay && !fullScreen && type !== 'inline' && type !== 'skeleton',
        
      // Inline styles
      'inline-flex': 
        type === 'inline'
    }
  )

  return (
    <div 
      className={baseClasses} 
      role="status" 
      aria-live="polite"
      aria-label={message || 'Cargando contenido'}
    >
      {renderContent()}
    </div>
  )
}

// Componentes específicos para casos comunes
export const LoadingSpinner = ({ message, size = 'md' }: { message?: string; size?: 'sm' | 'md' | 'lg' }) => (
  <LoadingState type="spinner" message={message} size={size} />
)

export const LoadingSkeleton = ({ className }: { className?: string }) => (
  <LoadingState type="skeleton" className={className} />
)

export const LoadingOverlay = ({ message, details }: { message?: string; details?: string[] }) => (
  <LoadingState type="overlay" message={message} details={details} overlay />
)

export const LoadingInline = ({ message }: { message?: string }) => (
  <LoadingState type="inline" message={message} />
)

export const LoadingAIGeneration = ({ message, details }: { message?: string; details?: string[] }) => (
  <LoadingState type="ai-generation" message={message} details={details} />
)

// Hook para estados de carga común
export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState<string>()
  const [loadingDetails, setLoadingDetails] = useState<string[]>([])
  
  const startLoading = (message?: string, details?: string[]) => {
    setIsLoading(true)
    setLoadingMessage(message)
    setLoadingDetails(details || [])
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingMessage(undefined)
    setLoadingDetails([])
  }

  return {
    isLoading,
    loadingMessage,
    loadingDetails,
    startLoading,
    stopLoading
  }
}

// Para compatibilidad con código existente, necesitamos importar useState
import { useState } from 'react'