import React, { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AuthModal } from '@/shared/components/modals/AuthModal'
import { EmailVerificationScreen } from './EmailVerificationScreen'
import { forceLogout } from '@/shared/utils/authUtils'

interface AuthGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, logout } = useAuth()

  // 🔥 DEBUG: Log del estado de AuthGuard
  React.useEffect(() => {
    console.log('🛡️ AuthGuard state:', {
      hasUser: !!user,
      userEmail: user?.email,
      isVerified: !!user?.email_confirmed_at,
      loading
    })
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, mostrar modal de auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mx-auto mb-4">
              <span className="text-white font-bold text-2xl">💪</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Fitness AI
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Tu entrenador personal con inteligencia artificial
            </p>
          </div>
          
          <AuthModal 
            isOpen={true} 
            onClose={() => {}} 
          />
          
          {/* 🔧 BOTÓN TEMPORAL DE DEBUG */}
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => forceLogout()}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
            >
              🧹 Force Logout (Debug)
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 🔥 NUEVO: Si el usuario existe pero no ha verificado su email
  if (user && !user.email_confirmed_at) {
    console.log('🔍 Usuario no verificado:', { 
      email: user.email, 
      confirmed: user.email_confirmed_at,
      userObject: user
    })
    
    return (
      <EmailVerificationScreen 
        email={user.email || ''}
        onBackToLogin={() => logout()}
      />
    )
  }

  console.log('✅ AuthGuard: Usuario verificado, pasando al App', {
    email: user?.email,
    confirmed: user?.email_confirmed_at
  })

  return <>{children}</>
}