import { ReactNode, ElementType } from 'react'

interface LandmarkProps {
  as?: ElementType
  role?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  className?: string
  children: ReactNode
  id?: string
}

export const Landmark = ({
  as: Component = 'div',
  role,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  className,
  children,
  id,
  ...props
}: LandmarkProps) => {
  return (
    <Component
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}

// Componentes específicos para landmarks comunes
export const MainContent = ({ children, className, ...props }: Omit<LandmarkProps, 'as' | 'role'>) => (
  <Landmark as="main" role="main" className={className} {...props}>
    {children}
  </Landmark>
)

export const Navigation = ({ children, className, 'aria-label': ariaLabel = 'Navegación principal', ...props }: Omit<LandmarkProps, 'as' | 'role'>) => (
  <Landmark as="nav" role="navigation" aria-label={ariaLabel} className={className} {...props}>
    {children}
  </Landmark>
)

export const ContentInfo = ({ children, className, ...props }: Omit<LandmarkProps, 'as' | 'role'>) => (
  <Landmark as="footer" role="contentinfo" className={className} {...props}>
    {children}
  </Landmark>
)

export const Banner = ({ children, className, ...props }: Omit<LandmarkProps, 'as' | 'role'>) => (
  <Landmark as="header" role="banner" className={className} {...props}>
    {children}
  </Landmark>
)

export const Region = ({ children, className, 'aria-label': ariaLabel, ...props }: Omit<LandmarkProps, 'as' | 'role'>) => (
  <Landmark as="section" role="region" aria-label={ariaLabel} className={className} {...props}>
    {children}
  </Landmark>
)