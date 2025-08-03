import { useEffect, useState } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { TrainingService } from '@/domains/training/services/trainingService'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/shared/components/ui'
import { TrendingUp, Target, Calendar, Award, Activity, BarChart3 } from 'lucide-react'
import { WeightTracker } from './WeightTracker'
import { MilestonesCard } from './MilestonesCard'
import { ProgressStats } from './ProgressStats'
import { BMICard } from './BMICard'
import { defaultMilestones, sampleWeightEntries, generatePersonalizedMilestones } from '../data/progressData'

export const ProgressDashboard = () => {
  const { state, dispatch } = useAppContext()
  const { profile, user } = useAuth()
  
  // 🔥 NUEVO: Estado para progreso de ejercicios
  const [exerciseProgress, setExerciseProgress] = useState<{ 
    exerciseId: string; 
    name: string; 
    weeklyData: { week: string; maxWeight: number; totalVolume: number }[] 
  }[]>([])
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

    // 🔥 NUEVO: Generar objetivos personalizados basados en el perfil del usuario
    if (state.progress.milestones.length === 0 && profile) {
      console.log('📊 Generando objetivos personalizados...')
      
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
      
      console.log(`✅ ${personalizedMilestones.length} objetivos personalizados generados`)
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
        console.log('📊 Cargando progreso de ejercicios con método optimizado...')
        
        // Primero verificar si tenemos sesiones completadas
        const trainingStats = await TrainingService.getTrainingStats(user.id)
        
        if (!trainingStats || trainingStats.length === 0) {
          console.log('📊 No hay datos de entrenamiento aún')
          setExerciseProgress([])
          return
        }

        // Obtener lista de ejercicios comunes para mostrar progreso
        const commonExercises = [
          'press-pecho-maquina', 'remo-con-mancuernas', 'sentadillas',
          'press-militar', 'peso-muerto', 'dominadas', 'flexiones',
          'curl-biceps', 'tricep-dips', 'plancha'
        ]
        
        const progressResults = await Promise.allSettled(
          commonExercises.map(async (exerciseId) => {
            try {
              const chartData = await TrainingService.getExerciseProgressChart(user.id, exerciseId, 8)
              return {
                exerciseId,
                name: exerciseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                weeklyData: chartData || []
              }
            } catch (error) {
              console.warn(`⚠️ No se pudo cargar progreso para ${exerciseId}:`, error)
              return null
            }
          })
        )
        
        // Filtrar solo resultados exitosos con datos
        const validProgress = progressResults
          .filter((result): result is PromiseFulfilledResult<any> => 
            result.status === 'fulfilled' && result.value && result.value.weeklyData.length > 0
          )
          .map(result => result.value)
        
        console.log(`📊 Progreso cargado para ${validProgress.length} ejercicios`)
        setExerciseProgress(validProgress)
        
      } catch (error) {
        console.error('Error cargando progreso de ejercicios:', error)
        // En caso de error, no mostrar nada pero no romper la UI
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
  
  // 🔥 ARREGLADO: Obtener objetivos del onboarding
  const onboardingData = profile?.preferences?.onboardingData
  const primaryGoal = onboardingData?.primaryGoal || 'general_health'
  
  // Calcular peso objetivo basado en el objetivo del onboarding
  const targetWeight = onboardingData?.targetWeight || 
    (primaryGoal === 'lose_weight' ? Math.max(currentWeight * 0.9, currentWeight - 10) :
     primaryGoal === 'gain_muscle' ? currentWeight + 5 :
     currentWeight) // Para maintain o general_health, mantener peso actual
  
  const initialWeight = profile?.weight // Peso inicial del registro

  return (
    <div className="space-y-8">
      {/* Progress Header */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-primary-600 dark:text-primary-400">
                Seguimiento de Progreso
              </CardTitle>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Registra tu evolución y alcanza tus objetivos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-success-600 dark:text-success-400" size={24} />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {currentWeight}kg
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Peso Actual
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Target className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {Math.round(targetWeight)}kg
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Objetivo ({primaryGoal === 'lose_weight' ? 'Perder peso' : 
                       primaryGoal === 'gain_muscle' ? 'Ganar músculo' : 
                       primaryGoal === 'improve_endurance' ? 'Resistencia' : 'Salud general'})
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {state.progress.stats?.totalDaysTracked || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Días Registrados
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Award className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {state.progress.milestones.filter(m => m.completed).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Logros
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <WeightTracker />
          <BMICard 
            currentWeight={currentWeight} 
            height={userHeight}
            targetWeight={targetWeight}
            initialWeight={initialWeight}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <MilestonesCard />
          <ProgressStats />
        </div>
      </div>

      {/* 🔥 NUEVO: Progreso de Ejercicios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="text-primary-600 dark:text-primary-400" />
            💪 Progreso de Fuerza por Ejercicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProgress ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Analizando tu progreso...</p>
            </div>
          ) : exerciseProgress.length > 0 ? (
            <div className="space-y-6">
              {exerciseProgress.map((exercise) => (
                <div key={exercise.exerciseId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {exercise.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        {exercise.weeklyData.length} semanas
                      </Badge>
                      <Badge variant="success" size="sm">
                        <TrendingUp size={12} className="mr-1" />
                        +{Math.round(((exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0) - (exercise.weeklyData[0]?.maxWeight || 0)) * 100) / 100}kg
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Gráfico simple con CSS */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Peso máximo por semana</span>
                      <span>{exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0}kg</span>
                    </div>
                    <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-end">
                      {exercise.weeklyData.map((week, index) => {
                        const maxInExercise = Math.max(...exercise.weeklyData.map(w => w.maxWeight))
                        const height = maxInExercise > 0 ? (week.maxWeight / maxInExercise) * 100 : 0
                        return (
                          <div
                            key={week.week}
                            className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 mx-0.5 rounded-t-sm transition-all duration-300 hover:opacity-80"
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`${week.week}: ${week.maxWeight}kg`}
                          />
                        )
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{exercise.weeklyData[0]?.week}</span>
                      <span>{exercise.weeklyData[exercise.weeklyData.length - 1]?.week}</span>
                    </div>
                  </div>

                  {/* Estadísticas del ejercicio */}
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {exercise.weeklyData[0]?.maxWeight || 0}kg
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Inicial</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0}kg
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Actual</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {Math.round(exercise.weeklyData.reduce((sum, w) => sum + w.totalVolume, 0))}kg
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Volumen Total</div>
                    </div>
                  </div>
                </div>
              ))}
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
        </CardContent>
      </Card>
    </div>
  )
}