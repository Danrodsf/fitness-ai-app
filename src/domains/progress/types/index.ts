import { BaseEntity } from '@/shared/types/common'

export interface WeightEntry extends BaseEntity {
  weight: number
  date: string
  notes?: string
  bodyFat?: number
  muscleMass?: number
}

export interface Measurement extends BaseEntity {
  date: string
  chest?: number
  waist?: number
  hips?: number
  arms?: number
  thighs?: number
  notes?: string
}

export interface ProgressPhoto extends BaseEntity {
  date: string
  photoUrl: string
  type: 'front' | 'side' | 'back'
  notes?: string
}

export interface Milestone extends BaseEntity {
  title: string
  description: string
  targetDate: string
  completedDate?: string
  category: 'weight' | 'strength' | 'endurance' | 'habit' | 'technique' | 'body_composition' | 'health' | 'nutrition'
  targetValue?: number
  currentValue?: number
  unit?: string
  completed: boolean
}

export interface ProgressStats {
  totalDaysTracked: number
  weightChange: number
  weightChangePercentage: number
  averageWeeklyWeightChange: number
  bodyFatChange?: number
  muscleMassChange?: number
  longestWeightTrackingStreak: number
  currentWeightTrackingStreak: number
}

export interface PerformanceMetric {
  exerciseName: string
  metric: 'volume' | 'max_weight' | 'max_reps' | 'endurance'
  values: { date: string; value: number }[]
  improvement: number
  improvementPercentage: number
}

export interface WeeklyProgress {
  weekStart: string
  weekEnd: string
  averageWeight: number
  totalWorkouts: number
  totalVolume: number
  caloriesConsumed: number
  proteinConsumed: number
  notes?: string
}

// Progress domain actions
export type ProgressAction = 
  | { type: 'WEIGHT_ENTRY_ADD'; payload: WeightEntry }
  | { type: 'WEIGHT_ENTRY_UPDATE'; payload: { id: string; data: Partial<WeightEntry> } }
  | { type: 'WEIGHT_ENTRY_DELETE'; payload: { id: string } }
  | { type: 'MEASUREMENT_ADD'; payload: Measurement }
  | { type: 'PHOTO_ADD'; payload: ProgressPhoto }
  | { type: 'MILESTONE_ADD'; payload: Milestone }
  | { type: 'MILESTONE_COMPLETE'; payload: { id: string } }
  | { type: 'STATS_CALCULATE' }
  | { type: 'PROGRESS_RESET' }

export interface ProgressState {
  weightHistory: WeightEntry[]
  measurements: Measurement[]
  photos: ProgressPhoto[]
  milestones: Milestone[]
  stats: ProgressStats | null
  performanceMetrics: PerformanceMetric[]
  weeklyProgress: WeeklyProgress[]
  isLoading: boolean
  error: string | null
}