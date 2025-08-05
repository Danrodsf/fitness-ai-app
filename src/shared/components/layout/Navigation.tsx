import { Button } from '@/shared/components/ui'
import { Dumbbell, Utensils, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'

export type NavigationTab = 'training' | 'nutrition' | 'progress'

interface NavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {

  const tabs = [
    {
      id: 'training' as const,
      label: 'Entrenamiento',
      icon: Dumbbell,
    },
    {
      id: 'nutrition' as const,
      label: 'Alimentación', 
      icon: Utensils,
    },
    {
      id: 'progress' as const,
      label: 'Progreso',
      icon: TrendingUp,
    },
  ]

  return (
    <nav className="flex flex-col xs:flex-row gap-1 xs:gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      {tabs.map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={activeTab === id ? 'primary' : 'ghost'}
          size="md"
          onClick={() => onTabChange(id)}
          className={clsx(
            'flex-1 justify-center gap-1 xs:gap-2 transition-all duration-200 min-h-[44px] xs:min-h-[48px] sm:min-h-[44px]',
            activeTab === id 
              ? 'shadow-md transform scale-[1.02]' 
              : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
          )}
          leftIcon={<Icon size={18} />}
        >
          <span className="text-xs xs:text-xs sm:text-sm">{label}</span>
        </Button>
      ))}
    </nav>
  )
}