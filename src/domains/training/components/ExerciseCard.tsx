import { useState, useEffect } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { WorkoutExercise } from '../types'
import { TrainingService } from '../services/trainingService'
import { Card, CardContent, Button, Badge, Input } from '@/shared/components/ui'
import { ExternalLink, CheckCircle, Plus, Target, AlertCircle, Save, X, Edit2, Trash2, History, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'

interface ExerciseCardProps {
  workoutExercise: WorkoutExercise
  exerciseNumber: number
  isActive: boolean
}

export const ExerciseCard = ({ workoutExercise, exerciseNumber, isActive }: ExerciseCardProps) => {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAddingSet, setIsAddingSet] = useState(false)
  const [newSetReps, setNewSetReps] = useState('')
  const [newSetWeight, setNewSetWeight] = useState('')
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null)
  const [editReps, setEditReps] = useState('')
  const [editWeight, setEditWeight] = useState('')
  
  // 🔥 NUEVO: Estado para historial del ejercicio
  const [lastPerformance, setLastPerformance] = useState<{
    lastSession: { date: string; sets: { reps: number; weight: number; notes?: string }[] } | null
    maxWeight: number
    totalReps: number
    recommendedWeight: number
  } | null>(null)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  
  // Verificar estructura y proporcionar fallbacks
  console.log('🔍 Estructura recibida en ExerciseCard:', {
    workoutExercise,
    hasExercise: !!workoutExercise.exercise,
    exerciseId: workoutExercise.exercise?.id,
    exerciseName: workoutExercise.exercise?.name,
    keys: Object.keys(workoutExercise)
  })
  
  const exercise = workoutExercise.exercise
  const plannedSets = workoutExercise.plannedSets || 3
  const plannedReps = workoutExercise.plannedReps || '8-12'

  // 🔥 SOLUCION TEMPORAL: Asegurar que el ejercicio tenga un ID válido
  if (!exercise.id && exercise.name) {
    // Generar ID a partir del nombre si no existe
    exercise.id = exercise.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/--+/g, '-')
    console.log('🆔 ID generado para ejercicio sin ID:', exercise.id)
  }

  console.log('🔍 Exercise procesado:', {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    hasId: !!exercise.id,
    exerciseStructure: Object.keys(exercise)
  })

  // 🔥 SOLUCION: Obtener datos del estado global en lugar del prop
  // Buscar el ejercicio actual en la sesión activa para obtener datos actualizados
  const getCurrentExerciseFromSession = () => {
    if (!state.training.currentSession || !exercise.id) {
      console.log('🔍 getCurrentExerciseFromSession: Sin sesión activa, usando props', {
        hasCurrentSession: !!state.training.currentSession,
        exerciseId: exercise.id,
        propsActualSets: workoutExercise.actualSets?.length || 0
      })
      return {
        actualSets: workoutExercise.actualSets || [],
        completed: workoutExercise.completed || false
      }
    }
    
    const currentExercise = state.training.currentSession.exercises.find(
      ex => ex.exercise.id === exercise.id
    )
    
    console.log('🔍 getCurrentExerciseFromSession: Con sesión activa', {
      exerciseId: exercise.id,
      foundExercise: !!currentExercise,
      currentExerciseId: currentExercise?.exercise.id,
      sessionSets: currentExercise?.actualSets?.length || 0,
      allSessionExercises: state.training.currentSession.exercises.map(ex => ({
        id: ex.exercise.id,
        name: ex.exercise.name,
        sets: ex.actualSets?.length || 0
      }))
    })
    
    return {
      actualSets: currentExercise?.actualSets || workoutExercise.actualSets || [],
      completed: currentExercise?.completed || workoutExercise.completed || false
    }
  }

  const { actualSets, completed } = getCurrentExerciseFromSession()
  
  console.log(`🔥 RENDER ${exercise.name}:`, {
    actualSetsLength: actualSets.length,
    actualSetsData: actualSets,
    hasCurrentSession: !!state.training.currentSession,
    exerciseId: exercise.id
  })

  // 🔥 NUEVO: Calcular semana de entrenamiento automáticamente
  const calculateCurrentWeek = (): number => {
    // Usar semana 1 por defecto hasta que se resuelvan los tipos
    // TODO: Implementar cálculo real cuando se actualicen las interfaces
    return 1
  }

  const currentWeek = calculateCurrentWeek()
  console.log(`📅 Semana actual de entrenamiento: ${currentWeek}`)

  // 🔥 NUEVO: Mostrar información de la semana en la UI
  const weekInfo = `Semana ${currentWeek}`

  // 🔥 REACTIVADO: Carga automática de historial
  useEffect(() => {
    const loadExerciseHistory = async () => {
      if (!user?.id || !exercise.id) return
      
      setIsLoadingHistory(true)
      try {
        console.log(`📊 Cargando historial para: ${exercise.name} (ID: ${exercise.id})`)
        const performance = await TrainingService.getLastExercisePerformance(user.id, exercise.id)
        setLastPerformance(performance)
        
        console.log(`📊 Historial cargado:`, performance)
        
        // Auto-llenar peso recomendado si no hay sets actuales y no estamos añadiendo una serie
        if (actualSets.length === 0 && performance.recommendedWeight > 0 && !isAddingSet) {
          console.log(`🎯 Pre-fill peso recomendado: ${performance.recommendedWeight}kg`)
        }
      } catch (error) {
        console.error('Error cargando historial del ejercicio:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadExerciseHistory()
  }, [user?.id, exercise.id, actualSets.length])

  const handleToggleComplete = () => {
    dispatch({
      type: 'EXERCISE_COMPLETE',
      payload: { exerciseId: exercise.id }
    })
    
    dispatch({
      type: 'NOTIFICATION_ADD',
      payload: {
        type: 'success',
        title: 'Ejercicio completado',
        message: `${exercise.name} ✓`
      }
    })
  }

  const handleAddSet = () => {
    setIsAddingSet(true)
    
    // 🔥 AUTO-FILL INTELIGENTE
    if (actualSets.length === 0) {
      // Primera serie: usar peso recomendado si hay historial
      if (lastPerformance && lastPerformance.recommendedWeight && lastPerformance.recommendedWeight > 0) {
        setNewSetWeight(lastPerformance.recommendedWeight.toString())
        console.log(`🎯 Auto-fill primera serie: ${lastPerformance.recommendedWeight}kg (recomendado)`)
      }
      // Si hay sets anteriores de la última sesión, usar las reps de la primera serie
      if (lastPerformance && lastPerformance.lastSession?.sets?.[0]) {
        setNewSetReps(lastPerformance.lastSession.sets[0].reps.toString())
        console.log(`🎯 Auto-fill primera serie: ${lastPerformance.lastSession.sets[0].reps} reps (del historial)`)
      }
    } else {
      // Series siguientes: usar datos de la serie anterior actual
      const lastSet = actualSets[actualSets.length - 1]
      if (lastSet) {
        setNewSetReps(lastSet.reps.toString())
        setNewSetWeight(lastSet.weight ? lastSet.weight.toString() : '')
        console.log(`🔄 Auto-fill serie ${actualSets.length + 1}: ${lastSet.reps} reps, ${lastSet.weight}kg (serie anterior)`)
      }
    }
  }

  const handleSaveSet = async () => {
    console.log('🔥🔥🔥 BOTON GUARDAR PRESIONADO!')
    if (!newSetReps) {
      console.log('❌ No hay reps, saliendo')
      return
    }

    const newSet = {
      reps: parseInt(newSetReps),
      weight: newSetWeight ? parseFloat(newSetWeight) : 0,
      completed: true,
      restTime: 90, // seconds
    }

    try {
      // 🔥 MEJORADO: Incluir semana de entrenamiento en la serie
      const setWithWeek = {
        ...newSet,
        weekNumber: currentWeek // Agregar semana actual
      }

      console.log('🚀 ANTES de dispatch - Estado actual:', {
        exerciseId: exercise.id,
        actualSetsLength: actualSets.length,
        newSetIndex: actualSets.length,
        setWithWeek,
        hasCurrentSession: !!state.training.currentSession
      })

      // 🔥 CAMBIO: Solo guardar en estado local, NO en BD
      // La BD se actualizará cuando se complete todo el día de entrenamiento
      dispatch({
        type: 'EXERCISE_SET_UPDATE',
        payload: {
          exerciseId: exercise.id,
          setIndex: actualSets.length,
          set: setWithWeek
        }
      })

      console.log('✅ DESPUÉS de dispatch - Serie enviada al reducer')

      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: 'Serie registrada localmente',
          message: `${newSetReps} reps${newSetWeight ? ` con ${newSetWeight}kg` : ''} - Semana ${currentWeek} - Se guardará al completar el día`
        }
      })

      console.log('🎯 PROCESO COMPLETO - Reseteando formulario')
      
      // Reset form
      setNewSetReps('')
      setNewSetWeight('')
      setIsAddingSet(false)
    } catch (error) {
      console.error('Error guardando set localmente:', error)
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pudo registrar la serie'
        }
      })
    }
  }

  const handleCancelSet = () => {
    setNewSetReps('')
    setNewSetWeight('')
    setIsAddingSet(false)
  }

  const handleEditSet = (index: number) => {
    const set = actualSets[index]
    setEditingSetIndex(index)
    setEditReps(set.reps.toString())
    setEditWeight(set.weight ? set.weight.toString() : '')
  }

  const handleSaveEdit = () => {
    if (!editReps || editingSetIndex === null) return

    const updatedSet = {
      reps: parseInt(editReps),
      weight: editWeight ? parseFloat(editWeight) : 0,
      completed: true,
      restTime: 90,
    }

    dispatch({
      type: 'EXERCISE_SET_UPDATE',
      payload: {
        exerciseId: exercise.id,
        setIndex: editingSetIndex,
        set: updatedSet
      }
    })

    dispatch({
      type: 'NOTIFICATION_ADD',
      payload: {
        type: 'success',
        title: 'Serie actualizada',
        message: `${editReps} reps${editWeight ? ` con ${editWeight}kg` : ''}`
      }
    })

    handleCancelEdit()
  }

  const handleCancelEdit = () => {
    setEditingSetIndex(null)
    setEditReps('')
    setEditWeight('')
  }

  const handleDeleteSet = (index: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta serie?')) {
      dispatch({
        type: 'EXERCISE_SET_DELETE',
        payload: {
          exerciseId: exercise.id,
          setIndex: index
        }
      })

      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: 'Serie eliminada',
          message: `Serie #${index + 1} eliminada`
        }
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success'
      case 'intermediate': return 'warning'
      case 'advanced': return 'danger'
      default: return 'default'
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      push: '💪',
      pull: '🔙',
      legs: '🦵',
      core: '🎯',
      cardio: '❤️'
    }
    return icons[category as keyof typeof icons] || '💪'
  }

  return (
    <Card 
      className={clsx(
        'transition-all duration-300 hover:shadow-md',
        completed && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-75',
        isActive && 'border-primary-300 dark:border-primary-600 shadow-lg',
        !isActive && !completed && 'hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Exercise header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={clsx(
                  "flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-colors duration-200",
                  completed 
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                    : "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
                )}>
                  {completed ? <CheckCircle size={16} /> : exerciseNumber}
                </div>
                <h5 className={clsx(
                  "font-semibold transition-colors duration-200",
                  completed ? "text-green-700 dark:text-green-400 line-through" : "text-gray-900 dark:text-white"
                )}>
                  {exercise.name}
                </h5>
                <span className="text-lg">{getCategoryIcon(exercise.category)}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" size="sm">
                  {plannedSets} series × {plannedReps} reps
                </Badge>
                <Badge variant={getDifficultyColor(exercise.difficulty)} size="sm">
                  {exercise.difficulty}
                </Badge>
                {/* 🔥 NUEVO: Mostrar semana actual */}
                <Badge variant="primary" size="sm" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                  📅 {weekInfo}
                </Badge>
                {completed && (
                  <Badge variant="success" size="sm" className="animate-pulse bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                    <CheckCircle size={12} className="mr-1" />
                    ✓ Completado
                  </Badge>
                )}
              </div>


              {/* 🔥 NUEVO: Historial del último entrenamiento */}
              {lastPerformance?.lastSession && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={14} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Último entrenamiento ({lastPerformance.lastSession.date})
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600 dark:text-gray-300">Max:</span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300">{lastPerformance.maxWeight}kg</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600 dark:text-gray-300">Total:</span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300">{lastPerformance.totalReps} reps</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        Recomendado: {lastPerformance.recommendedWeight}kg
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Sets anteriores: {lastPerformance.lastSession.sets.map(set => 
                      `${set.reps}×${set.weight}kg`
                    ).join(', ')}
                  </div>
                </div>
              )}

              {/* Mostrar cuando está cargando historial */}
              {isLoadingHistory && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Cargando historial...
                    </span>
                  </div>
                </div>
              )}

              {/* Mensaje si es primera vez haciendo el ejercicio */}
              {!isLoadingHistory && !lastPerformance?.lastSession && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      ¡Primer entrenamiento de este ejercicio! 🎯
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {exercise.videoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(exercise.videoUrl, '_blank')}
                  leftIcon={<ExternalLink size={14} />}
                >
                  Video
                </Button>
              )}
              
              {isActive && (
                <Button
                  variant={completed ? "success" : "outline"}
                  size="sm"
                  onClick={handleToggleComplete}
                  leftIcon={<CheckCircle size={14} />}
                >
                  {completed ? 'Completado' : 'Marcar'}
                </Button>
              )}
            </div>
          </div>

          {/* Exercise tips */}
          {exercise.tips?.length > 0 && (
            <div className="space-y-2">
              {exercise.tips?.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <AlertCircle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 dark:text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          )}


          {/* Sets tracking for active workouts */}
          {isActive && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h6 className="font-medium text-gray-900 dark:text-white">
                  Series registradas ({actualSets.length}/{plannedSets})
                </h6>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddSet}
                  leftIcon={<Plus size={14} />}
                  disabled={actualSets.length >= plannedSets || isAddingSet}
                >
                  Añadir serie
                </Button>
              </div>

              {actualSets.length > 0 && (
                <div className="space-y-2">
                  {actualSets.map((set, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                    >
                      <span className="font-medium w-12">#{index + 1}</span>
                      
                      {editingSetIndex === index ? (
                        // Edit mode
                        <>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editReps}
                              onChange={(e) => setEditReps(e.target.value)}
                              className="w-16 h-8 text-xs"
                              min="1"
                              max="50"
                            />
                            <span className="text-xs">reps</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.5"
                              value={editWeight}
                              onChange={(e) => setEditWeight(e.target.value)}
                              className="w-16 h-8 text-xs"
                              min="0"
                            />
                            <span className="text-xs">kg</span>
                          </div>
                          <div className="flex gap-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={!editReps}
                              className="h-12 w-12 p-0 text-blue-400 hover:text-blue-700"
                            >
                              <Save size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-12 w-12 p-0 text-red-400 hover:text-red-700"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </>
                      ) : (
                        // Display mode
                        <>
                          <span>{set.reps} reps</span>
                          {set.weight && <span>{set.weight} kg</span>}
                          {set.duration && <span>{set.duration} seg</span>}
                          <div className="flex-1" />
                          {set.completed && (
                            <CheckCircle size={14} className="text-success-600" />
                          )}
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSet(index)}
                              className="h-12 w-12 p-0 text-blue-600 text-blue-400 hover:text-blue-700"
                              title="Editar serie"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSet(index)}
                              className="h-12 w-12 p-0 opacity-70 hover:opacity-100 text-red-500 hover:text-red-600"
                              title="Eliminar serie"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add new set form */}
              {isAddingSet && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                  <h6 className="font-medium text-gray-900 dark:text-white text-sm">
                    Registrar nueva serie
                  </h6>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Repeticiones"
                      value={newSetReps}
                      onChange={(e) => setNewSetReps(e.target.value)}
                      min="1"
                      max="50"
                    />
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="Peso (kg)"
                      value={newSetWeight}
                      onChange={(e) => setNewSetWeight(e.target.value)}
                      min="0"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveSet}
                      disabled={!newSetReps}
                      leftIcon={<Save size={14} />}
                      className="flex-1"
                    >
                      Guardar serie
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelSet}
                      leftIcon={<X size={14} />}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {actualSets.length === 0 && !isAddingSet && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Haz clic en "Añadir serie" para comenzar a registrar
                </p>
              )}
            </div>
          )}

          {/* Toggle details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
          >
            {isExpanded ? 'Ocultar detalles' : 'Ver más detalles'}
          </Button>

          {/* Expanded details */}
          {isExpanded && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3 animate-slide-down">
              {exercise.description && (
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white mb-1">
                    Descripción completa
                  </h6>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {exercise.description}
                  </p>
                </div>
              )}
              
              {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                <div>
                  <h6 className="font-medium text-gray-900 dark:text-white mb-2">
                    Músculos objetivo
                  </h6>
                  <div className="flex flex-wrap gap-1">
                    {exercise.targetMuscles.map((muscle, index) => (
                      <Badge key={index} variant="outline" size="sm">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}