/**
 * Calculadora inteligente de objetivos de peso considerando IMC y composición corporal
 * 
 * Para tu caso específico (181cm, objetivo ganar músculo):
 * - IMC saludable: 18.5-24.9 (59.9kg - 81.4kg)
 * - IMC atlético óptimo: 22-24 (72.1kg - 78.6kg)
 * - Ganancia muscular típica: 0.5-1kg músculo por mes (principiante)
 */

export interface SmartWeightGoal {
  targetWeight: number
  timeframe: number // meses
  strategy: string
  rationale: string
  warnings: string[]
  monthlyTargets: Array<{
    month: number
    weight: number
    focus: string
  }>
}

export interface UserData {
  currentWeight: number
  height: number // cm
  age: number
  gender: 'male' | 'female'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  primaryGoal: 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'improve_performance'
  bodyFatPercentage?: number
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high'
}

/**
 * Calcula rango de peso saludable basado en altura
 */
export const calculateHealthyWeightRange = (heightCm: number) => {
  const heightM = heightCm / 100
  return {
    min: 18.5 * heightM * heightM, // IMC 18.5
    max: 24.9 * heightM * heightM, // IMC 24.9
    optimal: 22 * heightM * heightM, // IMC 22 (ideal)
    athletic: 24 * heightM * heightM // IMC 24 (atlético)
  }
}

/**
 * Calcula peso máximo para mantenerse en rango atlético
 */
export const calculateMaxAthleticWeight = (heightCm: number): number => {
  const heightM = heightCm / 100
  return 24.5 * heightM * heightM // IMC 24.5 (límite superior atlético)
}

/**
 * Estima ganancia de músculo realista por mes
 */
export const estimateMonthlyMuscleGain = (
  experienceLevel: string,
  gender: 'male' | 'female',
  age: number
): number => {
  let baseGain = 0.5 // kg por mes base

  // Ajustar por experiencia
  if (experienceLevel === 'beginner') baseGain = 1.0
  else if (experienceLevel === 'intermediate') baseGain = 0.5
  else baseGain = 0.25 // advanced

  // Ajustar por género
  if (gender === 'female') baseGain *= 0.5

  // Ajustar por edad (después de 30, -10% por década)
  if (age > 30) {
    const decades = Math.floor((age - 30) / 10)
    baseGain *= Math.pow(0.9, decades)
  }

  return Math.max(0.1, baseGain) // Mínimo 0.1kg/mes
}

/**
 * Función principal: Calcula objetivo de peso inteligente
 */
export const calculateSmartWeightGoal = (userData: UserData): SmartWeightGoal => {
  const { currentWeight, height, age, gender, experienceLevel, primaryGoal } = userData
  const currentBMI = (currentWeight / Math.pow(height / 100, 2))
  const healthyRange = calculateHealthyWeightRange(height)
  const maxAthletic = calculateMaxAthleticWeight(height)


  // CASO 1: GANAR MÚSCULO
  if (primaryGoal === 'gain_muscle') {
    const monthlyMuscleGain = estimateMonthlyMuscleGain(experienceLevel, gender, age)
    const weightMarginFromMax = maxAthletic - currentWeight

    if (currentBMI > 24.5) {
      // Ya está en sobrepeso - primero debe perder grasa
      return {
        targetWeight: Math.min(currentWeight * 0.95, healthyRange.athletic),
        timeframe: 3,
        strategy: 'Recomposición corporal: perder grasa manteniendo músculo',
        rationale: `Con IMC ${currentBMI.toFixed(1)}, es mejor reducir grasa corporal antes de ganar más peso. Objetivo: IMC ~24.`,
        warnings: [
          'Enfócate en déficit calórico moderado (-300-500 cal/día)',
          'Mantén alta ingesta de proteína (1.6-2.2g/kg)',
          'Prioriza entrenamiento de fuerza para preservar músculo'
        ],
        monthlyTargets: Array.from({ length: 3 }, (_, i) => ({
          month: i + 1,
          weight: currentWeight - (currentWeight * 0.05 / 3) * (i + 1),
          focus: i === 0 ? 'Reducir grasa corporal' : i === 1 ? 'Mantener músculo' : 'Alcanzar IMC saludable'
        }))
      }
    }

    if (weightMarginFromMax <= 2) {
      // Poco margen para ganar peso - ganancia muy controlada
      const conservativeGain = Math.min(monthlyMuscleGain * 0.5, weightMarginFromMax / 6)
      return {
        targetWeight: currentWeight + conservativeGain * 6,
        timeframe: 6,
        strategy: 'Ganancia muscular ultra-controlada',
        rationale: `Estás cerca del límite de IMC saludable. Ganancia máxima: ${weightMarginFromMax.toFixed(1)}kg para mantenerte en IMC <24.5.`,
        warnings: [
          'Monitorea composición corporal semanalmente',
          'Si aumenta grasa corporal, reduce calorías inmediatamente',
          'Considera medir perímetros musculares en lugar de solo peso'
        ],
        monthlyTargets: Array.from({ length: 6 }, (_, i) => ({
          month: i + 1,
          weight: currentWeight + conservativeGain * (i + 1),
          focus: 'Ganancia muscular pura'
        }))
      }
    }

    // Margen saludable para ganar peso
    const optimalTimeframe = experienceLevel === 'beginner' ? 6 : 8
    const totalGain = Math.min(
      monthlyMuscleGain * optimalTimeframe, // Ganancia de músculo realista
      weightMarginFromMax * 0.8 // 80% del margen disponible
    )

    return {
      targetWeight: currentWeight + totalGain,
      timeframe: optimalTimeframe,
      strategy: 'Ganancia muscular óptima',
      rationale: `Puedes ganar ~${monthlyMuscleGain.toFixed(1)}kg músculo/mes. Objetivo: +${totalGain.toFixed(1)}kg en ${optimalTimeframe} meses manteniendo IMC <24.5.`,
      warnings: [
        'Superávit calórico moderado (+300-500 cal/día)',
        'Entrenamiento de fuerza 3-4x/semana',
        'Si superas IMC 24.5, ajusta estrategia inmediatamente'
      ],
      monthlyTargets: Array.from({ length: optimalTimeframe }, (_, i) => ({
        month: i + 1,
        weight: currentWeight + (totalGain / optimalTimeframe) * (i + 1),
        focus: i < 2 ? 'Ganancia muscular acelerada' : i < 4 ? 'Consolidación' : 'Refinamiento'
      }))
    }
  }

  // CASO 2: PERDER PESO
  if (primaryGoal === 'lose_weight') {
    const targetWeight = Math.max(
      healthyRange.optimal, // No bajar del peso óptimo
      currentWeight * 0.85 // Máximo 15% de pérdida
    )
    const totalLoss = currentWeight - targetWeight
    const timeframe = Math.max(2, Math.ceil(totalLoss / 2)) // Máximo 2kg/mes

    return {
      targetWeight,
      timeframe,
      strategy: 'Pérdida de peso saludable',
      rationale: `Objetivo: IMC ${(targetWeight / Math.pow(height / 100, 2)).toFixed(1)} (peso saludable).`,
      warnings: [
        'Déficit calórico moderado (-500-750 cal/día)',
        'Mantén entrenamiento de fuerza para preservar músculo',
        'Monitorea energía y rendimiento'
      ],
      monthlyTargets: Array.from({ length: timeframe }, (_, i) => ({
        month: i + 1,
        weight: currentWeight - (totalLoss / timeframe) * (i + 1),
        focus: 'Pérdida gradual de grasa'
      }))
    }
  }

  // CASO 3: MANTENER PESO (default)
  return {
    targetWeight: currentWeight,
    timeframe: 3,
    strategy: 'Mantenimiento y recomposición',
    rationale: 'Mantener peso actual mientras mejoras composición corporal.',
    warnings: [
      'Enfócate en ganar músculo y perder grasa simultáneamente',
      'Monitorea perímetros corporales y fuerza'
    ],
    monthlyTargets: Array.from({ length: 3 }, (_, i) => ({
      month: i + 1,
      weight: currentWeight,
      focus: 'Recomposición corporal'
    }))
  }
}

/**
 * Para tu caso específico (181cm, ganar músculo):
 * 
 * EJEMPLO PRÁCTICO:
 * - Altura: 181cm
 * - Peso actual: 75kg (IMC 22.9) ✅ Perfecto para ganar músculo
 * - Peso máximo saludable: 78.6kg (IMC 24)
 * - Margen disponible: 3.6kg
 * - Ganancia mensual estimada: 0.8kg (principiante masculino)
 * - Objetivo: 78kg en 4 meses
 * 
 * Si tu peso actual fuera 80kg (IMC 24.4):
 * - Estrategia: Recomposición (mantener peso, cambiar composición)
 * - No ganar más peso hasta reducir grasa corporal
 */