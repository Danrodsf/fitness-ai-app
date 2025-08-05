import { ProgressState, ProgressAction } from '@/domains/progress/types'
import { AppAction } from '@/store'

export const progressReducer = (state: ProgressState, action: AppAction): ProgressState => {
  if (!isProgressAction(action)) return state

  switch (action.type) {
    case 'WEIGHT_HISTORY_LOAD':
      return {
        ...state,
        weightHistory: action.payload,
        error: null,
      }

    case 'MILESTONE_HISTORY_LOAD':
      return {
        ...state,
        milestones: action.payload,
        error: null,
      }

    case 'WEIGHT_ENTRY_ADD':
      // Remove any existing entry for the same date
      const filteredWeightHistory = state.weightHistory.filter(
        entry => entry.date !== action.payload.date
      )
      
      return {
        ...state,
        weightHistory: [action.payload, ...filteredWeightHistory]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        error: null,
      }

    case 'WEIGHT_ENTRY_UPDATE':
      const updatedWeightHistory = state.weightHistory.map(entry =>
        entry.id === action.payload.id
          ? { ...entry, ...action.payload.data, updatedAt: new Date().toISOString() }
          : entry
      )

      return {
        ...state,
        weightHistory: updatedWeightHistory,
        error: null,
      }

    case 'WEIGHT_ENTRY_DELETE':
      return {
        ...state,
        weightHistory: state.weightHistory.filter(entry => entry.id !== action.payload.id),
        error: null,
      }

    case 'MEASUREMENT_ADD':
      // Remove any existing measurement for the same date
      const filteredMeasurements = state.measurements.filter(
        measurement => measurement.date !== action.payload.date
      )
      
      return {
        ...state,
        measurements: [action.payload, ...filteredMeasurements]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        error: null,
      }

    case 'PHOTO_ADD':
      return {
        ...state,
        photos: [action.payload, ...state.photos]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        error: null,
      }

    case 'MILESTONE_ADD':
      return {
        ...state,
        milestones: [action.payload, ...state.milestones],
        error: null,
      }

    case 'MILESTONE_COMPLETE':
      const updatedMilestones = state.milestones.map(milestone =>
        milestone.id === action.payload.id
          ? { 
              ...milestone, 
              completed: true, 
              completedDate: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString(),
            }
          : milestone
      )

      return {
        ...state,
        milestones: updatedMilestones,
        error: null,
      }

    case 'STATS_CALCULATE':
      const stats = calculateProgressStats(state.weightHistory, state.measurements)
      return {
        ...state,
        stats,
        error: null,
      }

    case 'PROGRESS_RESET':
      return {
        weightHistory: [],
        measurements: [],
        photos: [],
        milestones: [],
        stats: null,
        performanceMetrics: [],
        weeklyProgress: [],
        isLoading: false,
        error: null,
      }

    default:
      return state
  }
}

// Helper function to calculate progress statistics
function calculateProgressStats(weightHistory: any[], _measurements: any[]) {
  if (weightHistory.length === 0) {
    return {
      totalDaysTracked: 0,
      weightChange: 0,
      weightChangePercentage: 0,
      averageWeeklyWeightChange: 0,
      longestWeightTrackingStreak: 0,
      currentWeightTrackingStreak: 0,
    }
  }

  const sortedWeights = [...weightHistory].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const firstWeight = sortedWeights[0]?.weight || 0
  const lastWeight = sortedWeights[sortedWeights.length - 1]?.weight || 0
  const weightChange = lastWeight - firstWeight
  const weightChangePercentage = firstWeight > 0 ? (weightChange / firstWeight) * 100 : 0

  // Calculate streaks
  const currentStreak = calculateCurrentStreak(sortedWeights)
  const longestStreak = calculateLongestStreak(sortedWeights)
  

  // Calculate average weekly change
  const totalWeeks = Math.max(1, Math.floor(weightHistory.length / 7))
  const averageWeeklyWeightChange = weightChange / totalWeeks

  return {
    totalDaysTracked: weightHistory.length,
    weightChange: Number(weightChange.toFixed(1)),
    weightChangePercentage: Number(weightChangePercentage.toFixed(1)),
    averageWeeklyWeightChange: Number(averageWeeklyWeightChange.toFixed(1)),
    longestWeightTrackingStreak: longestStreak,
    currentWeightTrackingStreak: currentStreak,
  }
}

function calculateCurrentStreak(sortedWeights: any[]): number {
  if (sortedWeights.length === 0) return 0

  // Ordenar por fecha descendente (más reciente primero)
  const recentFirst = [...sortedWeights].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )


  let currentStreak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalizar a medianoche

  for (let i = 0; i < recentFirst.length; i++) {
    const entryDate = new Date(recentFirst[i].date)
    entryDate.setHours(0, 0, 0, 0)
    
    // Calcular diferencia en días
    const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (i === 0) {
      // Primera entrada - debe ser hoy o ayer para contar como racha actual
      if (daysDiff <= 1) {
        currentStreak = 1
      } else {
        break // No hay racha actual si el último registro es muy antiguo
      }
    } else {
      // Verificar si es consecutivo con el anterior
      const prevEntryDate = new Date(recentFirst[i - 1].date)
      prevEntryDate.setHours(0, 0, 0, 0)
      const daysBetween = Math.floor((prevEntryDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysBetween === 1) {
        currentStreak++
      } else {
        break // Rompe la racha
      }
    }
  }

  return currentStreak
}

function calculateLongestStreak(sortedWeights: any[]): number {
  if (sortedWeights.length === 0) return 0

  // Ordenar por fecha ascendente
  const chronological = [...sortedWeights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < chronological.length; i++) {
    const currentDate = new Date(chronological[i].date)
    const prevDate = new Date(chronological[i - 1].date)
    
    // Normalizar a medianoche
    currentDate.setHours(0, 0, 0, 0)
    prevDate.setHours(0, 0, 0, 0)
    
    // Calcular diferencia en días
    const daysDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 1) {
      // Días consecutivos
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else if (daysDiff === 0) {
      // Mismo día (múltiples registros) - mantener racha
      continue
    } else {
      // Rompe la racha
      currentStreak = 1
    }
  }

  return longestStreak
}

// Type guard to check if action is a progress action
function isProgressAction(action: AppAction): action is ProgressAction {
  return action.type.startsWith('WEIGHT_') || 
         action.type.startsWith('MEASUREMENT_') || 
         action.type.startsWith('PHOTO_') ||
         action.type.startsWith('MILESTONE_') ||
         action.type.startsWith('STATS_') ||
         action.type === 'PROGRESS_RESET'
}