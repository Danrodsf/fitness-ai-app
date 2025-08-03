import { WeightEntry, Milestone, ProgressStats } from '../types'

// Sample weight entries - empty by default
export const sampleWeightEntries: WeightEntry[] = []

// Default milestones - empty by default, will be populated by AI based on user data
export const defaultMilestones: Milestone[] = []

// Generar objetivos personalizados basados en el perfil del usuario
export const generatePersonalizedMilestones = (userProfile: {
  age: number
  weight: number
  height: number
  goals: string[]
  experienceLevel?: string
  primaryGoal?: string
}): Milestone[] => {
  const today = new Date()
  const milestones: Milestone[] = []
  const bmi = calculateBMI(userProfile.weight, userProfile.height)
  
  // Determinar objetivo principal si no está especificado
  const mainGoal = userProfile.primaryGoal || userProfile.goals[0] || 'improve_fitness'
  const experience = userProfile.experienceLevel || 'beginner'
  
  // Objetivo 1: Peso (1-3 meses)
  if (mainGoal === 'lose_weight' || bmi > 25) {
    const targetWeight = Math.max(
      userProfile.weight * 0.9, // Máximo 10% de pérdida
      22 * Math.pow(userProfile.height / 100, 2) // Peso ideal BMI 22
    )
    const targetDate = new Date(today)
    targetDate.setMonth(targetDate.getMonth() + (userProfile.weight > targetWeight + 10 ? 3 : 2))
    
    milestones.push({
      id: `weight-goal-${Date.now()}`,
      title: `Alcanzar ${Math.round(targetWeight)}kg`,
      description: `Objetivo de peso saludable (BMI ~22)`,
      category: 'weight',
      targetDate: targetDate.toISOString().split('T')[0],
      targetValue: Math.round(targetWeight),
      currentValue: userProfile.weight,
      unit: 'kg',
      completed: false,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString()
    })
  } else if (mainGoal === 'gain_muscle') {
    const targetWeight = userProfile.weight + (experience === 'beginner' ? 5 : 3)
    const targetDate = new Date(today)
    targetDate.setMonth(targetDate.getMonth() + (experience === 'beginner' ? 4 : 3))
    
    milestones.push({
      id: `muscle-weight-goal-${Date.now()}`,
      title: `Ganar masa muscular (${Math.round(targetWeight)}kg)`,
      description: 'Incremento saludable de peso con músculo',
      category: 'weight',
      targetDate: targetDate.toISOString().split('T')[0],
      targetValue: Math.round(targetWeight),
      currentValue: userProfile.weight,
      unit: 'kg',
      completed: false,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString()
    })
  }
  
  // Objetivo 2: Fuerza (2-6 semanas)
  const strengthTargets = {
    beginner: { push: 20, squat: 50, pull: 5 },
    intermediate: { push: 30, squat: 80, pull: 10 },
    advanced: { push: 40, squat: 100, pull: 15 }
  }
  
  const targets = strengthTargets[experience as keyof typeof strengthTargets]
  const strengthDate = new Date(today)
  strengthDate.setDate(strengthDate.getDate() + (experience === 'beginner' ? 6 * 7 : 4 * 7)) // 6 o 4 semanas
  
  milestones.push({
    id: `strength-push-${Date.now()}`,
    title: `${targets.push} flexiones seguidas`,
    description: 'Desarrollar fuerza en tren superior',
    category: 'strength',
    targetDate: strengthDate.toISOString().split('T')[0],
    targetValue: targets.push,
    currentValue: experience === 'beginner' ? 5 : experience === 'intermediate' ? 15 : 25,
    unit: 'reps',
    completed: false,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString()
  })
  
  // Objetivo 3: Resistencia (1-2 meses)
  const resistanceDate = new Date(today)
  resistanceDate.setMonth(resistanceDate.getMonth() + (experience === 'beginner' ? 2 : 1))
  
  milestones.push({
    id: `endurance-goal-${Date.now()}`,
    title: 'Completar 30 min actividad continua',
    description: 'Mejorar resistencia cardiovascular',
    category: 'endurance',
    targetDate: resistanceDate.toISOString().split('T')[0],
    targetValue: 30,
    currentValue: experience === 'beginner' ? 10 : experience === 'intermediate' ? 20 : 25,
    unit: 'min',
    completed: false,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString()
  })
  
  // Objetivo 4: Hábito (1 mes)
  const habitDate = new Date(today)
  habitDate.setMonth(habitDate.getMonth() + 1)
  
  milestones.push({
    id: `habit-consistency-${Date.now()}`,
    title: 'Entrenar 3 veces por semana durante 4 semanas',
    description: 'Establecer rutina de ejercicio consistente',
    category: 'habit',
    targetDate: habitDate.toISOString().split('T')[0],
    targetValue: 12, // 3 veces x 4 semanas
    currentValue: 0,
    unit: 'entrenamientos',
    completed: false,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString()
  })
  
  // Objetivo 5: Técnica (3-4 semanas)
  const techniqueDate = new Date(today)
  techniqueDate.setMonth(techniqueDate.getMonth() + 1)
  
  milestones.push({
    id: `technique-goal-${Date.now()}`,
    title: 'Dominar forma correcta de 5 ejercicios básicos',
    description: 'Perfeccionar técnica para evitar lesiones',
    category: 'technique',
    targetDate: techniqueDate.toISOString().split('T')[0],
    targetValue: 5,
    currentValue: experience === 'beginner' ? 1 : experience === 'intermediate' ? 3 : 4,
    unit: 'ejercicios',
    completed: false,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString()
  })
  
  return milestones.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
}

// Default progress stats
export const defaultProgressStats: ProgressStats = {
  totalDaysTracked: 0,
  weightChange: 0,
  weightChangePercentage: 0,
  averageWeeklyWeightChange: 0,
  longestWeightTrackingStreak: 0,
  currentWeightTrackingStreak: 0,
}

// BMI calculation helper
export const calculateBMI = (weight: number, heightCm: number): number => {
  const heightM = heightCm / 100
  return Number((weight / (heightM * heightM)).toFixed(1))
}

// BMI categories
export const getBMICategory = (bmi: number): { category: string; color: string; description: string } => {
  if (bmi < 18.5) {
    return { 
      category: 'Bajo peso', 
      color: 'text-blue-600 dark:text-blue-400',
      description: 'Por debajo del peso normal'
    }
  } else if (bmi < 25) {
    return { 
      category: 'Peso normal', 
      color: 'text-green-600 dark:text-green-400',
      description: 'Peso saludable'
    }
  } else if (bmi < 30) {
    return { 
      category: 'Sobrepeso', 
      color: 'text-yellow-600 dark:text-yellow-400',
      description: 'Por encima del peso normal'
    }
  } else {
    return { 
      category: 'Obesidad', 
      color: 'text-red-600 dark:text-red-400',
      description: 'Peso muy por encima de lo normal'
    }
  }
}

// Weight loss goals
export const getWeightGoalStatus = (currentWeight: number, targetWeight: number, initialWeight: number) => {
  const totalToLose = initialWeight - targetWeight
  const lostSoFar = initialWeight - currentWeight
  const percentage = Math.max(0, (lostSoFar / totalToLose) * 100)
  const remaining = currentWeight - targetWeight
  
  return {
    totalToLose,
    lostSoFar,
    percentage: Math.min(100, percentage),
    remaining: Math.max(0, remaining),
    isCompleted: currentWeight <= targetWeight
  }
}