import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { useCardInteractions } from '@/shared/hooks/useMicroInteractions'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean // Habilitar micro-interacciones
  clickable?: boolean   // Card clickeable
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ 
  children, 
  variant = 'default', 
  padding = 'sm',
  interactive = false,
  clickable = false,
  className,
  onClick,
  ...props 
}, ref) => {
  const interactions = useCardInteractions()
  
  const isInteractive = interactive || clickable || onClick
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isInteractive) {
      interactions.handleInteraction(e, 'click')
    }
    onClick?.(e)
  }
  
  const baseClasses = clsx(
    'rounded-xl transition-all duration-200 relative overflow-hidden',
    isInteractive && 'cursor-pointer select-none',
    isInteractive && interactions.getInteractionClasses()
  )
  
  const variants = {
    default: clsx(
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      isInteractive ? 'shadow-md hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700' : 'shadow-sm'
    ),
    glass: clsx(
      'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50',
      isInteractive ? 'shadow-glass hover:shadow-glass-hover hover:bg-white/90 dark:hover:bg-gray-800/90' : 'shadow-glass'
    ),
    bordered: clsx(
      'border-2 border-gray-200 dark:border-gray-700',
      isInteractive ? 'hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md' : ''
    ),
  }
  
  const paddings = {
    none: '',
    sm: 'p-2',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      ref={ref}
      className={clsx(
        baseClasses,
        variants[variant],
        paddings[padding],
        className
      )}
      onClick={handleClick}
      onMouseEnter={isInteractive ? interactions.handlers.onMouseEnter : undefined}
      onMouseLeave={isInteractive ? interactions.handlers.onMouseLeave : undefined}
      role={clickable || onClick ? 'button' : undefined}
      tabIndex={clickable || onClick ? 0 : undefined}
      {...props}
    >
      {isInteractive && <interactions.RippleEffects />}
      {children}
    </div>
  )
})

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = ({ children, className, ...props }: CardHeaderProps) => (
  <div className={clsx('mb-2', className)} {...props}>
    {children}
  </div>
)

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const CardTitle = ({ 
  children, 
  as: Component = 'h3', 
  className, 
  ...props 
}: CardTitleProps) => (
  <Component 
    className={clsx(
      'text-lg font-semibold text-gray-900 dark:text-white',
      className
    )} 
    {...props}
  >
    {children}
  </Component>
)

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = ({ children, className, ...props }: CardContentProps) => (
  <div className={clsx('text-gray-600 dark:text-gray-300', className)} {...props}>
    {children}
  </div>
)

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = ({ children, className, ...props }: CardFooterProps) => (
  <div className={clsx('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)} {...props}>
    {children}
  </div>
)