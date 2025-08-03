import { useEffect, useState } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { AIService } from '@/shared/services/AIService'
import { TrainingService } from '../services/trainingService'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/shared/components/ui'
import { AlertTriangle, Sparkles, Target, RefreshCw, Settings } from 'lucide-react'
import { WorkoutDayCard } from './WorkoutDayCard'
import { defaultTrainingProgram } from '../data/trainingData'

export const TrainingDashboard = () => {
  const { state, dispatch } = useAppContext()
  const { profile, user, updateProfile } = useAuth()
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Get AI-generated training plan or fallback to default
  const aiTrainingPlan = profile?.preferences?.aiPlans?.trainingPlan
  const programToUse = aiTrainingPlan || defaultTrainingProgram

  // Load training program on mount and when programToUse changes
  useEffect(() => {
    if (!state.training.currentProgram || 
        state.training.currentProgram.id !== programToUse.id ||
        state.training.currentProgram.updatedAt !== programToUse.updatedAt) {
      dispatch({
        type: 'TRAINING_PROGRAM_LOAD',
        payload: programToUse,
      })
    }
  }, [state.training.currentProgram, dispatch, programToUse])

  // 🔥 NUEVO: Función para regenerar SOLO plan de entrenamiento
  const handleRegeneratePlan = async () => {
    if (!user?.id || !profile?.preferences?.onboardingData) {
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pueden regenerar los datos. Completa el onboarding primero.'
        }
      })
      return
    }

    setIsRegenerating(true)
    try {
      console.log('🔄 Regenerando SOLO plan de entrenamiento...')
      
      // Regenerar SOLO plan de entrenamiento con IA
      const newTrainingPlan = await AIService.regenerateTrainingPlan(profile.preferences.onboardingData)
      
      // Guardar SOLO el nuevo plan de entrenamiento en Supabase
      if (user.id) {
        await TrainingService.saveTrainingProgram(user.id, newTrainingPlan)
        console.log('✅ Nuevo plan de entrenamiento guardado en BD')
      }
      
      // Actualizar perfil manteniendo el plan nutricional existente
      const updatedAiPlans = {
        ...profile.preferences.aiPlans,
        trainingPlan: newTrainingPlan // Solo actualizar entrenamiento
      }
      
      await updateProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          aiPlans: updatedAiPlans
        }
      })

      // El useEffect se encargará de actualizar el programa automáticamente

      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: '¡Plan de entrenamiento regenerado!',
          message: 'Tu nueva rutina ha sido creada con IA y guardada'
        }
      })
    } catch (error) {
      console.error('Error regenerando plan de entrenamiento:', error)
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pudo regenerar el plan de entrenamiento. Inténtalo de nuevo.'
        }
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  if (!state.training.currentProgram) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando tu plan personalizado...</p>
        </div>
      </div>
    )
  }

  const { currentProgram } = state.training
  const isAIGenerated = !!aiTrainingPlan

  return (
    <div className="space-y-8">
      {/* Program Header */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl text-primary-600 dark:text-primary-400">
                  {currentProgram.name}
                </CardTitle>
                {isAIGenerated && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full">
                    <Sparkles className="w-4 h-4" />
                    Generado por IA
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {currentProgram.description}
              </p>
              {isAIGenerated && profile?.preferences?.onboardingData && (
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Objetivo: {profile.preferences.onboardingData.primaryGoal.replace('_', ' ')}
                  </div>
                  <div>
                    Nivel: {profile.preferences.onboardingData.experienceLevel}
                  </div>
                  <div>
                    {profile.preferences.onboardingData.timePerWorkout} min/sesión
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="primary" size="lg">
                {currentProgram.frequency} días/semana
              </Badge>
              {isAIGenerated && (
                <Badge variant="outline" size="sm">
                  Plan personalizado
                </Badge>
              )}
              
              {/* 🔥 NUEVO: Botón para regenerar plan */}
              {isAIGenerated && profile?.preferences?.onboardingData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegeneratePlan}
                  disabled={isRegenerating}
                  leftIcon={isRegenerating ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                  className="mt-2"
                >
                  {isRegenerating ? 'Regenerando...' : 'Regenerar Plan'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>



      {/* Workout Days */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Días de Entrenamiento
        </h2>
        
        <div className="grid gap-6">
          {currentProgram.workoutDays && Array.isArray(currentProgram.workoutDays) ? (
            currentProgram.workoutDays.map((workoutDay) => {
              // 🔥 SOLUCION: Solo hay sesión activa si existe currentSession Y coinciden los IDs
              const hasCurrentSession = !!state.training.currentSession
              const workoutDayId = workoutDay.id
              const currentSessionWorkoutDayId = state.training.currentSession?.workoutDayId
              const isCurrentSession = hasCurrentSession && (currentSessionWorkoutDayId === workoutDayId)
              
              console.log(`🔍 DASHBOARD: ${workoutDay.name}`, {
                workoutDayId,
                currentSessionWorkoutDayId,
                hasCurrentSession,
                isCurrentSession,
                idsMatch: currentSessionWorkoutDayId === workoutDayId
              })
              
              return (
                <WorkoutDayCard
                  key={workoutDay.id}
                  workoutDay={workoutDay}
                  isCurrentSession={isCurrentSession}
                />
              )
            })
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>No hay días de entrenamiento disponibles.</p>
              <p className="text-sm mt-2">Por favor, configura tu programa de entrenamiento.</p>
            </div>
          )}
        </div>
      </div>

      {/* Program Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas del Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {currentProgram.duration}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Semanas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {currentProgram.workoutDays && Array.isArray(currentProgram.workoutDays) ? currentProgram.workoutDays.length : 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Días</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {currentProgram.workoutDays && Array.isArray(currentProgram.workoutDays) 
                  ? currentProgram.workoutDays.reduce((total, day) => total + (day.exercises?.length || 0), 0)
                  : 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Ejercicios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {currentProgram.workoutDays && Array.isArray(currentProgram.workoutDays) && currentProgram.workoutDays.length > 0
                  ? Math.round(currentProgram.workoutDays.reduce((total, day) => total + (day.estimatedDuration || 0), 0) / currentProgram.workoutDays.length)
                  : 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Min promedio</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}