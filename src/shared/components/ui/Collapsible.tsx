import { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'

interface CollapsibleProps {
  trigger: ReactNode | string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  disabled?: boolean
  variant?: 'default' | 'card' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
  onToggle?: (isOpen: boolean) => void
}

export const Collapsible = ({
  trigger,
  children,
  defaultOpen = false,
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
  variant = 'default',
  size = 'md',
  icon = true,
  onToggle
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = () => {
    if (disabled) return
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return {
          container: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm',
          trigger: 'p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0',
          content: 'p-4'
        }
      case 'minimal':
        return {
          container: '',
          trigger: 'py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md',
          content: 'pt-2'
        }
      default:
        return {
          container: 'border border-gray-200 dark:border-gray-700 rounded-lg',
          trigger: 'p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700',
          content: 'p-3'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'lg':
        return 'text-lg'
      default:
        return 'text-base'
    }
  }

  const variantClasses = getVariantClasses()

  return (
    <div 
      className={clsx(variantClasses.container, className)}
      role="region"
      aria-expanded={isOpen}
    >
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between text-left transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses.trigger,
          getSizeClasses(),
          triggerClassName
        )}
        aria-expanded={isOpen}
        aria-controls={`collapsible-content-${Math.random().toString(36).substr(2, 9)}`}
      >
        <span className="flex-1 font-medium text-gray-900 dark:text-white">
          {trigger}
        </span>
        
        {icon && (
          <span 
            className={clsx(
              'ml-2 transition-transform duration-200 text-gray-500 dark:text-gray-400',
              isOpen && 'transform rotate-180'
            )}
          >
            {isOpen ? (
              <ChevronUp size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
            ) : (
              <ChevronDown size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
            )}
          </span>
        )}
      </button>

      <div
        className={clsx(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
        )}
        id={`collapsible-content-${Math.random().toString(36).substr(2, 9)}`}
        aria-hidden={!isOpen}
      >
        <div className={clsx(variantClasses.content, contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  )
}

// Componente específico para secciones del dashboard
export const DashboardSection = ({
  title,
  description,
  children,
  defaultOpen = true,
  badge,
  icon: Icon,
  className
}: {
  title: string
  description?: string
  children: ReactNode
  defaultOpen?: boolean
  badge?: ReactNode
  icon?: React.ComponentType<any>
  className?: string
}) => {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      variant="card"
      className={className}
      trigger={
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Icon size={20} className="text-primary-600 dark:text-primary-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          {badge && (
            <div className="ml-2">
              {badge}
            </div>
          )}
        </div>
      }
    >
      {children}
    </Collapsible>
  )
}