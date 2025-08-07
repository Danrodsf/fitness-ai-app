import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  // Accesibilidad mejorada
  helperText?: string
  required?: boolean
  'aria-label'?: string
  'aria-describedby'?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    leftIcon, 
    rightIcon, 
    className, 
    id,
    helperText,
    required = false,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = error ? `${inputId}-error` : undefined
    const helperTextId = helperText ? `${inputId}-helper` : undefined
    
    // Construir aria-describedby combinando error, helper text y custom
    const describedByIds = [
      errorId,
      helperTextId,
      ariaDescribedby
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && (
              <span className="text-danger-500 ml-1" aria-label="requerido">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400">{leftIcon}</span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 sm:text-sm transition-colors duration-200 min-h-[44px]', // Touch target mínimo
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-danger-300 focus:border-danger-500 focus:ring-danger-500',
              className
            )}
            aria-label={ariaLabel || (typeof label === 'string' ? label : undefined)}
            aria-describedby={describedByIds}
            aria-invalid={error ? 'true' : 'false'}
            aria-required={required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <span className="text-gray-500 dark:text-gray-400">{rightIcon}</span>
            </div>
          )}
        </div>
        
        {helperText && !error && (
          <p 
            id={helperTextId}
            className="mt-1 text-sm text-gray-600 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId}
            className="mt-1 text-sm text-danger-600 dark:text-danger-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'