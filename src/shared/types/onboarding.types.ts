export interface OnboardingData {
  // Datos personales
  name: string
  age: number
  weight: number
  height: number
  gender: 'male' | 'female' | 'other'
  
  // Objetivos
  primaryGoal: 'lose_weight' | 'gain_muscle' | 'improve_endurance' | 'general_health'
  targetWeight?: number
  timeframe: '1-3' | '3-6' | '6-12' | '12+' // meses
  
  // Experiencia
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  currentActivity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  workoutFrequency: number // días por semana
  
  // Preferencias de entrenamiento
  preferredWorkouts: string[]
  availableEquipment: string[]
  timePerWorkout: number // minutos
  
  // Restricciones
  injuries: string[]
  healthConditions: string[]
  dietaryRestrictions: string[]
  
  // Alimentación
  mealsPerDay: number
  cookingTime: 'minimal' | 'moderate' | 'extensive'
  budget: 'low' | 'medium' | 'high'
  
  // Campo libre prioritario
  additionalInfo: string
}

export interface OnboardingStep {
  title: string
  icon: React.ReactNode
  component: React.ReactNode
  isValid?: (data: OnboardingData) => boolean
  description?: string
}