import { createContext, useContext } from 'react'
import { UserState, UserAction } from '@/domains/user/types'
import { TrainingState, TrainingAction } from '@/domains/training/types'
import { NutritionState, NutritionAction } from '@/domains/nutrition/types'
import { ProgressState, ProgressAction } from '@/domains/progress/types'
import { ThemeState } from '@/shared/types/common'
import { ChatState, ChatAction } from '@/store/reducers/chatReducer'

// Global Application State
export interface AppState {
  user: UserState
  training: TrainingState
  nutrition: NutritionState
  progress: ProgressState
  theme: ThemeState
  chat: ChatState
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    timestamp: string
  }>
}

// Union of all domain actions
export type AppAction = 
  | UserAction
  | TrainingAction 
  | NutritionAction
  | ProgressAction
  | ChatAction
  | { type: 'THEME_TOGGLE' }
  | { type: 'THEME_SET'; payload: 'light' | 'dark' | 'system' }
  | { type: 'NOTIFICATION_ADD'; payload: { type: 'success' | 'error' | 'warning' | 'info'; title: string; message?: string } }
  | { type: 'NOTIFICATION_REMOVE'; payload: { id: string } }
  | { type: 'APP_RESET' }
  | { type: 'APP_HYDRATE'; payload: Partial<AppState> }

// Context type for the store
export interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

// Create contexts
export const AppContext = createContext<AppContextType | null>(null)

// Custom hook to use the app context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}

// Initial state factory
export const createInitialState = (): AppState => ({
  user: {
    profile: null,
    stats: {
      totalWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalVolume: 0,
      averageWorkoutDuration: 0,
    },
    isLoading: false,
    error: null,
  },
  training: {
    currentProgram: null,
    currentSession: null,
    workoutHistory: [],
    isLoading: false,
    error: null,
  },
  nutrition: {
    goals: null,
    weeklyPlan: null,
    dailyEntries: [],
    currentDay: null,
    isLoading: false,
    error: null,
  },
  progress: {
    weightHistory: [],
    measurements: [],
    photos: [],
    milestones: [],
    stats: null,
    performanceMetrics: [],
    weeklyProgress: [],
    isLoading: false,
    error: null,
  },
  theme: {
    mode: 'system',
    isDark: false,
  },
  chat: {
    messages: [],
    pendingProposal: null,
    isOpen: false,
    isLoading: false,
    isWaitingConfirmation: false,
    error: null,
  },
  notifications: [],
})