import { HTMLAttributes, ReactNode, forwardRef } from 'react'
import { clsx } from 'clsx'
import { useResponsive, Breakpoint } from '@/shared/hooks/useResponsive'

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  // Grid columns por breakpoint
  cols?: Partial<Record<Breakpoint | 'default', number>>
  // Gap entre elementos por breakpoint
  gap?: Partial<Record<Breakpoint | 'default', string>>
  // Aspectos específicos del grid
  autoFit?: boolean  // usar grid-template-columns: repeat(auto-fit, minmax(...))
  minItemWidth?: string  // ancho mínimo para auto-fit (ej: "250px")
  maxItemWidth?: string  // ancho máximo para auto-fit (ej: "1fr")
  // Comportamiento responsive especial
  stackOnMobile?: boolean  // forzar columna única en móvil
  centerItems?: boolean    // centrar elementos en cada celda
  equalHeights?: boolean   // altura igual para todos los elementos
}

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = { default: 'gap-4', sm: 'gap-6' },
  autoFit = false,
  minItemWidth = '250px',
  maxItemWidth = '1fr',
  stackOnMobile = true,
  centerItems = false,
  equalHeights = false,
  ...props
}, ref) => {
  const { getValue, isMobile } = useResponsive()
  
  const currentGap = getValue(gap)
  
  const getGridClasses = () => {
    const baseClasses = ['grid']
    
    if (autoFit) {
      // CSS custom para auto-fit
      return clsx(
        baseClasses,
        currentGap,
        centerItems && 'place-items-center',
        equalHeights && 'items-stretch',
        className
      )
    }
    
    // Grid tradicional con breakpoints
    if (stackOnMobile && isMobile) {
      baseClasses.push('grid-cols-1')
    } else {
      // Generar classes responsive para columnas
      Object.entries(cols).forEach(([breakpoint, colCount]) => {
        if (breakpoint === 'default') {
          baseClasses.push(`grid-cols-${colCount}`)
        } else {
          baseClasses.push(`${breakpoint}:grid-cols-${colCount}`)
        }
      })
    }
    
    return clsx(
      baseClasses,
      currentGap,
      centerItems && 'place-items-center',
      equalHeights && 'items-stretch',
      className
    )
  }
  
  const getStyle = () => {
    if (autoFit) {
      return {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, ${maxItemWidth}))`
      }
    }
    return {}
  }

  return (
    <div
      ref={ref}
      className={getGridClasses()}
      style={getStyle()}
      {...props}
    >
      {children}
    </div>
  )
})

ResponsiveGrid.displayName = 'ResponsiveGrid'

// Componente para cards en grid con aspect ratio
interface ResponsiveCardGridProps extends Omit<ResponsiveGridProps, 'children'> {
  children: ReactNode
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto'  // 1:1, 16:9, 3:4, auto
  cardClassName?: string
}

export const ResponsiveCardGrid = forwardRef<HTMLDivElement, ResponsiveCardGridProps>(({
  children,
  aspectRatio = 'auto',
  cardClassName,
  ...gridProps
}, ref) => {
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square'
      case 'video':
        return 'aspect-video'
      case 'portrait':
        return 'aspect-[3/4]'
      case 'auto':
      default:
        return ''
    }
  }

  return (
    <ResponsiveGrid ref={ref} {...gridProps}>
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <div 
              key={index} 
              className={clsx(getAspectRatioClass(), cardClassName)}
            >
              {child}
            </div>
          ))
        : <div className={clsx(getAspectRatioClass(), cardClassName)}>
            {children}
          </div>
      }
    </ResponsiveGrid>
  )
})

ResponsiveCardGrid.displayName = 'ResponsiveCardGrid'

// Grid masonry (experimental)
interface MasonryGridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: Partial<Record<Breakpoint | 'default', number>>
  gap?: string
}

export const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(({
  children,
  className,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = '1rem',
  ...props
}, ref) => {
  const { getValue } = useResponsive()
  const currentCols = getValue(cols)

  return (
    <div
      ref={ref}
      className={clsx('masonry-grid', className)}
      style={{
        columnCount: currentCols,
        columnGap: gap,
        orphans: 1,
        widows: 1
      }}
      {...props}
    >
      {children}
    </div>
  )
})

MasonryGrid.displayName = 'MasonryGrid'

// Grid específico para dashboards
interface DashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  layout?: 'sidebar' | 'split' | 'full'  // layouts predefinidos
  sidebarWidth?: string
  mainContentMinWidth?: string
}

export const DashboardGrid = forwardRef<HTMLDivElement, DashboardGridProps>(({
  children,
  className,
  layout = 'full',
  sidebarWidth = '300px',
  mainContentMinWidth = '600px',
  ...props
}, ref) => {
  const { isDesktop, isTablet, isMobile } = useResponsive()

  const getLayoutClasses = () => {
    if (isMobile) {
      return 'flex flex-col space-y-4'
    }

    switch (layout) {
      case 'sidebar':
        return isDesktop 
          ? 'grid grid-cols-[300px,1fr] gap-6' 
          : 'flex flex-col space-y-4'
      case 'split':
        return isTablet || isDesktop 
          ? 'grid grid-cols-2 gap-6' 
          : 'flex flex-col space-y-4'
      case 'full':
      default:
        return 'flex flex-col space-y-6'
    }
  }

  const getStyle = () => {
    if (layout === 'sidebar' && isDesktop) {
      return {
        gridTemplateColumns: `${sidebarWidth} minmax(${mainContentMinWidth}, 1fr)`
      }
    }
    return {}
  }

  return (
    <div
      ref={ref}
      className={clsx(getLayoutClasses(), className)}
      style={getStyle()}
      {...props}
    >
      {children}
    </div>
  )
})

DashboardGrid.displayName = 'DashboardGrid'