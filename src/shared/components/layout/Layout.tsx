import { ReactNode, useState, useEffect } from 'react'
import { Header } from './Header'
import { AICoachChat } from '@/shared/components/AICoachChat'
import { MobileNavigation, MobileNavigationTab } from './MobileNavigation'
import { SkipLink, MainContent } from '@/shared/components/ui'
import { clsx } from 'clsx'

interface LayoutProps {
  children: ReactNode
  currentTab?: MobileNavigationTab
  onTabChange?: (tab: MobileNavigationTab) => void
}

export const Layout = ({ children, currentTab = 'training', onTabChange }: LayoutProps) => {
  const [isMobile, setIsMobile] = useState(false)

  // Detectar si estamos en móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Skip Links para accesibilidad */}
      <SkipLink href="#main-content">Saltar al contenido principal</SkipLink>
      <SkipLink href="#navigation">Saltar a navegación</SkipLink>
      
      <Header />
      
      <MainContent 
        id="main-content"
        className={clsx(
          "max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 py-3 xs:py-4 sm:py-6 md:py-8",
          isMobile && "pb-20" // Espacio extra para la bottom navigation
        )}
        aria-label="Contenido principal de la aplicación"
      >
        {children}
      </MainContent>
      
      {/* AI Coach Chat - Available globally */}
      <AICoachChat />
      
      {/* Mobile Navigation - Solo visible en móvil */}
      {isMobile && onTabChange && (
        <div id="navigation">
          <MobileNavigation 
            activeTab={currentTab}
            onTabChange={onTabChange}
          />
        </div>
      )}
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  )
}