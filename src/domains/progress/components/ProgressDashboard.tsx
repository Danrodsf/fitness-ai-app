import { useEffect, useState } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { TrainingService } from '@/domains/training/services/trainingService'
import { useProgressData } from '../hooks/useProgressData'
import { Card, CardHeader, CardTitle, CardContent, Badge, DashboardSection, Collapsible } from '@/shared/components/ui'
import { TrendingUp, Target, Award, Activity, BarChart3 } from 'lucide-react'
import { calculateSmartWeightGoal, UserData } from '../utils/smartWeightGoals'
import { WeightTracker } from './WeightTracker'
import { MilestonesCard } from './MilestonesCard'
import { ProgressStats } from './ProgressStats'
import { BMICard } from './BMICard'
import { SmartWeightGoals } from './SmartWeightGoals'
import { ProgressInsightsCard } from '@/shared/components/ProgressInsightsCard'
import { ExerciseProgressCard } from './ExerciseProgressCard'
import { defaultMilestones, sampleWeightEntries, generatePersonalizedMilestones } from '../data/progressData'

export const ProgressDashboard = () => {
  const { state, dispatch } = useAppContext()
  const { profile, user } = useAuth()
  
  // Custom hook that manages data loading once
  useProgressData()
  
  // Estado para progreso de ejercicios
  const [exerciseProgress, setExerciseProgress] = useState<Array<{ 
    exerciseId: string; 
    name: string; 
    weeklyData: Array<{ date: string; maxWeight: number; totalReps: number; trend: string }> 
  }>>([])
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)

  // Load default progress data on mount
  useEffect(() => {
    // Load sample weight entries if none exist
    if (state.progress.weightHistory.length === 0) {
      sampleWeightEntries.forEach(entry => {
        dispatch({
          type: 'WEIGHT_ENTRY_ADD',
          payload: entry,
        })
      })
    }

    // Generar objetivos personalizados basados en el perfil del usuario
    if (state.progress.milestones.length === 0 && profile) {
      // Obtener datos del onboarding si están disponibles
      const onboardingData = profile.preferences?.onboardingData
      
      const userProfileForMilestones = {
        age: profile.age || 25,
        weight: profile.weight || 70,
        height: profile.height || 170,
        goals: profile.goals || ['improve_fitness'],
        experienceLevel: onboardingData?.experienceLevel || 'beginner',
        primaryGoal: onboardingData?.primaryGoal || profile.goals?.[0] || 'improve_fitness'
      }
      
      const personalizedMilestones = generatePersonalizedMilestones(userProfileForMilestones)
      
      personalizedMilestones.forEach(milestone => {
        dispatch({
          type: 'MILESTONE_ADD',
          payload: milestone,
        })
      })
      
    } else if (state.progress.milestones.length === 0) {
      // Fallback a objetivos por defecto si no hay perfil
      defaultMilestones.forEach(milestone => {
        dispatch({
          type: 'MILESTONE_ADD',
          payload: milestone,
        })
      })
    }

    // Calculate initial stats
    if (!state.progress.stats) {
      dispatch({ type: 'STATS_CALCULATE' })
    }
  }, [state.progress.weightHistory.length, state.progress.milestones.length, state.progress.stats, dispatch])

  // 🔥 ACTIVADO: Cargar progreso de ejercicios (optimizado con JSON)
  useEffect(() => {
    const loadExerciseProgress = async () => {
      if (!user?.id) return
      
      setIsLoadingProgress(true)
      try {
        
        // Primero verificar si tenemos sesiones completadas
        const trainingStats = await TrainingService.getTrainingStats(user.id)
        
        if (!trainingStats || trainingStats.length === 0) {
          setExerciseProgress([])
          return
        }

        // 🔥 ARREGLADO: Obtener ejercicios reales del usuario en lugar de lista hardcoded
        const availableExercises = await TrainingService.getAvailableExercises(user.id)
        
        if (!availableExercises?.exercises?.length) {
          setExerciseProgress([])
          setIsLoadingProgress(false)
          return
        }
        
        const progressResults = await Promise.allSettled(
          availableExercises.exercises.map(async (exercise: any) => {
            try {
              const chartData = await TrainingService.getExerciseProgressChart(user.id, exercise.allIds, 8)
              
              return {
                exerciseId: exercise.id,
                name: exercise.name,
                baseName: exercise.baseName,
                weeklyData: chartData || []
              }
            } catch {
              return null
            }
          })
        )
        
        // Filtrar solo resultados exitosos con datos
        const validProgress = progressResults
          .filter((result: any) => 
            result.status === 'fulfilled' && result.value && result.value.weeklyData && result.value.weeklyData.length > 0
          )
          .map((result: any) => result.value)
        
        setExerciseProgress(validProgress)
        
      } catch {
        setExerciseProgress([])
      } finally {
        setIsLoadingProgress(false)
      }
    }

    loadExerciseProgress()
  }, [user?.id])

  // Usar datos del perfil del usuario autenticado
  const currentWeight = state.progress.weightHistory[0]?.weight || profile?.weight || 70
  const userHeight = profile?.height || 170
  
  // Obtener objetivos del onboarding
  const onboardingData = profile?.preferences?.onboardingData
  const primaryGoal = onboardingData?.primaryGoal || 'general_health'
  
  // Calcular objetivo inteligente usando sistema científico
  const getSmartWeightTarget = () => {
    if (!profile || currentWeight === 0) return { targetWeight: currentWeight, strategy: 'Cargando...' }
    
    const userData: UserData = {
      currentWeight,
      height: userHeight,
      age: profile.age,
      gender: 'male', // Se podría obtener del perfil
      experienceLevel: 'beginner', // Se podría obtener del perfil  
      primaryGoal: primaryGoal === 'lose_weight' ? 'lose_weight' :
                   primaryGoal === 'gain_muscle' ? 'gain_muscle' : 'maintain_weight',
      activityLevel: 'moderate'
    }
    
    const smartGoal = calculateSmartWeightGoal(userData)
    
    return {
      targetWeight: smartGoal.targetWeight,
      strategy: smartGoal.strategy,
      timeframe: smartGoal.timeframe
    }
  }
  
  const smartTarget = getSmartWeightTarget()
  const targetWeight = onboardingData?.targetWeight || smartTarget.targetWeight
  
  const initialWeight = profile?.weight // Peso inicial del registro

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Progress Header */}
      <Card variant="glass">
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl text-primary-600 dark:text-primary-400">
                Seguimiento de Progreso
              </CardTitle>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Registra tu evolución y alcanza tus objetivos
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <TrendingUp className="text-success-600 dark:text-success-400" size={20} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="text-primary-600 dark:text-primary-400" size={16} />
            </div>
            <div className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-1">
              {currentWeight}kg
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Peso Actual
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Target className="text-orange-600 dark:text-orange-400" size={16} />
            </div>
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-1">
              {Math.round(targetWeight)}kg
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {smartTarget.strategy}
            </div>
            {smartTarget.timeframe && (
              <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                {smartTarget.timeframe}m
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Activity className="text-green-600 dark:text-green-400" size={16} />
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400 mb-1">
              {targetWeight > currentWeight ? 
                `+${(targetWeight - currentWeight).toFixed(1)}` : 
                `${(targetWeight - currentWeight).toFixed(1)}`}kg
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {targetWeight > currentWeight ? 'Por ganar' : 
               targetWeight < currentWeight ? 'Por perder' : 'Mantener'}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              {state.progress.stats?.totalDaysTracked ? 
                `${state.progress.stats.totalDaysTracked} días` : 
                'Comenzar'}
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Award className="text-purple-600 dark:text-purple-400" size={16} />
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
              {state.progress.milestones.filter(m => m.completed).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Logros
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Metrics - Always Visible */}
      <div className="space-y-6">
        <WeightTracker />
        <ProgressInsightsCard />
      </div>
      
      {/* Advanced Analytics - Progressive Disclosure */}
      <DashboardSection
        title="Análisis Avanzado"
        description="BMI, metas inteligentes y estadísticas detalladas"
        icon={BarChart3}
        defaultOpen={false}
        badge={<Badge variant="primary" size="sm">Nuevo</Badge>}
      >
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <BMICard 
              currentWeight={currentWeight} 
              height={userHeight}
              targetWeight={targetWeight}
              initialWeight={initialWeight}
            />
            <SmartWeightGoals />
          </div>
          <div className="space-y-6">
            <ProgressStats />
          </div>
        </div>
      </DashboardSection>
      
      {/* Milestones - Separate Section */}
      <DashboardSection
        title="Logros y Objetivos"
        description="Sigue tu progreso hacia metas específicas"
        icon={Award}
        defaultOpen={true}
        badge={<Badge variant="success" size="sm">{state.progress.milestones.filter(m => m.completed).length} completados</Badge>}
      >
        <MilestonesCard />
      </DashboardSection>

      {/* Exercise Progress - Progressive Disclosure */}
      <DashboardSection
        title="Progreso de Fuerza por Ejercicio"
        description="Gráficos detallados de evolución en cada ejercicio"
        icon={Activity}
        defaultOpen={exerciseProgress.length > 0 && exerciseProgress.length <= 3} // Auto-expand si hay pocos ejercicios
        badge={exerciseProgress.length > 0 && <Badge variant="outline" size="sm">{exerciseProgress.length} ejercicios</Badge>}
      >
        <div className="space-y-6">
          {isLoadingProgress ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Analizando tu progreso...</p>
            </div>
          ) : exerciseProgress.length > 0 ? (
            // Mostrar máximo 2 ejercicios expandidos inicialmente
            <div className="space-y-4">
              {exerciseProgress.slice(0, 2).map((exercise) => (
                <ExerciseProgressCard key={exercise.exerciseId} exercise={exercise} />
              ))}
              
              {exerciseProgress.length > 2 && (
                <Collapsible
                  trigger={`Ver ${exerciseProgress.length - 2} ejercicios más`}
                  defaultOpen={false}
                  variant="minimal"
                >
                  <div className="space-y-4 mt-4">
                    {exerciseProgress.slice(2).map((exercise) => (
                      <ExerciseProgressCard key={exercise.exerciseId} exercise={exercise} />
                    ))}
                  </div>
                </Collapsible>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Activity size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">¡Comienza a entrenar!</h3>
              <p>
                Registra tus primeros entrenamientos para ver tu progreso de fuerza aquí.
                <br />
                <span className="text-sm">💪 Cada set que registres construye tu historial de progreso</span>
              </p>
            </div>
          )}
        </div>
      </DashboardSection>
    </div>
  )
}