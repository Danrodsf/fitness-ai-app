import { useState, useEffect } from 'react'

// Breakpoints mejorados con nombres semánticos
export const breakpoints = {
  xs: 475,    // Extra small devices
  sm: 640,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (laptops)
  xl: 1280,   // Extra large devices (desktops)
  '2xl': 1536 // 2X Large devices (large desktops)
} as const

export type Breakpoint = keyof typeof breakpoints

// Hook para detectar el breakpoint actual
export const useBreakpoint = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs')
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      setWindowWidth(width)

      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl')
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl')
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg')
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md')
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm')
      } else {
        setCurrentBreakpoint('xs')
      }
    }

    // Inicializar
    updateBreakpoint()

    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return { currentBreakpoint, windowWidth }
}

// Hook para detectar si estamos en móvil, tablet o desktop
export const useDeviceType = () => {
  const { currentBreakpoint } = useBreakpoint()

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm'
  const isTablet = currentBreakpoint === 'md'
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl'

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  }
}

// Hook para responsive values
export const useResponsiveValue = <T>(values: Partial<Record<Breakpoint | 'default', T>>): T => {
  const { currentBreakpoint } = useBreakpoint()
  
  // Buscar el valor más apropiado según el breakpoint actual
  const orderedBreakpoints: (Breakpoint | 'default')[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs', 'default']
  const currentIndex = orderedBreakpoints.indexOf(currentBreakpoint)
  
  // Buscar hacia abajo desde el breakpoint actual
  for (let i = currentIndex; i < orderedBreakpoints.length; i++) {
    const key = orderedBreakpoints[i]
    if (key in values) {
      return values[key]!
    }
  }
  
  // Fallback a default o el primer valor disponible
  return values.default || Object.values(values)[0]!
}

// Hook para container queries (cuando esté disponible)
export const useContainerQuery = (containerRef: React.RefObject<HTMLElement>) => {
  const [containerWidth, setContainerWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
        setContainerHeight(entry.contentRect.height)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [containerRef])

  return { containerWidth, containerHeight }
}

// Hook para orientación de dispositivo
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    
    // También escuchar cambios de orientación específicos
    window.addEventListener('orientationchange', updateOrientation)
    
    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return { orientation, isPortrait: orientation === 'portrait', isLandscape: orientation === 'landscape' }
}

// Hook para detectar si el usuario prefiere motion reducido
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

// Hook para detectar touch device
export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }

    checkTouch()
    
    // También verificar cuando cambie el input method
    const handlePointerCapable = () => checkTouch()
    window.addEventListener('pointercapable', handlePointerCapable)
    
    return () => window.removeEventListener('pointercapable', handlePointerCapable)
  }, [])

  return isTouchDevice
}

// Utilidades de clase responsive
export const responsive = {
  // Grid systems
  grid: {
    responsive: (cols: Partial<Record<Breakpoint, number>>) => {
      const classes = ['grid']
      Object.entries(cols).forEach(([bp, colCount]) => {
        if (bp === 'xs') {
          classes.push(`grid-cols-${colCount}`)
        } else {
          classes.push(`${bp}:grid-cols-${colCount}`)
        }
      })
      return classes.join(' ')
    }
  },
  
  // Spacing
  spacing: {
    responsive: (values: Partial<Record<Breakpoint, string>>) => {
      const classes: string[] = []
      Object.entries(values).forEach(([bp, value]) => {
        if (bp === 'xs') {
          classes.push(value)
        } else {
          classes.push(`${bp}:${value}`)
        }
      })
      return classes.join(' ')
    }
  },
  
  // Typography
  text: {
    responsive: (sizes: Partial<Record<Breakpoint, string>>) => {
      const classes: string[] = []
      Object.entries(sizes).forEach(([bp, size]) => {
        if (bp === 'xs') {
          classes.push(`text-${size}`)
        } else {
          classes.push(`${bp}:text-${size}`)
        }
      })
      return classes.join(' ')
    }
  }
}

// Hook combinado para responsive completo
export const useResponsive = () => {
  const breakpointInfo = useBreakpoint()
  const deviceInfo = useDeviceType()
  const orientationInfo = useOrientation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const isTouchDevice = useTouchDevice()

  return {
    ...breakpointInfo,
    ...deviceInfo,
    ...orientationInfo,
    prefersReducedMotion,
    isTouchDevice,
    
    // Utility functions
    getValue: useResponsiveValue,
    is: (bp: Breakpoint) => breakpointInfo.currentBreakpoint === bp,
    isAbove: (bp: Breakpoint) => breakpointInfo.windowWidth >= breakpoints[bp],
    isBelow: (bp: Breakpoint) => breakpointInfo.windowWidth < breakpoints[bp],
    
    // Responsive utilities
    classes: responsive
  }
}