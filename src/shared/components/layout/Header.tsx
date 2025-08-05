import { useState } from 'react'
import { useAppContext } from '@/store'
import { Button, Badge } from '@/shared/components/ui'
import { Sun, Moon, User, Settings, LogOut } from 'lucide-react'
import { SettingsModal } from '@/shared/components/modals/SettingsModal'
import { UserProfileModal } from '@/shared/components/modals/UserProfileModal'
import { AuthModal } from '@/shared/components/modals/AuthModal'
import { useAuth } from '@/domains/auth/hooks/useAuth'

export const Header = () => {
  const { state, dispatch } = useAppContext()
  const { user, profile, logout } = useAuth()
  
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleThemeToggle = () => {
    dispatch({ type: 'THEME_TOGGLE' })
  }

  const handleUserClick = async () => {
    if (user) {
      // Si el usuario está logado, mostrar opción de logout
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        try {
          await logout()
        } catch (error) {
          alert('Error al cerrar sesión: ' + (error instanceof Error ? error.message : 'Error desconocido'))
        }
      }
    } else {
      // Si no está logado, mostrar modal de login
      setShowAuthModal(true)
    }
  }

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[60px] sm:h-16 py-2 sm:py-0">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 rounded-xl">
              <span className="text-white font-bold text-sm sm:text-lg">💪</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                Mi Plan de Fitness
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Dashboard Personal
              </p>
            </div>
          </div>

          {/* User Stats */}
          {state.user.profile && (
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {state.user.profile.age}
                </div>
                <div className="text-gray-500 dark:text-gray-400">Años</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {state.user.profile.weight}kg
                </div>
                <div className="text-gray-500 dark:text-gray-400">Peso</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {state.user.profile.height}cm
                </div>
                <div className="text-gray-500 dark:text-gray-400">Altura</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Current Streak Badge - Mobile first */}
            {state.user.stats.currentStreak > 0 && (
              <Badge variant="success" size="sm" className="text-xs px-2 py-1">
                🔥 {state.user.stats.currentStreak}
              </Badge>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThemeToggle}
              className="px-1 py-1 sm:p-2"
              title="Cambiar tema"
            >
              {state.theme.isDark ? (
                <Sun size={16} className="sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />
              )}
            </Button>

            {/* Settings */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-1 py-1 sm:p-2"
              onClick={() => setShowSettingsModal(true)}
              title="Configuración"
            >
              <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Button>

            {/* Profile / Login */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={user ? "px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1 sm:gap-2 max-w-[100px] sm:max-w-none" : "px-1 py-1 sm:p-2"}
              onClick={handleUserClick}
              title={user ? "Cerrar sesión" : "Iniciar sesión"}
            >
              {user ? (
                <>
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {profile?.name ? profile.name.split(' ')[0] : user.email.split('@')[0]}
                  </span>
                  <LogOut size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                </>
              ) : (
                <User size={16} className="sm:w-[18px] sm:h-[18px]" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
      <UserProfileModal 
        isOpen={showUserModal} 
        onClose={() => setShowUserModal(false)} 
      />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  )
}