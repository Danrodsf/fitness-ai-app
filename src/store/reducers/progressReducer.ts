import { ProgressState, ProgressAction } from '@/domains/progress/types'
import { AppAction } from '@/store'

export const progressReducer = (state: ProgressState, action: AppAction): ProgressState => {
  if (!isProgressAction(action)) return state

  switch (action.type) {
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
  // Implementation for current streak calculation
  // This is a simplified version - you might want to implement more sophisticated logic
  return sortedWeights.length > 0 ? Math.min(7, sortedWeights.length) : 0
}

function calculateLongestStreak(sortedWeights: any[]): number {
  // Implementation for longest streak calculation
  // This is a simplified version - you might want to implement more sophisticated logic
  return sortedWeights.length
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