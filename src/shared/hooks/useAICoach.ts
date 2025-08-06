import { useCallback, useEffect } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { AICoachService, ChatMessage, UserContext } from '@/shared/services/AICoachService'
import { useProgressData } from '@/domains/progress/hooks/useProgressData'
import { TrainingService } from '@/domains/training/services/trainingService'
import { NutritionService } from '@/domains/nutrition/services/nutritionService'

export const useAICoach = () => {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  
  // Ensure progress data is loaded before using AI Coach
  useProgressData()
  
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return
      
      try {
        if (!state.training.workoutHistory?.length) {
          const trainingStats = await TrainingService.getTrainingStats(user.id)
          if (trainingStats?.length > 0) {
            dispatch({ type: 'TRAINING_HISTORY_LOAD', payload: trainingStats })
          }
        }

        if (!state.nutrition.goals) {
          const nutritionGoals = await NutritionService.getNutritionGoals(user.id)
          if (nutritionGoals) {
            dispatch({ type: 'NUTRITION_GOALS_UPDATE', payload: nutritionGoals })
          }
        }

        if (!state.nutrition.weeklyPlan) {
          const weeklyPlans = await NutritionService.getWeeklyMealPlans(user.id)
          if (weeklyPlans?.length > 0) {
            dispatch({ type: 'MEAL_PLAN_LOAD', payload: weeklyPlans[0] })
          }
        }
      } catch (error) {
        // Silent fail
      }
    }
    
    loadUserData()
  }, [user?.id, dispatch])

  const buildUserContext = useCallback((): UserContext => {
    const userProfile = state.user.profile || {
      id: 'temp-user',
      name: 'Usuario',
      email: '',
      age: 25,
      weight: 70,
      height: 170,
      goals: ['mantenimiento' as const],
      preferences: {
        theme: 'light',
        notifications: true,
        autoBackup: true,
        language: 'es'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return {
      profile: userProfile,
      currentTrainingPlan: state.training.currentProgram || undefined,
      currentNutritionPlan: state.nutrition.goals && state.nutrition.weeklyPlan 
        ? { goals: state.nutrition.goals, weeklyPlan: state.nutrition.weeklyPlan }
        : undefined,
      recentProgress: {
        weightHistory: state.progress.weightHistory,
        recentWorkouts: state.training.workoutHistory,
        performanceMetrics: state.progress.performanceMetrics || [],
        milestones: state.progress.milestones || [],
        stats: state.progress.stats
      },
      chatHistory: state.chat.messages
    }
  }, [state])

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state.chat.isLoading) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    dispatch({ type: 'CHAT_ADD_MESSAGE', payload: userMessage })
    dispatch({ type: 'CHAT_SET_LOADING', payload: true })

    try {
      const userContext = buildUserContext()
      const response = await AICoachService.sendMessage(message.trim(), userContext)

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          functionCall: response.functionName,
          proposal: response.proposal
        }
      }

      dispatch({ type: 'CHAT_ADD_MESSAGE', payload: assistantMessage })

      if (response.hasProposal && response.proposal) {
        dispatch({ type: 'CHAT_SET_PENDING_PROPOSAL', payload: response.proposal })
      }
    } catch (error) {
      dispatch({ 
        type: 'CHAT_SET_ERROR', 
        payload: 'Error al comunicarse con el entrenador IA. Inténtalo de nuevo.' 
      })
    } finally {
      dispatch({ type: 'CHAT_SET_LOADING', payload: false })
    }
  }, [state.chat.isLoading, state.chat.messages, buildUserContext, dispatch])

  // Helper functions for finding exercises
  const findExerciseIdByName = useCallback((program: any, exerciseName: string): string | undefined => {
    for (const day of program.workoutDays || []) {
      for (const exercise of day.exercises || []) {
        if (exercise.exercise.name?.toLowerCase().includes(exerciseName.toLowerCase())) {
          return exercise.exercise.id
        }
      }
    }
    return undefined
  }, [])

  const getFirstExerciseId = useCallback((program: any): string | undefined => {
    for (const day of program.workoutDays || []) {
      for (const exercise of day.exercises || []) {
        if (exercise.exercise.id) {
          return exercise.exercise.id
        }
      }
    }
    return undefined
  }, [])

  // Find existing exercises by similar name
  const findExistingExerciseByName = useCallback((exerciseName: string) => {
    if (!state.training.currentProgram) return null
    
    const searchName = exerciseName.toLowerCase().trim()
    
    for (const day of state.training.currentProgram.workoutDays || []) {
      for (const exercise of day.exercises || []) {
        const existingName = exercise.exercise.name.toLowerCase().trim()
        
        // Exact match
        if (existingName === searchName) {
          return exercise.exercise
        }
        
        // Significant partial match (>70% similarity)
        const similarity = calculateNameSimilarity(existingName, searchName)
        if (similarity > 0.7) {
          return exercise.exercise
        }
      }
    }
    
    return null
  }, [state.training.currentProgram])

  // Calculate name similarity between exercises
  const calculateNameSimilarity = useCallback((name1: string, name2: string): number => {
    const words1 = name1.split(' ').filter(w => w.length > 2)
    const words2 = name2.split(' ').filter(w => w.length > 2)
    
    if (words1.length === 0 || words2.length === 0) return 0
    
    let matches = 0
    const totalWords = Math.max(words1.length, words2.length)
    
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          matches++
          break
        }
      }
    }
    
    return matches / totalWords
  }, [])

  // Backup functions in case AI fails

  const generateUniqueExerciseId = useCallback((exerciseName: string): string => {
    const cleanName = exerciseName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 30)
    
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 6)
    
    return `${cleanName}_${timestamp}_${random}`
  }, [])

  const applyProposalChanges = useCallback(async (_proposalId: string) => {
    const proposal = state.chat.pendingProposal
    if (!proposal) {
      console.warn('No pending proposal to apply')
      return
    }

    if (!user?.id) {
      dispatch({ 
        type: 'CHAT_SET_ERROR', 
        payload: 'Debes estar autenticado para aplicar cambios.' 
      })
      return
    }

    try {
      let originalExerciseName = ''
      let newExerciseName = ''
      
      // Apply changes based on proposal type
      switch (proposal.type) {
        case 'exercise_replacement':
          if (!state.training.currentProgram) {
            throw new Error('No hay programa de entrenamiento cargado')
          }
          
          // Handle different AI proposal structures
          const changes = proposal.changes
          let exerciseId: string | undefined
          let newExercise: any
          
          if (changes.exerciseId && changes.newExercise) {
            exerciseId = changes.exerciseId
            newExercise = changes.newExercise
          } else if (changes.oldExercise && changes.newExercise) {
            exerciseId = findExerciseIdByName(state.training.currentProgram, changes.oldExercise)
            newExercise = changes.newExercise
          } else if (changes.exercise) {
            const firstExercise = getFirstExerciseId(state.training.currentProgram)
            exerciseId = firstExercise
            newExercise = changes.exercise
          } else if (proposal.title || proposal.description) {
            const searchText = `${proposal.title} ${proposal.description}`.toLowerCase()
            for (const day of state.training.currentProgram.workoutDays || []) {
              for (const exercise of day.exercises || []) {
                if (searchText.includes(exercise.exercise.name.toLowerCase())) {
                  exerciseId = exercise.exercise.id
                  newExercise = changes.newExercise || changes.exercise || {
                    name: changes.name || 'Ejercicio modificado',
                    description: changes.description || 'Ejercicio sugerido por el AI Coach'
                  }
                  break
                }
              }
              if (exerciseId) break
            }
          }
          
          if (!exerciseId) {
            throw new Error('No se pudo identificar el ejercicio a reemplazar')
          }
          if (!newExercise) {
            throw new Error('No se especificó el ejercicio de reemplazo')
          }
          
          const updatedProgram = { ...state.training.currentProgram }
          let exerciseFound = false
          let finalExerciseId = exerciseId
          
          // Find exercise by exact ID first
          for (const day of updatedProgram.workoutDays || []) {
            for (const exercise of day.exercises || []) {
              if (exercise.exercise.id === exerciseId) {
                exerciseFound = true
                break
              }
            }
            if (exerciseFound) break
          }
          
          // Search by name similarity if not found by ID
          if (!exerciseFound && exerciseId) {
            const searchTerms = exerciseId.replace(/_/g, ' ').toLowerCase().split(' ')
            
            for (const day of updatedProgram.workoutDays || []) {
              for (const exercise of day.exercises || []) {
                const exerciseName = exercise.exercise.name.toLowerCase()
                const matches = searchTerms.filter(term => 
                  exerciseName.includes(term) || term.includes(exerciseName.split(' ')[0])
                ).length
                
                if (matches >= 1) {
                  finalExerciseId = exercise.exercise.id
                  exerciseFound = true
                  break
                }
              }
              if (exerciseFound) break
            }
          }
          
          // Use first available exercise as fallback
          if (!exerciseFound) {
            for (const day of updatedProgram.workoutDays || []) {
              for (const exercise of day.exercises || []) {
                if (exercise.exercise.id) {
                  finalExerciseId = exercise.exercise.id
                  exerciseFound = true
                  break
                }
              }
              if (exerciseFound) break
            }
          }
          
          if (!exerciseFound) {
            throw new Error('No se encontró ningún ejercicio en el programa para reemplazar')
          }

          // Capturar nombres para el mensaje de confirmación
          for (const day of updatedProgram.workoutDays || []) {
            for (const exercise of day.exercises || []) {
              if (exercise.exercise.id === finalExerciseId) {
                originalExerciseName = exercise.exercise.name
                break
              }
            }
          }
          newExerciseName = newExercise?.name || 'nuevo ejercicio'
          
          // 🔥 Obtener el ejercicio original para mantener compatibilidad con historial
          let originalExercise = null
          for (const day of updatedProgram.workoutDays || []) {
            for (const exercise of day.exercises || []) {
              if (exercise.exercise.id === finalExerciseId) {
                originalExercise = exercise.exercise
                break
              }
            }
            if (originalExercise) break
          }

          const existingExercise = findExistingExerciseByName(newExercise.name || '')
          let replacementExercise
          
          if (existingExercise) {
            replacementExercise = existingExercise
            newExerciseName = `${existingExercise.name} (existente)`
          } else {
            const newExerciseId = generateUniqueExerciseId(newExercise.name || 'Ejercicio personalizado')
            
            replacementExercise = {
              id: newExerciseId,
              name: newExercise.name || 'Ejercicio personalizado',
              description: newExercise.description || `Ejercicio sugerido por AI Coach como reemplazo de ${originalExerciseName}`,
              videoUrl: newExercise.videoUrl || undefined,
              tips: newExercise.tips || [`Ejercicio personalizado`, `Consulta con tu entrenador para técnica correcta`],
              targetMuscles: newExercise.targetMuscles || originalExercise?.targetMuscles || [],
              difficulty: (newExercise.difficulty as 'beginner' | 'intermediate' | 'advanced') || originalExercise?.difficulty || 'intermediate',
              category: (newExercise.category as 'push' | 'pull' | 'legs' | 'core' | 'cardio') || originalExercise?.category || 'push',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            newExerciseName = `${newExercise.name || 'Ejercicio personalizado'} (nuevo)`
          }
          
          updatedProgram.workoutDays = updatedProgram.workoutDays?.map(day => ({
            ...day,
            exercises: day.exercises?.map(exercise => {
              if (exercise.exercise.id === finalExerciseId) {
                return {
                  ...exercise,
                  exercise: replacementExercise,
                  plannedSets: newExercise.sets || exercise.plannedSets,
                  plannedReps: newExercise.reps || exercise.plannedReps
                }
              }
              return exercise
            }) || []
          })) || []

          // Save to database and update state
          await TrainingService.saveTrainingProgram(user.id, updatedProgram)
          dispatch({ type: 'TRAINING_PROGRAM_LOAD', payload: updatedProgram })
          break

        case 'workout_modification':
          if (proposal.changes.workoutChanges && state.training.currentProgram && user?.id) {
            const updatedProgram = {
              ...state.training.currentProgram,
              ...proposal.changes.workoutChanges
            }
            
            await TrainingService.saveTrainingProgram(user.id, updatedProgram)
            dispatch({ type: 'TRAINING_PROGRAM_LOAD', payload: updatedProgram })
          }
          break

        case 'nutrition_adjustment':
          if (proposal.changes.nutritionChanges && user?.id) {
            if (proposal.changes.nutritionChanges.goals && state.nutrition.goals) {
              const updatedGoals = {
                ...state.nutrition.goals,
                ...proposal.changes.nutritionChanges.goals
              }
              await NutritionService.saveNutritionGoals(user.id, updatedGoals)
              dispatch({ type: 'NUTRITION_GOALS_UPDATE', payload: updatedGoals })
            }
            
            if (proposal.changes.nutritionChanges.weeklyPlan && state.nutrition.weeklyPlan) {
              const updatedPlan = {
                ...state.nutrition.weeklyPlan,
                ...proposal.changes.nutritionChanges.weeklyPlan
              }
              await NutritionService.saveWeeklyMealPlan(user.id, updatedPlan)
              dispatch({ type: 'MEAL_PLAN_LOAD', payload: updatedPlan })
            }
          }
          break

        default:
          // Tipo de cambio no implementado
      }
      
      dispatch({ type: 'CHAT_CLEAR_PENDING_PROPOSAL' })
      
      // Crear mensaje de confirmación personalizado basado en el tipo de cambio
      let confirmationContent = '✅ Cambios aplicados exitosamente. Tu plan ha sido actualizado.'
      
      if (proposal.type === 'exercise_replacement') {
        confirmationContent = `✅ Ejercicio cambiado exitosamente: "${originalExerciseName}" → "${newExerciseName}". El cambio se verá reflejado inmediatamente en tu programa de entrenamiento.`
      }
      
      const confirmationMessage: ChatMessage = {
        id: `msg-${Date.now()}-confirmation`,
        role: 'assistant',
        content: confirmationContent,
        timestamp: new Date()
      }
      
      dispatch({ type: 'CHAT_ADD_MESSAGE', payload: confirmationMessage })
      
      dispatch({ 
        type: 'NOTIFICATION_ADD', 
        payload: { 
          type: 'success', 
          title: 'Plan actualizado', 
          message: proposal.title 
        } 
      })
    } catch (error) {
      let errorMessage = 'Error al aplicar los cambios. Inténtalo de nuevo.'
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
        } else if (error.message.includes('unauthorized')) {
          errorMessage = 'No tienes permisos para realizar este cambio. Inicia sesión de nuevo.'
        }
      }
      
      dispatch({ 
        type: 'CHAT_SET_ERROR', 
        payload: errorMessage 
      })
      
      dispatch({ type: 'CHAT_CLEAR_PENDING_PROPOSAL' })
    }
  }, [state.chat.pendingProposal, state.training.currentProgram, state.nutrition, dispatch, user?.id, findExerciseIdByName, getFirstExerciseId, generateUniqueExerciseId, findExistingExerciseByName])

  const rejectProposal = useCallback(() => {
    dispatch({ type: 'CHAT_CLEAR_PENDING_PROPOSAL' })
    
    const rejectionMessage: ChatMessage = {
      id: `msg-${Date.now()}-rejection`,
      role: 'assistant',
      content: 'Entendido, mantendremos tu plan actual. ¿Hay algo más en lo que te pueda ayudar?',
      timestamp: new Date()
    }
    
    dispatch({ type: 'CHAT_ADD_MESSAGE', payload: rejectionMessage })
  }, [dispatch])

  const openChat = useCallback(() => {
    dispatch({ type: 'CHAT_OPEN' })
  }, [dispatch])

  const closeChat = useCallback(() => {
    dispatch({ type: 'CHAT_CLOSE' })
  }, [dispatch])

  const toggleChat = useCallback(() => {
    dispatch({ type: 'CHAT_TOGGLE' })
  }, [dispatch])

  const clearError = useCallback(() => {
    dispatch({ type: 'CHAT_CLEAR_ERROR' })
  }, [dispatch])

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CHAT_CLEAR_HISTORY' })
    // Clear response cache
    import('@/shared/services/AICoachService').then(({ ResponseCache }) => {
      ResponseCache.clearCache()
    })
  }, [dispatch])

  // Automatic progress analysis
  const analyzeProgress = useCallback(async () => {
    try {
      const userContext = buildUserContext()
      const response = await AICoachService.analyzeUserProgress(userContext)

      const analysisMessage: ChatMessage = {
        id: `msg-${Date.now()}-analysis`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          functionCall: response.functionName
        }
      }

      dispatch({ type: 'CHAT_ADD_MESSAGE', payload: analysisMessage })
      
      // Auto-open chat to show analysis
      dispatch({ type: 'CHAT_OPEN' })
      
      return response
    } catch (error) {
      return null
    }
  }, [buildUserContext, dispatch])

  return {
    // State
    chat: state.chat,
    
    // Actions
    sendMessage,
    applyProposalChanges,
    rejectProposal,
    openChat,
    closeChat,
    toggleChat,
    clearError,
    clearHistory,
    analyzeProgress,
    
    // Utils
    isConfigured: !!import.meta.env.VITE_AI_ENDPOINT && !!import.meta.env.VITE_AI_API_KEY,
    canUseAI: true // Always allow AI if configured - we create basic profile if needed
  }
}