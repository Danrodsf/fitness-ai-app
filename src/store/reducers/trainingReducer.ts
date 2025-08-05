import { TrainingState, TrainingAction } from '@/domains/training/types'
import { AppAction } from '@/store'

export const trainingReducer = (state: TrainingState, action: AppAction): TrainingState => {
  if (!isTrainingAction(action)) return state

  switch (action.type) {
    case 'TRAINING_PROGRAM_LOAD':
      return {
        ...state,
        currentProgram: action.payload,
        isLoading: false,
        error: null,
      }

    case 'WORKOUT_START':

      if (!state.currentProgram) {
        return state
      }
      
      const workoutDay = state.currentProgram.workoutDays.find(
        day => day.id === action.payload.workoutDayId
      )
      
      if (!workoutDay) {
        return state
      }


      const newSession = {
        id: `session-${Date.now()}`,
        workoutDayId: action.payload.workoutDayId,
        startTime: new Date().toISOString(),
        totalVolume: 0,
        exercises: workoutDay.exercises.map(ex => {
          // 🔥 SOLUCION: Asegurar que cada ejercicio tenga un ID válido
          const exercise = ex.exercise || ex
          if (!exercise.id && exercise.name) {
            exercise.id = exercise.name.toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^\w-]/g, '')
              .replace(/--+/g, '-')
          }
          
          return {
            ...ex,
            exercise: exercise,
            actualSets: [],
            completed: false,
          }
        }),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }


      return {
        ...state,
        currentSession: newSession,
        error: null,
      }

    case 'EXERCISE_SET_UPDATE':

      if (!state.currentSession) {
        return state
      }

      const updatedExercises = state.currentSession.exercises.map(exercise => {
        if (exercise.exercise.id === action.payload.exerciseId) {
          const updatedSets = [...exercise.actualSets]
          updatedSets[action.payload.setIndex] = action.payload.set
          
          return {
            ...exercise,
            actualSets: updatedSets,
          }
        }
        return exercise
      })

      const newState = {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: updatedExercises,
          updatedAt: new Date().toISOString(),
        },
      }


      return newState

    case 'EXERCISE_SET_DELETE':
      if (!state.currentSession) return state

      const exercisesWithDeletedSet = state.currentSession.exercises.map(exercise => {
        if (exercise.exercise.id === action.payload.exerciseId) {
          const updatedSets = [...exercise.actualSets]
          updatedSets.splice(action.payload.setIndex, 1)
          return {
            ...exercise,
            actualSets: updatedSets,
          }
        }
        return exercise
      })

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: exercisesWithDeletedSet,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'EXERCISE_COMPLETE':
      if (!state.currentSession) return state

      const exercisesWithCompletion = state.currentSession.exercises.map(exercise => {
        if (exercise.exercise.id === action.payload.exerciseId) {
          return { ...exercise, completed: true }
        }
        return exercise
      })

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          exercises: exercisesWithCompletion,
          updatedAt: new Date().toISOString(),
        },
      }

    case 'WORKOUT_COMPLETE':
      if (!state.currentSession) return state

      const completedSession = {
        ...state.currentSession,
        endTime: new Date().toISOString(),
        completed: true,
        actualDuration: Math.floor(
          (new Date().getTime() - new Date(state.currentSession.startTime).getTime()) / 1000 / 60
        ),
        totalVolume: calculateTotalVolume(state.currentSession.exercises),
        updatedAt: new Date().toISOString(),
      }

      return {
        ...state,
        currentSession: null,
        workoutHistory: [completedSession, ...state.workoutHistory],
        error: null,
      }

    case 'WORKOUT_HISTORY_ADD':
      return {
        ...state,
        workoutHistory: [action.payload, ...state.workoutHistory],
      }

    case 'TRAINING_RESET':
      return {
        currentProgram: null,
        currentSession: null,
        workoutHistory: [],
        isLoading: false,
        error: null,
      }

    default:
      return state
  }
}

// Helper function to calculate total volume
function calculateTotalVolume(exercises: any[]): number {
  return exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.actualSets.reduce((setTotal: number, set: any) => {
      return setTotal + ((set.weight || 0) * (set.reps || 0))
    }, 0)
    return total + exerciseVolume
  }, 0)
}

// Type guard to check if action is a training action
function isTrainingAction(action: AppAction): action is TrainingAction {
  return action.type.startsWith('WORKOUT_') || action.type.startsWith('EXERCISE_') || action.type.startsWith('TRAINING_')
}