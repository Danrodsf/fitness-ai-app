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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-xl">
              <span className="text-white font-bold text-lg">💪</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Mi Plan de Fitness
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleThemeToggle}
              className="p-2"
            >
              {state.theme.isDark ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </Button>

            {/* Settings */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings size={18} />
            </Button>

            {/* Profile / Login */}
            <Button 
              variant="ghost" 
              size="sm" 
              className={user ? "px-3 py-2 flex items-center gap-2" : "p-2"}
              onClick={handleUserClick}
              title={user ? "Cerrar sesión" : "Iniciar sesión"}
            >
              {user ? (
                <>
                  <span className="text-sm font-medium">
                    Hola, {profile?.name || user.email.split('@')[0]}
                  </span>
                  <LogOut size={16} />
                </>
              ) : (
                <User size={18} />
              )}
            </Button>

            {/* Current Streak Badge */}
            {state.user.stats.currentStreak > 0 && (
              <Badge variant="success" size="sm">
                🔥 {state.user.stats.currentStreak} días
              </Badge>
            )}
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