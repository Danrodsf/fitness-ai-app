import { useState } from 'react'
import { Layout, Navigation, NavigationTab } from '@/shared/components/layout'
import { NotificationSystem } from '@/shared/components/NotificationSystem'
import { TrainingDashboard } from '@/domains/training/components/TrainingDashboard'
import { NutritionDashboard } from '@/domains/nutrition/components/NutritionDashboard'
import { ProgressDashboard } from '@/domains/progress/components/ProgressDashboard'
import { AuthGuard } from '@/domains/auth/components/AuthGuard'
import { OnboardingFlow } from '@/shared/components/OnboardingFlow'
import { useAuth } from '@/domains/auth/hooks/useAuth'

export const App = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('training')
  const { user, profile, loading } = useAuth()

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'training':
        return <TrainingDashboard />
      case 'nutrition':
        return <NutritionDashboard />
      case 'progress':
        return <ProgressDashboard />
    }
  }

  // 🔥 FIX: Estado de carga y lógica de onboarding
  const isProfileLoading = user && loading
  const isOnboardingRequired = user && !loading && (!profile || !profile?.preferences?.onboardingCompleted)
  const isReady = user && !loading && profile && profile?.preferences?.onboardingCompleted

  console.log('🔍 App render state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    loading,
    isProfileLoading,
    isOnboardingRequired,
    isReady,
    onboardingCompleted: profile?.preferences?.onboardingCompleted,
    userEmailConfirmed: user?.email_confirmed_at
  })

  return (
    <AuthGuard>
      {/* 🔥 FIX: Mostrar loading hasta que todo esté completamente cargado */}
      {isProfileLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Cargando tu perfil...</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              {loading ? 'Autenticando...' : 'Verificando configuración...'}
            </p>
          </div>
        </div>
      ) : isOnboardingRequired ? (
        <OnboardingFlow />
      ) : isReady ? (
        <Layout>
          <div className="space-y-8">
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="animate-fade-in">
              {renderActiveTab()}
            </div>
          </div>
          
          <NotificationSystem />
        </Layout>
      ) : (
        // Estado fallback por si algo falla
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Inicializando...</p>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}