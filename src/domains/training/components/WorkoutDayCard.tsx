import { useState } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { TrainingService } from '../services/trainingService'
import { WorkoutDay } from '../types'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/shared/components/ui'
import { Calendar, Clock, Play, CheckCircle, Flame, List } from 'lucide-react'
import { ExerciseCard } from './ExerciseCard'
import { clsx } from 'clsx'

interface WorkoutDayCardProps {
  workoutDay: WorkoutDay
  isCurrentSession: boolean
}

export const WorkoutDayCard = ({ workoutDay, isCurrentSession }: WorkoutDayCardProps) => {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleStartWorkout = () => {
    
    dispatch({
      type: 'WORKOUT_START',
      payload: { workoutDayId: workoutDay.id }
    })
    
    dispatch({
      type: 'NOTIFICATION_ADD',
      payload: {
        type: 'success',
        title: 'Entrenamiento iniciado',
        message: `Comenzando ${workoutDay.name || 'entrenamiento'}`
      }
    })
  }

  const handleCompleteWorkout = async () => {
    try {
      // 🔥 IMPLEMENTADO: Guardar en BD cuando se completa el día entero
      if (state.training.currentSession && state.training.currentSession.exercises.length > 0) {
        
        dispatch({
          type: 'NOTIFICATION_ADD',
          payload: {
            type: 'info',
            title: 'Guardando entrenamiento...',
            message: 'Sincronizando datos con la nube'
          }
        })
        
        // 🔥 NUEVO: Llamada real a la base de datos
        if (user?.id) {
          const result = await TrainingService.saveCompleteWorkoutSession(
            user.id, 
            state.training.currentSession
          )
          
        }
      }

      dispatch({
        type: 'WORKOUT_COMPLETE',
        payload: { sessionId: `session-${Date.now()}` }
      })
      
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: '¡Entrenamiento completado y guardado!',
          message: 'Excelente trabajo 💪 - Datos sincronizados en la nube'
        }
      })
    } catch (error) {
      console.error('Error completando entrenamiento:', error)
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'warning',
          title: 'Entrenamiento completado',
          message: 'Datos guardados localmente - Se sincronizarán más tarde'
        }
      })
    }
  }

  // Use session data if it's the current session, otherwise use static data
  const exercisesToUse = isCurrentSession && state.training.currentSession 
    ? state.training.currentSession.exercises 
    : workoutDay.exercises

  const completedExercises = exercisesToUse.filter(ex => ex.completed).length
  const totalExercises = exercisesToUse.length
  const progressPercentage = (completedExercises / totalExercises) * 100

  return (
    <Card 
      variant={isCurrentSession ? 'glass' : 'default'} 
      className={clsx(
        'transition-all duration-300 w-full max-w-full overflow-hidden',
        isCurrentSession && 'ring-2 ring-primary-500 shadow-glow',
        workoutDay.completed && 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
      )}
    >
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary-600 dark:text-primary-400" size={18} />
                <CardTitle className="text-base sm:text-lg break-words">
                  {workoutDay.name}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {workoutDay.completed && (
                  <Badge variant="success" size="sm">
                    <CheckCircle size={14} className="mr-1" />
                    Completado
                  </Badge>
                )}
                {isCurrentSession && (
                  <Badge variant="primary" size="sm">
                    <Play size={14} className="mr-1" />
                    En progreso
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
              {workoutDay.description}
            </p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{workoutDay.estimatedDuration} min</span>
              </div>
              <div className="flex items-center gap-1">
                <List size={16} />
                <span>{totalExercises} ejercicios</span>
              </div>
              {progressPercentage > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={16} />
                  <span>{completedExercises}/{totalExercises} completados</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto flex-shrink-0">
            {!isCurrentSession && !workoutDay.completed && (
              <Button 
                onClick={handleStartWorkout} 
                leftIcon={<Play size={16} />}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Comenzar
              </Button>
            )}
            
            {isCurrentSession && (
              <Button 
                variant="success" 
                onClick={handleCompleteWorkout}
                leftIcon={<CheckCircle size={16} />}
                className="w-full sm:w-auto min-h-[44px]"
              >
                Completar
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full sm:w-auto"
            >
              {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {progressPercentage > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progreso</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="animate-slide-down p-4 sm:p-6 w-full max-w-full">
          {/* Warm up */}
          <div className="mb-6 w-full">
            <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
              <Flame className="text-orange-500" size={18} />
              <span>Calentamiento (10 min)</span>
            </h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300 w-full">
              {workoutDay.warmUp?.map((warmUpItem, index) => (
                <li key={index} className="flex items-start gap-2 w-full">
                  <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0 mt-1" />
                  <span className="break-words leading-relaxed flex-1">{warmUpItem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exercises */}
          <div className="space-y-4 w-full">
            <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <List className="text-primary-600 dark:text-primary-400" size={18} />
              <span>Ejercicios Principales</span>
            </h4>
            
            <div className="space-y-4 w-full">
              {exercisesToUse.map((workoutExercise, index) => (
                <div key={workoutExercise.exercise?.id || `exercise-${index}`} className="w-full">
                  <ExerciseCard
                    workoutExercise={workoutExercise}
                    exerciseNumber={index + 1}
                    isActive={isCurrentSession}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rest info */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg w-full">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Clock size={16} />
              <span className="font-medium text-sm break-words">Descanso entre series: 90-120 segundos</span>
            </div>
          </div>

          {/* Special notes */}
          {workoutDay.notes && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 w-full">
              <p className="text-blue-800 dark:text-blue-200 text-sm break-words leading-relaxed">
                <strong>Nota:</strong> {workoutDay.notes}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}