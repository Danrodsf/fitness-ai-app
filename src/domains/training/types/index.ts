import { BaseEntity } from '@/shared/types/common'

export interface Exercise extends BaseEntity {
  name: string
  description?: string
  videoUrl?: string
  tips: string[]
  targetMuscles: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'push' | 'pull' | 'legs' | 'core' | 'cardio'
}

export interface ExerciseSet {
  reps: number
  weight?: number
  duration?: number
  restTime?: number
  completed: boolean
  notes?: string
  weekNumber?: number // 🔥 NUEVO: semana de entrenamiento
}

export interface WorkoutExercise {
  exercise: Exercise
  plannedSets: number
  plannedReps: string // e.g., "10-12", "8-10"
  actualSets: ExerciseSet[]
  completed: boolean
}

export interface WorkoutDay extends BaseEntity {
  name: string
  description: string
  day: 'monday' | 'wednesday' | 'friday'
  exercises: WorkoutExercise[]
  estimatedDuration: number
  completed: boolean
  completedAt?: string
  warmUp: string[]
  notes?: string
}

export interface WorkoutSession extends BaseEntity {
  workoutDayId: string
  startTime: string
  endTime?: string
  actualDuration?: number
  totalVolume: number
  notes?: string
  exercises: WorkoutExercise[]
  completed: boolean
}

export interface TrainingProgram extends BaseEntity {
  name: string
  description: string
  duration: number // weeks
  frequency: number // days per week
  workoutDays: WorkoutDay[]
  isActive: boolean
}

// Training domain actions
export type TrainingAction = 
  | { type: 'WORKOUT_START'; payload: { workoutDayId: string } }
  | { type: 'WORKOUT_COMPLETE'; payload: { sessionId: string } }
  | { type: 'EXERCISE_SET_UPDATE'; payload: { exerciseId: string; setIndex: number; set: ExerciseSet } }
  | { type: 'EXERCISE_SET_DELETE'; payload: { exerciseId: string; setIndex: number } }
  | { type: 'EXERCISE_COMPLETE'; payload: { exerciseId: string } }
  | { type: 'TRAINING_PROGRAM_LOAD'; payload: TrainingProgram }
  | { type: 'WORKOUT_HISTORY_ADD'; payload: WorkoutSession }
  | { type: 'TRAINING_RESET' }

export interface TrainingState {
  currentProgram: TrainingProgram | null
  currentSession: WorkoutSession | null
  workoutHistory: WorkoutSession[]
  isLoading: boolean
  error: string | null
}