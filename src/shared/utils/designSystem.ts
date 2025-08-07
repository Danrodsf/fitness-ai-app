// Design System utilities para componentes consistentes

// Spacing scale (basado en 4px)
export const spacing = {
  none: '0',
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem',   // 32px
  '4xl': '2.5rem', // 40px
  '5xl': '3rem',   // 48px
  '6xl': '4rem',   // 64px
} as const

// Typography scale
export const typography = {
  size: {
    xxs: 'text-xxs',    // 10px
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
    '3xl': 'text-3xl',  // 30px
    '4xl': 'text-4xl',  // 36px
    '5xl': 'text-5xl',  // 48px
    '6xl': 'text-6xl',  // 60px
  },
  weight: {
    thin: 'font-thin',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  },
  leading: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  }
} as const

// Icon sizes estándar
export const iconSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const

// Touch target sizes (WCAG compliance)
export const touchTargets = {
  sm: 'min-h-[32px] min-w-[32px]',  // 32px mínimo
  md: 'min-h-[44px] min-w-[44px]',  // 44px recomendado
  lg: 'min-h-[48px] min-w-[48px]',  // 48px óptimo
} as const

// Component variant system
export const variants = {
  button: {
    primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 focus:ring-secondary-500 text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus:ring-primary-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    danger: 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 text-white shadow-md hover:shadow-lg',
    success: 'bg-success-600 hover:bg-success-700 focus:ring-success-500 text-white shadow-md hover:shadow-lg',
  },
  badge: {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
    success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
    danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
  },
  card: {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-lg shadow-glass',
    elevated: 'bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200',
  }
} as const

// Animation presets
export const animations = {
  // Transiciones estándar
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  
  // Micro-interacciones específicas
  button: 'transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95',
  card: 'transition-all duration-200 ease-in-out hover:shadow-lg hover:-translate-y-0.5',
  modal: 'transition-all duration-300 ease-out',
} as const

// Focus rings WCAG compliant
export const focusRing = {
  default: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
  danger: 'focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
  success: 'focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900',
} as const

// Color semantics helpers
export const colors = {
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500',
    inverse: 'text-white dark:text-gray-900',
  },
  bg: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    muted: 'bg-gray-100 dark:bg-gray-700',
    inverse: 'bg-gray-900 dark:bg-white',
  },
  border: {
    default: 'border-gray-200 dark:border-gray-700',
    muted: 'border-gray-100 dark:border-gray-800',
    strong: 'border-gray-300 dark:border-gray-600',
  }
} as const

// Utility function para combinar clases de manera consistente
export const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Utility function para responsive breakpoints
export const responsive = {
  mobile: (classes: string) => `${classes}`,
  tablet: (classes: string) => `sm:${classes}`,
  desktop: (classes: string) => `lg:${classes}`,
  wide: (classes: string) => `xl:${classes}`,
}

// Layout patterns comunes
export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'space-y-6 lg:space-y-8',
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
    dashboard: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6',
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
  }
} as const

// Export all utilities as a single object for easy importing
export const ds = {
  spacing,
  typography,
  iconSizes,
  touchTargets,
  variants,
  animations,
  focusRing,
  colors,
  layout,
  responsive,
  cn,
}