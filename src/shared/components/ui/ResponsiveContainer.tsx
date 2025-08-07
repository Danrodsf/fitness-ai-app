import { HTMLAttributes, forwardRef, useRef, useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { useContainerQuery, useResponsive } from '@/shared/hooks/useResponsive'

interface ResponsiveContainerProps extends HTMLAttributes<HTMLDivElement> {
  // Breakpoints basados en el tamaño del contenedor, no del viewport
  containerBreakpoints?: {
    sm?: number    // ej: 300px
    md?: number    // ej: 500px
    lg?: number    // ej: 800px
    xl?: number    // ej: 1200px
  }
  // Clases que se aplican según el tamaño del contenedor
  containerClasses?: {
    sm?: string
    md?: string
    lg?: string
    xl?: string
  }
  // Comportamiento fluido
  fluidTypography?: boolean  // usar clamp() para typography
  adaptiveGrid?: boolean     // grid que se adapta al espacio disponible
  minItemWidth?: number      // para grid adaptativo
}

export const ResponsiveContainer = forwardRef<HTMLDivElement, ResponsiveContainerProps>(({
  children,
  className,
  containerBreakpoints = { sm: 300, md: 500, lg: 800, xl: 1200 },
  containerClasses = {},
  fluidTypography = false,
  adaptiveGrid = false,
  minItemWidth = 250,
  ...props
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { containerWidth } = useContainerQuery(containerRef)
  const { prefersReducedMotion } = useResponsive()
  
  // Determinar el breakpoint actual del contenedor
  const getCurrentContainerBreakpoint = () => {
    const { sm = 300, md = 500, lg = 800, xl = 1200 } = containerBreakpoints
    
    if (containerWidth >= xl) return 'xl'
    if (containerWidth >= lg) return 'lg'
    if (containerWidth >= md) return 'md'
    if (containerWidth >= sm) return 'sm'
    return 'xs'
  }
  
  const currentBreakpoint = getCurrentContainerBreakpoint()
  
  // Generar clases dinámicas basadas en el tamaño del contenedor
  const getContainerClasses = () => {
    const classes = [className]
    
    // Aplicar clases específicas del breakpoint del contenedor
    const currentClasses = containerClasses[currentBreakpoint as keyof typeof containerClasses]
    if (currentClasses) {
      classes.push(currentClasses)
    }
    
    // Grid adaptativo
    if (adaptiveGrid && containerWidth > 0) {
      const cols = Math.floor(containerWidth / minItemWidth)
      classes.push(`grid-cols-${Math.min(cols, 12)}`) // máximo 12 columnas
    }
    
    // Typography fluida
    if (fluidTypography) {
      classes.push('text-fluid') // clase CSS custom
    }
    
    return clsx(classes)
  }
  
  // Estilos dinámicos
  const getDynamicStyles = () => {
    const styles: React.CSSProperties = {}
    
    if (fluidTypography) {
      // Typography que escala según el ancho del contenedor
      const minSize = 14
      const maxSize = 18
      const minWidth = 300
      const maxWidth = 800
      
      styles.fontSize = `clamp(${minSize}px, ${minSize}px + ${(maxSize - minSize) / (maxWidth - minWidth)} * (100cqw - ${minWidth}px), ${maxSize}px)`
    }
    
    if (adaptiveGrid && containerWidth > 0) {
      // Grid dinámico usando container units
      const cols = Math.floor(containerWidth / minItemWidth)
      styles.gridTemplateColumns = `repeat(${Math.min(cols, 12)}, 1fr)`
    }
    
    // Transiciones suaves si no hay preferencia de motion reducido
    if (!prefersReducedMotion) {
      styles.transition = 'all 0.3s ease-in-out'
    }
    
    return styles
  }

  // Combinar refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(containerRef.current)
      } else {
        ref.current = containerRef.current
      }
    }
  }, [ref])

  return (
    <div
      ref={containerRef}
      className={getContainerClasses()}
      style={getDynamicStyles()}
      data-container-size={currentBreakpoint}
      data-container-width={containerWidth}
      {...props}
    >
      {children}
    </div>
  )
})

ResponsiveContainer.displayName = 'ResponsiveContainer'

// Componente específico para cards que se adaptan al contenedor
interface AdaptiveCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  compact?: boolean  // versión compacta cuando el espacio es limitado
  collapsible?: boolean  // colapsar contenido cuando es muy pequeño
  minWidth?: number  // ancho mínimo antes de colapsar
}

export const AdaptiveCard = forwardRef<HTMLDivElement, AdaptiveCardProps>(({
  children,
  title,
  compact = false,
  collapsible = false,
  minWidth = 200,
  className,
  ...props
}, ref) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const { containerWidth } = useContainerQuery(cardRef)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  useEffect(() => {
    if (collapsible) {
      setIsCollapsed(containerWidth > 0 && containerWidth < minWidth)
    }
  }, [containerWidth, collapsible, minWidth])
  
  const shouldUseCompactLayout = compact || containerWidth < 300
  
  const getCardClasses = () => {
    return clsx(
      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm',
      'transition-all duration-300',
      shouldUseCompactLayout ? 'p-3' : 'p-6',
      className
    )
  }
  
  // Combinar refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(cardRef.current)
      } else {
        ref.current = cardRef.current
      }
    }
  }, [ref])

  return (
    <div
      ref={cardRef}
      className={getCardClasses()}
      data-compact={shouldUseCompactLayout}
      data-collapsed={isCollapsed}
      {...props}
    >
      {title && (
        <h3 className={clsx(
          'font-semibold text-gray-900 dark:text-white',
          shouldUseCompactLayout ? 'text-sm mb-2' : 'text-lg mb-4',
          isCollapsed && 'text-xs'
        )}>
          {title}
        </h3>
      )}
      
      {!isCollapsed && (
        <div className={shouldUseCompactLayout ? 'text-sm' : ''}>
          {children}
        </div>
      )}
      
      {isCollapsed && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Contenido colapsado (espacio insuficiente)
        </div>
      )}
    </div>
  )
})

AdaptiveCard.displayName = 'AdaptiveCard'

// Hook para component responsivo basado en container
export const useContainerResponsive = (
  containerRef: React.RefObject<HTMLElement>,
  breakpoints: { sm?: number; md?: number; lg?: number; xl?: number } = {}
) => {
  const { containerWidth } = useContainerQuery(containerRef)
  const { sm = 300, md = 500, lg = 800, xl = 1200 } = breakpoints
  
  const getBreakpoint = () => {
    if (containerWidth >= xl) return 'xl'
    if (containerWidth >= lg) return 'lg'
    if (containerWidth >= md) return 'md'
    if (containerWidth >= sm) return 'sm'
    return 'xs'
  }
  
  const currentBreakpoint = getBreakpoint()
  
  return {
    containerWidth,
    currentBreakpoint,
    isSmall: currentBreakpoint === 'xs' || currentBreakpoint === 'sm',
    isMedium: currentBreakpoint === 'md',
    isLarge: currentBreakpoint === 'lg' || currentBreakpoint === 'xl',
    is: (bp: string) => currentBreakpoint === bp,
    isAbove: (bp: keyof typeof breakpoints) => {
      const bpValue = breakpoints[bp]
      return bpValue ? containerWidth >= bpValue : false
    }
  }
}