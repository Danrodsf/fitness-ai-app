import { Dumbbell, Utensils, TrendingUp, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useTabNavigation } from '@/shared/hooks/useKeyboardNavigation'

export type MobileNavigationTab = 'training' | 'nutrition' | 'progress' | 'profile'

interface MobileNavigationProps {
  activeTab: MobileNavigationTab
  onTabChange: (tab: MobileNavigationTab) => void
  className?: string
}

export const MobileNavigation = ({ activeTab, onTabChange, className }: MobileNavigationProps) => {
  const tabs = [
    {
      id: 'training' as const,
      label: 'Entrenar',
      icon: Dumbbell,
      color: 'text-blue-600',
      activeColor: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'nutrition' as const,
      label: 'Comer',
      icon: Utensils,
      color: 'text-green-600',
      activeColor: 'bg-green-50 text-green-600'
    },
    {
      id: 'progress' as const,
      label: 'Progreso',
      icon: TrendingUp,
      color: 'text-purple-600',
      activeColor: 'bg-purple-50 text-purple-600'
    },
    {
      id: 'profile' as const,
      label: 'Perfil',
      icon: User,
      color: 'text-gray-600',
      activeColor: 'bg-gray-50 text-gray-600'
    },
  ]

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab)
  
  // Navegación por teclado para tabs
  useTabNavigation(
    tabs.length,
    (index) => onTabChange(tabs[index].id),
    currentTabIndex
  )

  return (
    <nav 
      className={clsx(
        'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50',
        'safe-area-inset-bottom', // Para dispositivos con home indicator
        className
      )}
      role="tablist"
      aria-label="Navegación principal"
    >
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map(({ id, label, icon: Icon, activeColor }) => {
          const isActive = activeTab === id
          
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              onKeyDown={(e) => {
                // Navegación por teclado adicional
                if (e.key === 'Home') {
                  e.preventDefault()
                  onTabChange(tabs[0].id)
                } else if (e.key === 'End') {
                  e.preventDefault()
                  onTabChange(tabs[tabs.length - 1].id)
                }
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              aria-controls={`panel-${id}`}
              className={clsx(
                'flex flex-col items-center justify-center min-w-0 px-3 py-2 transition-all duration-200',
                'relative group touch-manipulation',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg',
                isActive 
                  ? activeColor + ' dark:bg-gray-800 dark:text-white' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-current rounded-full" />
              )}
              
              {/* Icon container with hover effect */}
              <div className={clsx(
                'flex items-center justify-center w-6 h-6 mb-1 transition-transform duration-200',
                isActive ? 'scale-110' : 'group-hover:scale-105'
              )}>
                <Icon 
                  size={20} 
                  className={clsx(
                    'transition-colors duration-200',
                    isActive ? 'stroke-2' : 'stroke-1.5'
                  )}
                />
              </div>
              
              {/* Label */}
              <span className={clsx(
                'text-xs font-medium transition-colors duration-200 leading-none',
                isActive ? 'font-semibold' : 'font-normal'
              )}>
                {label}
              </span>
              
              {/* Ripple effect on tap (móvil) */}
              <div className="absolute inset-0 rounded-lg bg-current opacity-0 group-active:opacity-10 transition-opacity duration-150" />
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Hook para detectar si estamos en móvil
export const useIsMobile = () => {
  return window.innerWidth < 768 // md breakpoint
}