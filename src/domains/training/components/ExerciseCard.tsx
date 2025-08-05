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
  }


  // 🔥 SOLUCION: Obtener datos del estado global en lugar del prop
  // Buscar el ejercicio actual en la sesión activa para obtener datos actualizados
  const getCurrentExerciseFromSession = () => {
    if (!state.training.currentSession || !exercise.id) {
      return {
        actualSets: workoutExercise.actualSets || [],
        completed: workoutExercise.completed || false
      }
    }
    
    const currentExercise = state.training.currentSession.exercises.find(
      ex => ex.exercise.id === exercise.id
    )
    
    
    return {
      actualSets: currentExercise?.actualSets || workoutExercise.actualSets || [],
      completed: currentExercise?.completed || workoutExercise.completed || false
    }
  }

  const { actualSets, completed } = getCurrentExerciseFromSession()
  

  // 🔥 NUEVO: Calcular semana de entrenamiento automáticamente
  const calculateCurrentWeek = (): number => {
    // Usar semana 1 por defecto hasta que se resuelvan los tipos
    // TODO: Implementar cálculo real cuando se actualicen las interfaces
    return 1
  }

  const currentWeek = calculateCurrentWeek()

  // 🔥 NUEVO: Mostrar información de la semana en la UI
  const weekInfo = `Semana ${currentWeek}`

  // 🔥 REACTIVADO: Carga automática de historial
  useEffect(() => {
    const loadExerciseHistory = async () => {
      if (!user?.id || !exercise.id) return
      
      setIsLoadingHistory(true)
      try {
        const performance = await TrainingService.getLastExercisePerformance(user.id, exercise.id)
        setLastPerformance(performance)
        
        
        // Auto-llenar peso recomendado si no hay sets actuales y no estamos añadiendo una serie
        if (actualSets.length === 0 && performance.recommendedWeight > 0 && !isAddingSet) {
        }
      } catch (error) {
        console.error('Error cargando historial del ejercicio:', error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadExerciseHistory()
  }, [user?.id, exercise.id])

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
      }
      // Si hay sets anteriores de la última sesión, usar las reps de la primera serie
      if (lastPerformance && lastPerformance.lastSession?.sets?.[0]) {
        setNewSetReps(lastPerformance.lastSession.sets[0].reps.toString())
      }
    } else {
      // Series siguientes: usar datos de la serie anterior actual
      const lastSet = actualSets[actualSets.length - 1]
      if (lastSet) {
        setNewSetReps(lastSet.reps.toString())
        setNewSetWeight(lastSet.weight ? lastSet.weight.toString() : '')
      }
    }
  }

  const handleSaveSet = async () => {
    if (!newSetReps) {
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


      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: 'Serie registrada localmente',
          message: `${newSetReps} reps${newSetWeight ? ` con ${newSetWeight}kg` : ''} - Semana ${currentWeek} - Se guardará al completar el día`
        }
      })

      
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
        'transition-all duration-300 hover:shadow-md max-w-full overflow-hidden',
        completed && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 opacity-75',
        isActive && 'border-primary-300 dark:border-primary-600 shadow-lg',
        !isActive && !completed && 'hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <CardContent className="p-2 sm:p-4 max-w-full overflow-hidden">
        <div className="space-y-2 sm:space-y-3">
          {/* Exercise header */}
          <div className="w-full">
            {/* Title and basic info */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className={clsx(
                "flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-full font-semibold text-sm transition-colors duration-200 flex-shrink-0",
                completed 
                  ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                  : "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
              )}>
                {completed ? <CheckCircle size={16} /> : exerciseNumber}
              </div>
              <div className="flex-1 min-w-0">
                <h5 className={clsx(
                  "font-semibold transition-colors duration-200 text-base sm:text-lg break-words",
                  completed ? "text-green-700 dark:text-green-400 line-through" : "text-gray-900 dark:text-white"
                )}>
                  {exercise.name}
                </h5>
              </div>
              <span className="text-xl sm:text-lg flex-shrink-0">{getCategoryIcon(exercise.category)}</span>
            </div>
            
            {/* Badges and action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" size="sm" className="text-xs sm:text-sm">
                  {plannedSets} series × {plannedReps} reps
                </Badge>
                <Badge variant={getDifficultyColor(exercise.difficulty)} size="sm" className="text-xs sm:text-sm">
                  {exercise.difficulty}
                </Badge>
                {/* 🔥 NUEVO: Mostrar semana actual */}
                <Badge variant="primary" size="sm" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs sm:text-sm">
                  📅 {weekInfo}
                </Badge>
                {completed && (
                  <Badge variant="success" size="sm" className="animate-pulse bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700 text-xs sm:text-sm">
                    <CheckCircle size={12} className="mr-1" />
                    ✓ Completado
                  </Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {exercise.videoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(exercise.videoUrl, '_blank')}
                    leftIcon={<ExternalLink size={16} />}
                    className="min-h-[44px] px-4 text-sm w-full sm:w-auto justify-center"
                  >
                    Ver Video
                  </Button>
                )}
                
                {isActive && (
                  <Button
                    variant={completed ? "success" : "outline"}
                    size="sm"
                    onClick={handleToggleComplete}
                    leftIcon={<CheckCircle size={16} />}
                    className="min-h-[44px] px-4 text-sm w-full sm:w-auto justify-center font-medium"
                  >
                    {completed ? '✓ Completado' : 'Marcar como hecho'}
                  </Button>
                )}
              </div>
            </div>

            {/* Full-width status components */}
            {/* 🔥 NUEVO: Historial del último entrenamiento */}
            {lastPerformance?.lastSession && (
              <div className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-4 mb-2 sm:mb-3">
                <div className="flex items-center gap-2 mb-2 sm:mb-3 w-full">
                  <History size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200 break-words flex-1">
                    Último entrenamiento ({lastPerformance.lastSession.date})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm mb-2 sm:mb-3 w-full">
                  <div className="flex items-center justify-between sm:justify-start gap-2 w-full">
                    <span className="text-gray-600 dark:text-gray-300">Max:</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">{lastPerformance.maxWeight}kg</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-2 w-full">
                    <span className="text-gray-600 dark:text-gray-300">Total:</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">{lastPerformance.totalReps} reps</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-2 w-full">
                    <TrendingUp size={16} className="text-green-500 flex-shrink-0" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Rec: {lastPerformance.recommendedWeight}kg
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 break-words bg-white dark:bg-gray-700 rounded p-2 sm:p-3 w-full">
                  <span className="font-medium">Series anteriores:</span> {lastPerformance.lastSession.sets.map(set => 
                    `${set.reps}×${set.weight}kg`
                  ).join(', ')}
                </div>
              </div>
            )}

            {/* Mostrar cuando está cargando historial */}
            {isLoadingHistory && (
              <div className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3">
                <div className="flex items-center justify-center gap-3 w-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Cargando historial...
                  </span>
                </div>
              </div>
            )}

            {/* Mensaje si es primera vez haciendo el ejercicio */}
            {!isLoadingHistory && !lastPerformance?.lastSession && (
              <div className="w-full bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 sm:p-4 mb-2 sm:mb-3">
                <div className="flex items-center justify-center gap-3 w-full">
                  <Target size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    ¡Primer entrenamiento! 🎯
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Exercise tips */}
          {exercise.tips?.length > 0 && (
            <div className="space-y-2 sm:space-y-3 w-full">
              {exercise.tips?.map((tip, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2 sm:p-3 w-full">
                  <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 break-words leading-relaxed flex-1">{tip}</span>
                </div>
              ))}
            </div>
          )}


          {/* Sets tracking for active workouts */}
          {isActive && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                <h6 className="font-semibold text-gray-900 dark:text-white text-base">
                  Series registradas ({actualSets.length}/{plannedSets})
                </h6>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddSet}
                  leftIcon={<Plus size={16} />}
                  disabled={actualSets.length >= plannedSets || isAddingSet}
                  className="min-h-[44px] px-4 text-sm w-full sm:w-auto justify-center font-medium"
                >
                  Añadir serie
                </Button>
              </div>

              {actualSets.length > 0 && (
                <div className="space-y-2 sm:space-y-3 w-full">
                  {actualSets.map((set, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700 w-full"
                    >
                      <span className="font-semibold w-12 text-base flex-shrink-0 text-primary-600 dark:text-primary-400">#{index + 1}</span>
                      
                      {editingSetIndex === index ? (
                        // Edit mode
                        <>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="number"
                              value={editReps}
                              onChange={(e) => setEditReps(e.target.value)}
                              className="flex-1 h-10 text-sm min-w-0"
                              min="1"
                              max="50"
                              placeholder="Reps"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">reps</span>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="number"
                              step="0.5"
                              value={editWeight}
                              onChange={(e) => setEditWeight(e.target.value)}
                              className="flex-1 h-10 text-sm min-w-0"
                              min="0"
                              placeholder="Peso"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">kg</span>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSaveEdit}
                              disabled={!editReps}
                              className="h-10 w-10 p-0 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              title="Guardar cambios"
                            >
                              <Save size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Cancelar edición"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </>
                      ) : (
                        // Display mode
                        <>
                          <div className="flex-1 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-medium">{set.reps}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">reps</span>
                            </div>
                            {set.weight && (
                              <div className="flex items-center gap-2">
                                <span className="text-base font-medium">{set.weight}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">kg</span>
                              </div>
                            )}
                            {set.duration && (
                              <div className="flex items-center gap-2">
                                <span className="text-base font-medium">{set.duration}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">seg</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {set.completed && (
                              <CheckCircle size={16} className="text-green-500" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSet(index)}
                              className="h-10 w-10 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              title="Editar serie"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSet(index)}
                              className="h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Eliminar serie"
                            >
                              <Trash2 size={16} />
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
                <div className="w-full p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3 sm:space-y-4">
                  <h6 className="font-semibold text-gray-900 dark:text-white text-base w-full">
                    Registrar nueva serie
                  </h6>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Repeticiones</label>
                      <Input
                        type="number"
                        placeholder="Ej: 12"
                        value={newSetReps}
                        onChange={(e) => setNewSetReps(e.target.value)}
                        min="1"
                        max="50"
                        className="text-base h-12 w-full"
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="Ej: 20"
                        value={newSetWeight}
                        onChange={(e) => setNewSetWeight(e.target.value)}
                        min="0"
                        className="text-base h-12 w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveSet}
                      disabled={!newSetReps}
                      leftIcon={<Save size={16} />}
                      className="flex-1 min-h-[48px] text-base font-medium w-full sm:w-auto"
                    >
                      Guardar serie
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelSet}
                      leftIcon={<X size={16} />}
                      className="min-h-[48px] text-base w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {actualSets.length === 0 && !isAddingSet && (
                <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400 w-full">
                  <Target size={24} className="mx-auto mb-3 opacity-50" />
                  <p className="text-base font-medium mb-1">
                    No hay series registradas
                  </p>
                  <p className="text-sm">
                    Haz clic en "Añadir serie" para comenzar
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Toggle details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full min-h-[48px] text-base font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {isExpanded ? 'Ocultar detalles' : 'Ver más detalles'}
          </Button>

          {/* Expanded details */}
          {isExpanded && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-5 space-y-3 sm:space-y-4 animate-slide-down w-full">
              {exercise.description && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 w-full">
                  <h6 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">
                    Descripción
                  </h6>
                  <p className="text-sm text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                    {exercise.description}
                  </p>
                </div>
              )}
              
              {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 w-full">
                  <h6 className="font-semibold text-gray-900 dark:text-white mb-3 text-base">
                    Músculos trabajados
                  </h6>
                  <div className="flex flex-wrap gap-2 w-full">
                    {exercise.targetMuscles.map((muscle, index) => (
                      <Badge key={index} variant="outline" size="sm" className="text-sm px-3 py-1">
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