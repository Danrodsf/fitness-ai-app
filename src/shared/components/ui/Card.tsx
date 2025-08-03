import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className, 
  ...props 
}: CardProps) => {
  const baseClasses = 'rounded-xl transition-all duration-200'
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-glass hover:shadow-glass-hover border border-white/20 dark:border-gray-700/50',
    bordered: 'border-2 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600',
  }
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = ({ children, className, ...props }: CardHeaderProps) => (
  <div className={clsx('mb-4', className)} {...props}>
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