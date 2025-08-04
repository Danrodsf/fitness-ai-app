import { useEffect, useState } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { TrainingService } from '@/domains/training/services/trainingService'
import { useProgressData } from '../hooks/useProgressData'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/shared/components/ui'
import { TrendingUp, TrendingDown, Target, Award, Activity, BarChart3 } from 'lucide-react'
import { calculateSmartWeightGoal, UserData } from '../utils/smartWeightGoals'
import { WeightTracker } from './WeightTracker'
import { MilestonesCard } from './MilestonesCard'
import { ProgressStats } from './ProgressStats'
import { BMICard } from './BMICard'
import { SmartWeightGoals } from './SmartWeightGoals'
import { defaultMilestones, sampleWeightEntries, generatePersonalizedMilestones } from '../data/progressData'

export const ProgressDashboard = () => {
  const { state, dispatch } = useAppContext()
  const { profile, user } = useAuth()
  
  // 🔥 SOLUCIÓN DEFINITIVA: Custom hook que maneja carga de datos UNA VEZ
  useProgressData()
  
  // 🔥 NUEVO: Estado para progreso de ejercicios
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

        // 🔥 ARREGLADO: Obtener ejercicios reales del usuario en lugar de lista hardcoded
        console.log('🔍 Obteniendo ejercicios disponibles del usuario...')
        const availableExercises = await TrainingService.getAvailableExercises(user.id)
        
        console.log(`🔍 DEBUG: ${availableExercises.totalSessions} sesiones, ${availableExercises.ids.length} ejercicios únicos`)
        
        if (availableExercises.ids.length === 0) {
          console.log('📊 No hay ejercicios disponibles, mostrando mensaje vacío')
          setExerciseProgress([])
          setIsLoadingProgress(false)
          return
        }
        
        const progressResults = await Promise.allSettled(
          availableExercises.ids.map(async (exerciseId: string) => {
            try {
              console.log(`📊 Obteniendo progreso para: ${exerciseId}`)
              const chartData = await TrainingService.getExerciseProgressChart(user.id, exerciseId, 8)
              
              // Buscar nombre legible del ejercicio
              const exerciseName = availableExercises.names.find(name => 
                TrainingService.normalizeExerciseName(name) === exerciseId
              ) || exerciseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              
              console.log(`📊 Resultado para ${exerciseId}: ${chartData.length} puntos de datos`)
              
              return {
                exerciseId,
                name: exerciseName,
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
          .filter((result): result is PromiseFulfilledResult<{
            exerciseId: string;
            name: string;
            weeklyData: Array<{ date: string; maxWeight: number; totalReps: number; trend: string }>;
          }> => 
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
  
  // 🔥 NUEVO: Calcular objetivo inteligente usando sistema científico
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
    
    console.log('🎯 Dashboard: Objetivo inteligente calculado:', {
      currentWeight,
      targetWeight: smartGoal.targetWeight,
      strategy: smartGoal.strategy,
      timeframe: smartGoal.timeframe,
      userData
    })
    
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
              {smartTarget.strategy}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {smartTarget.timeframe ? `${smartTarget.timeframe} meses` : ''}
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Activity className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {targetWeight > currentWeight ? 
                `+${(targetWeight - currentWeight).toFixed(1)}` : 
                `${(targetWeight - currentWeight).toFixed(1)}`}kg
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {targetWeight > currentWeight ? 'Por ganar' : 
               targetWeight < currentWeight ? 'Por perder' : 'Mantener'}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {state.progress.stats?.totalDaysTracked ? 
                `${state.progress.stats.totalDaysTracked} días registrados` : 
                'Comenzar seguimiento'}
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
          <SmartWeightGoals />
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
                        {exercise.weeklyData.length} sesiones
                      </Badge>
                      {exercise.weeklyData.length > 1 && (
                        <Badge 
                          variant={
                            (exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0) >= (exercise.weeklyData[0]?.maxWeight || 0) 
                              ? "success" 
                              : "danger"
                          } 
                          size="sm"
                        >
                          {(exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0) >= (exercise.weeklyData[0]?.maxWeight || 0) ? (
                            <TrendingUp size={12} className="mr-1" />
                          ) : (
                            <TrendingDown size={12} className="mr-1" />
                          )}
                          {Math.round(((exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0) - (exercise.weeklyData[0]?.maxWeight || 0)) * 100) / 100}kg
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Gráfico de líneas con SVG */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Progresión de peso máximo</span>
                      <span>{exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0}kg</span>
                    </div>
                    
                    {exercise.weeklyData.length > 1 ? (
                      <div className="relative">
                        <svg 
                          viewBox="0 0 400 100" 
                          className="w-full h-20 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          {(() => {
                            const data = exercise.weeklyData
                            const maxWeight = Math.max(...data.map(d => d.maxWeight))
                            const minWeight = Math.min(...data.map(d => d.maxWeight))
                            const weightRange = maxWeight - minWeight
                            const padding = 20
                            const width = 400 - (padding * 2)
                            const height = 100 - (padding * 2)
                            
                            // Calcular puntos de la línea
                            const points = data.map((point, index) => {
                              const x = padding + (index / (data.length - 1)) * width
                              const y = weightRange > 0 
                                ? padding + height - ((point.maxWeight - minWeight) / weightRange) * height
                                : padding + height / 2
                              return { x, y, weight: point.maxWeight, trend: point.trend }
                            })
                            
                            // Crear path de línea
                            const pathData = points.map((point, index) => 
                              `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                            ).join(' ')
                            
                            return (
                              <>
                                {/* Grid lines */}
                                <defs>
                                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
                                  </pattern>
                                </defs>
                                <rect width="400" height="100" fill="url(#grid)" className="text-gray-400"/>
                                
                                {/* Línea principal */}
                                <path
                                  d={pathData}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className="text-primary-500"
                                />
                                
                                {/* Puntos de datos */}
                                {points.map((point, index) => (
                                  <g key={index}>
                                    <circle
                                      cx={point.x}
                                      cy={point.y}
                                      r="4"
                                      fill="currentColor"
                                      className={`
                                        ${point.trend === 'up' ? 'text-green-500' : 
                                          point.trend === 'down' ? 'text-red-500' : 
                                          'text-primary-500'}
                                      `}
                                      stroke="white"
                                      strokeWidth="2"
                                    />
                                    <title>{`Sesión ${index + 1}: ${point.weight}kg`}</title>
                                  </g>
                                ))}
                              </>
                            )
                          })()}
                        </svg>
                      </div>
                    ) : (
                      <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <span className="text-sm">Necesitas más sesiones para ver la progresión</span>
                      </div>
                    )}
                    
                    {/* Fechas de cada sesión */}
                    <div className="relative text-xs text-gray-500 dark:text-gray-400 mt-2 h-6">
                      {exercise.weeklyData.map((session, index) => {
                        const data = exercise.weeklyData
                        const padding = 20
                        const width = 400 - (padding * 2)
                        
                        // Calcular posición (manejar caso de una sola sesión)
                        const leftPosition = data.length > 1 
                          ? padding + (index / (data.length - 1)) * width
                          : padding + width / 2  // Centrar si solo hay una sesión
                        const leftPercentage = (leftPosition / 400) * 100
                        
                        // Mostrar fechas inteligentemente para evitar solapamiento
                        const shouldShowDate = data.length <= 4 || // Si hay pocas sesiones, mostrar todas
                          index === 0 || // Siempre mostrar primera
                          index === data.length - 1 || // Siempre mostrar última
                          index % Math.ceil(data.length / 4) === 0 // Mostrar cada N sesiones
                        
                        if (!shouldShowDate) return null
                        
                        return (
                          <div 
                            key={index}
                            className="absolute text-center transform -translate-x-1/2"
                            style={{ left: `${leftPercentage}%` }}
                          >
                            <div className="text-xs whitespace-nowrap bg-white dark:bg-gray-900 px-1 rounded shadow-sm">
                              {session.date}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Estadísticas del ejercicio */}
                  <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {exercise.weeklyData[0]?.maxWeight || 0}kg
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Peso Inicial</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0}kg
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Peso Actual</div>
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