import type { OnboardingData } from '../prompts/aiPrompts'

export class NutritionCalculator {
  
  /**
   * 🧮 CÁLCULO DE BMR (Metabolismo Basal)
   * Usando fórmula Harris-Benedict revisada
   */
  static calculateBMR(data: OnboardingData): number {
    if (data.gender === 'male') {
      return 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
    } else {
      return 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age)
    }
  }

  /**
   * 🔥 CÁLCULO DE CALORÍAS OBJETIVO
   * BMR × Factor de actividad ± ajuste por objetivo
   */
  static calculateTargetCalories(data: OnboardingData, bmr: number): number {
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    }
    
    let totalCalories = bmr * activityMultipliers[data.currentActivity]
    
    // Ajustar según objetivo específico
    switch (data.primaryGoal) {
      case 'lose_weight':
        totalCalories -= 400 // Déficit calórico moderado
        break
      case 'gain_muscle':
        totalCalories += 300 // Superávit calórico controlado
        break
      default:
        // Mantener calorías para salud general o resistencia
        break
    }
    
    return Math.round(totalCalories)
  }

  /**
   * 🥩 CÁLCULO DE PROTEÍNA OBJETIVO
   * Basado en peso corporal y objetivo específico
   */
  static calculateProteinTarget(data: OnboardingData): number {
    let proteinMultiplier: number
    
    switch (data.primaryGoal) {
      case 'gain_muscle':
        proteinMultiplier = 2.2 // Ganancia muscular requiere más proteína
        break
      case 'lose_weight':
        proteinMultiplier = 2.0 // Preservar masa muscular en déficit
        break
      default:
        proteinMultiplier = 1.8 // Salud general y resistencia
        break
    }
    
    return Math.round(data.weight * proteinMultiplier)
  }

  /**
   * 📊 CÁLCULO DE MACRONUTRIENTES COMPLETOS
   * Distribución inteligente basada en objetivo
   */
  static calculateMacros(calories: number, primaryGoal: string) {
    switch (primaryGoal) {
      case 'gain_muscle':
        return {
          protein: Math.round(calories * 0.3 / 4), // 30% proteína
          carbs: Math.round(calories * 0.4 / 4),   // 40% carbohidratos
          fats: Math.round(calories * 0.3 / 9)     // 30% grasas
        }
      
      case 'lose_weight':
        return {
          protein: Math.round(calories * 0.35 / 4), // 35% proteína (preservar músculo)
          carbs: Math.round(calories * 0.35 / 4),   // 35% carbohidratos
          fats: Math.round(calories * 0.3 / 9)      // 30% grasas
        }
      
      default: // general_health, improve_endurance
        return {
          protein: Math.round(calories * 0.25 / 4), // 25% proteína
          carbs: Math.round(calories * 0.45 / 4),   // 45% carbohidratos
          fats: Math.round(calories * 0.3 / 9)      // 30% grasas
        }
    }
  }

  /**
   * 💧 CÁLCULO DE HIDRATACIÓN DIARIA
   * Basado en peso corporal y actividad física
   */
  static calculateDailyHydration(weight: number, workoutFrequency: number): number {
    const baseHydration = weight * 35 // 35ml por kg de peso corporal
    const exerciseBonus = workoutFrequency * 500 / 7 // 500ml extra por día de entrenamiento promedio
    
    return Math.round(baseHydration + exerciseBonus)
  }

  /**
   * 🎯 CÁLCULO DE IMC
   * Para referencia nutricional
   */
  static calculateBMI(weight: number, height: number): number {
    return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1))
  }

  /**
   * ⏰ CÁLCULO DE RECUPERACIÓN ÓPTIMA
   * Tiempo entre sesiones del mismo grupo muscular
   */
  static calculateRecoveryTime(age: number, experienceLevel: string): string {
    if (age < 25) {
      return experienceLevel === 'advanced' ? '48h' : '48-72h'
    } else if (age < 35) {
      return experienceLevel === 'advanced' ? '48-72h' : '72h'
    } else {
      return '72h+'
    }
  }

  /**
   * 🍽️ CÁLCULO DE DISTRIBUCIÓN DE COMIDAS
   * Distribución óptima de calorías según número de comidas
   */
  static calculateMealDistribution(totalCalories: number, mealsPerDay: number) {
    switch (mealsPerDay) {
      case 3:
        return {
          breakfast: Math.round(totalCalories * 0.25), // 25%
          lunch: Math.round(totalCalories * 0.45),     // 45%
          dinner: Math.round(totalCalories * 0.30)     // 30%
        }
      
      case 4:
        return {
          breakfast: Math.round(totalCalories * 0.25), // 25%
          lunch: Math.round(totalCalories * 0.35),     // 35%
          snack: Math.round(totalCalories * 0.15),     // 15%
          dinner: Math.round(totalCalories * 0.25)     // 25%
        }
      
      case 5:
        return {
          breakfast: Math.round(totalCalories * 0.20), // 20%
          snack1: Math.round(totalCalories * 0.10),    // 10%
          lunch: Math.round(totalCalories * 0.35),     // 35%
          snack2: Math.round(totalCalories * 0.10),    // 10%
          dinner: Math.round(totalCalories * 0.25)     // 25%
        }
      
      default:
        return {
          breakfast: Math.round(totalCalories * 0.25),
          lunch: Math.round(totalCalories * 0.45),
          dinner: Math.round(totalCalories * 0.30)
        }
    }
  }

  /**
   * 📈 CÁLCULO DE PROGRESIÓN NUTRICIONAL
   * Ajustes graduales según progreso
   */
  static calculateProgressionAdjustments(data: OnboardingData, weeksInProgram: number) {
    const baseCalories = this.calculateTargetCalories(data, this.calculateBMR(data))
    
    // Ajustes cada 2-3 semanas para evitar adaptación metabólica
    if (weeksInProgram > 0 && weeksInProgram % 3 === 0) {
      switch (data.primaryGoal) {
        case 'lose_weight':
          // Reducir calorías gradualmente si no hay progreso
          return baseCalories - (Math.floor(weeksInProgram / 3) * 100)
        
        case 'gain_muscle':
          // Aumentar calorías gradualmente para crecimiento sostenido
          return baseCalories + (Math.floor(weeksInProgram / 3) * 50)
        
        default:
          return baseCalories
      }
    }
    
    return baseCalories
  }
}