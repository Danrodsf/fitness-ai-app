import { BaseEntity } from '@/shared/types/common'

export interface UserProfile extends BaseEntity {
  name: string
  age: number
  weight: number
  height: number
  goals: FitnessGoal[]
  preferences: UserPreferences
}

export type FitnessGoal = 'ganar_musculatura' | 'reducir_grasa_abdominal' | 'mejorar_resistencia' | 'mantenimiento'

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  autoBackup: boolean
  language: string
  onboardingCompleted?: boolean
  onboardingData?: any
  aiPlans?: any
  aiPlansGeneratedAt?: string
}

export interface UserStats {
  totalWorkouts: number
  currentStreak: number
  longestStreak: number
  totalVolume: number
  averageWorkoutDuration: number
}

// User domain actions
export type UserAction = 
  | { type: 'USER_PROFILE_UPDATE'; payload: Partial<UserProfile> }
  | { type: 'USER_PREFERENCES_UPDATE'; payload: Partial<UserPreferences> }
  | { type: 'USER_STATS_UPDATE'; payload: Partial<UserStats> }
  | { type: 'USER_RESET' }

export interface UserState {
  profile: UserProfile | null
  stats: UserStats
  isLoading: boolean
  error: string | null
}