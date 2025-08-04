// Definir OnboardingData aquí para evitar dependencias circulares
interface OnboardingData {
  name: string
  age: number
  weight: number
  height: number
  gender: 'male' | 'female' | 'other'
  targetWeight?: number
  primaryGoal: 'lose_weight' | 'gain_muscle' | 'improve_endurance' | 'general_health'
  timeframe: '1-3' | '3-6' | '6-12' | '12+'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  currentActivity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  workoutFrequency: number
  preferredWorkouts: string[]
  availableEquipment: string[]
  timePerWorkout: number
  injuries: string[]
  healthConditions: string[]
  dietaryRestrictions: string[]
  mealsPerDay: number
  cookingTime: 'minimal' | 'moderate' | 'extensive'
  budget: 'low' | 'medium' | 'high'
  additionalInfo: string
}

export class AIPrompts {
  
  /**
   * 🏋️ PROMPT SOLO PARA ENTRENAMIENTO
   */
  static generateTrainingOnlyPrompt(data: OnboardingData): string {
    return `Eres un ENTRENADOR PERSONAL CERTIFICADO (NSCA-CPT) con especialización en periodización científica y programación de entrenamientos personalizados.

PERFIL COMPLETO DEL CLIENTE:
- ${data.name}, ${data.age} años, ${data.gender}, ${data.weight}kg, ${data.height}cm
- IMC: ${(data.weight / Math.pow(data.height/100, 2)).toFixed(1)} kg/m²
- Objetivo principal: ${data.primaryGoal}
- Nivel de experiencia: ${data.experienceLevel}
- Actividad actual: ${data.currentActivity}
- Disponibilidad: ${data.workoutFrequency} días/semana × ${data.timePerWorkout} min
- Equipo disponible: ${(data.availableEquipment || []).join(', ') || 'Básico'}
- Restricciones físicas: ${[...(data.injuries || []), ...(data.healthConditions || [])].join(', ') || 'Ninguna'}
${data.additionalInfo ? `
🎯 **INFORMACIÓN PRIORITARIA DEL CLIENTE:**
"${data.additionalInfo}"
⚠️ Esta información tiene MÁXIMA PRIORIDAD y debe guiar TODAS tus decisiones de entrenamiento.` : ''}

INSTRUCCIONES PROFESIONALES:

Como entrenador certificado, analiza COMPLETAMENTE el perfil del cliente y diseña un programa de entrenamiento científicamente fundamentado y totalmente personalizado.

🏋️ **PROGRAMACIÓN INTELIGENTE:**
- Usa tu criterio profesional para determinar la estructura óptima
- Adapta ejercicios, sets, reps y descansos al perfil específico
- Incluye calentamiento, entrenamiento principal y vuelta a la calma SI ES APROPIADO
- Considera limitaciones, equipo disponible y tiempo total
- Progresión apropiada para el nivel de experiencia
- Programa apropiado para ${data.workoutFrequency} días/semana

🔥 **PERSONALIZACIÓN TOTAL:**
- Si hay información adicional, es PRIORIDAD MÁXIMA
- Adapta TODO al objetivo específico del cliente
- Respeta absolutamente cualquier restricción física
- Programa apropiado para ${data.workoutFrequency} días/semana

FORMATO JSON REQUERIDO:
{
  "trainingPlan": {
    "id": "training-${Date.now()}",
    "name": "Programa Personalizado - ${data.name}",
    "description": "Plan científico adaptado completamente al perfil del cliente",
    "duration": ${data.timeframe === '1-3' ? 3 : data.timeframe === '3-6' ? 6 : 12},
    "frequency": ${data.workoutFrequency},
    "workoutDays": [/* ${data.workoutFrequency} días personalizados */],
    "isActive": true,
    "createdAt": "${new Date().toISOString()}",
    "updatedAt": "${new Date().toISOString()}"
  }
}

📋 **CRITERIOS PROFESIONALES:**
- Número de ejercicios basado en tiempo disponible y objetivos
- Sets y reps apropiados para el nivel y objetivo específico
- Ejercicios seguros considerando restricciones
- URLs de YouTube reales para demostraciones`
  }

  /**
   * 🥗 PROMPT SOLO PARA NUTRICIÓN
   */
  static generateNutritionOnlyPrompt(data: OnboardingData, targetCalories: number, proteinTarget: number): string {
    const cookingTime = data.cookingTime || 'moderate'
    
    return `Eres un NUTRICIONISTA DEPORTIVO CERTIFICADO (ISSN) con especialización en nutrición personalizada basada en evidencia científica.

PERFIL COMPLETO DEL CLIENTE:
- ${data.age} años, ${data.gender}, ${data.weight}kg, ${data.height}cm
- Objetivo principal: ${data.primaryGoal}
- Nivel de actividad: ${data.currentActivity}
- Restricciones alimentarias: ${(data.dietaryRestrictions || []).join(', ') || 'Sin restricciones'}
- Comidas preferidas por día: ${data.mealsPerDay}
- Tiempo para cocinar: ${cookingTime}
- Presupuesto: ${data.budget}
${data.additionalInfo ? `
🎯 **INFORMACIÓN PRIORITARIA DEL CLIENTE:**
"${data.additionalInfo}"
⚠️ Esta información tiene MÁXIMA PRIORIDAD y debe influir todas tus decisiones nutricionales.` : ''}

INSTRUCCIONES PROFESIONALES:

Como nutricionista experto, analiza TODOS los datos del cliente y crea un plan nutricional científicamente sólido y completamente personalizado. 

📊 **CÁLCULOS NUTRICIONALES:**
- Calorías objetivo calculadas: ${targetCalories} kcal/día
- Proteína objetivo: ${proteinTarget}g/día
- Usa tu criterio profesional para ajustar macros según el perfil específico
- Cada día debe sumar las calorías objetivo (tolerancia ±50 kcal)
- Cantidades SIEMPRE en gramos, nunca "porciones"

🔥 **PERSONALIZACIÓN TOTAL:**
- Adapta COMPLETAMENTE el plan al perfil del cliente
- Si hay información adicional, es PRIORIDAD MÁXIMA
- Varía recetas, técnicas de cocción y ingredientes
- Considera restricciones, presupuesto y tiempo de cocina
- Plan semanal completo (7 días únicos)

FORMATO JSON REQUERIDO (ESTRUCTURA EXACTA OBLIGATORIA):
{
  "nutritionPlan": {
    "goals": {
      "dailyCalories": ${targetCalories},
      "dailyProtein": ${proteinTarget},
      "dailyCarbs": ${Math.round(targetCalories * 0.45 / 4)},
      "dailyFats": ${Math.round(targetCalories * 0.25 / 9)},
      "calorieDeficit": ${data.primaryGoal === 'lose_weight' ? 400 : 0}
    },
    "weeklyPlan": {
      "id": "meal-plan-${Date.now()}",
      "name": "Plan Nutricional REGENERADO",
      "description": "Programa alimentario NUEVO basado en timing nutricional y periodización",
      "days": [
        {
          "id": "monday-plan",
          "day": "monday",
          "breakfast": [
            {
              "title": "Nombre del desayuno único",
              "description": "Descripción breve",
              "prepTime": 10,
              "recipe": "Instrucciones paso a paso",
              "calories": 400,
              "protein": 25,
              "foods": [
                {
                  "name": "Avena",
                  "quantity": 80,
                  "unit": "g",
                  "calories": 300,
                  "protein": 10,
                  "carbs": 50,
                  "fats": 7
                }
              ]
            }
          ],
          "lunch": [
            {
              "title": "Nombre del almuerzo único",
              "description": "Descripción breve",
              "prepTime": 25,
              "recipe": "Instrucciones paso a paso",
              "calories": ${Math.round(targetCalories * 0.45)},
              "protein": ${Math.round(proteinTarget * 0.45)},
              "foods": [/* foods con quantity en gramos */]
            }
          ],
          "dinner": [
            {
              "title": "Nombre de la cena única",
              "description": "Descripción breve",
              "prepTime": 10,
              "recipe": "Instrucciones paso a paso",
              "calories": ${Math.round(targetCalories * 0.30)},
              "protein": ${Math.round(proteinTarget * 0.30)},
              "foods": [/* foods con quantity en gramos */]
            }
          ],
          "totalCalories": ${targetCalories},
          "totalProtein": ${proteinTarget}
        },
        /* REPETIR PARA tuesday, wednesday, thursday, friday, saturday, sunday - CADA DÍA CON RECETAS COMPLETAMENTE DIFERENTES */
      ],
      "shoppingList": [
        {
          "category": "Proteínas",
          "items": ["Pollo 500g", "Pescado 300g", "Huevos 12 unidades"]
        }
      ],
      "prepTips": ["Meal prep dominical (90 min)", "Batch cooking proteínas", "Pre-cortar vegetales", "Hidratación: ${Math.round(data.weight * 35)}ml/día"],
      "createdAt": "${new Date().toISOString()}",
      "updatedAt": "${new Date().toISOString()}"
    }
  }
}

📋 **CRITERIOS PROFESIONALES:**
- Varía fuentes de proteína, carbohidratos y verduras a lo largo de la semana
- Usa técnicas de cocción apropiadas para el tiempo disponible
- Crea recetas únicas y variadas para cada día
- Las cantidades deben estar en gramos o unidades específicas

🚨 **ESTRUCTURA JSON REQUERIDA:**
- weeklyPlan.days: array de 7 objetos (monday a sunday)
- Cada día: day, breakfast[], lunch[], dinner[], totalCalories, totalProtein
- Cada comida: title, description, prepTime, recipe, calories, protein, foods[]
- Cada food: name, quantity, unit, calories, protein, carbs, fats

✅ **VERIFICACIÓN FINAL:**
- Cada día suma aproximadamente ${targetCalories} kcal (±50)
- Proteína diaria cerca de ${proteinTarget}g
- Todas las cantidades en gramos/unidades específicas
- Plan completo de 7 días únicos`
  }

  /**
   * 🎯 PROMPT PRINCIPAL - PLAN COMPLETO (ENTRENAMIENTO + NUTRICIÓN)
   */
  static generateMainPrompt(data: OnboardingData, bmr: number, targetCalories: number, proteinTarget: number): string {
    const cookingTime = data.cookingTime || 'moderate'
    
    return `Eres un ENTRENADOR PERSONAL CERTIFICADO (NSCA-CPT) y NUTRICIONISTA DEPORTIVO CERTIFICADO (ISSN) con especialización en periodización científica y nutrición personalizada basada en evidencia.

PERFIL COMPLETO DEL CLIENTE:
- ${data.name}, ${data.age} años, ${data.gender}, ${data.weight}kg, ${data.height}cm
- IMC: ${(data.weight / Math.pow(data.height/100, 2)).toFixed(1)} kg/m²
- BMR: ${Math.round(bmr)} kcal/día
- Objetivo principal: ${data.primaryGoal}
- Nivel de experiencia: ${data.experienceLevel}
- Actividad actual: ${data.currentActivity}
- Disponibilidad: ${data.workoutFrequency} días/semana × ${data.timePerWorkout} min
- Comidas preferidas: ${data.mealsPerDay}/día
- Tiempo de cocina: ${cookingTime}
- Presupuesto: ${data.budget}
- Restricciones físicas: ${[...(data.injuries || []), ...(data.healthConditions || [])].join(', ') || 'Ninguna'}
- Restricciones alimentarias: ${(data.dietaryRestrictions || []).join(', ') || 'Sin restricciones'}${data.additionalInfo ? `

🎯 **INFORMACIÓN PRIORITARIA DEL CLIENTE:**
"${data.additionalInfo}"
⚠️ Esta información tiene MÁXIMA PRIORIDAD y debe guiar TODAS tus decisiones profesionales.` : ''}

INSTRUCCIONES PROFESIONALES:

Como profesional certificado con experiencia, analiza COMPLETAMENTE el perfil del cliente y diseña un programa integral científicamente fundamentado y totalmente personalizado.

🏋️ **PROGRAMACIÓN DE ENTRENAMIENTO:**
- Usa tu criterio profesional para determinar estructura óptima del entrenamiento
- Adapta todos los elementos (ejercicios, sets, reps, descansos) al perfil específico
- Incluye calentamiento, entrenamiento principal y vuelta a la calma SI ES APROPIADO
- Considera limitaciones físicas, equipo disponible y tiempo total disponible
- Progresión apropiada para ${data.experienceLevel} con objetivos de ${data.primaryGoal}
- Programa diseñado para ${data.workoutFrequency} días/semana

🥗 **PROGRAMACIÓN NUTRICIONAL:**
- Calorías calculadas: ${targetCalories} kcal/día (usa tu criterio profesional para ajustar)
- Proteína objetivo: ${proteinTarget}g/día (ajusta según perfil completo)
- Usa tu criterio profesional para distribución de macronutrientes óptima
- Adapta COMPLETAMENTE el plan al perfil del cliente
- Plan semanal completo con ${data.mealsPerDay} comidas/día
- Considera restricciones, presupuesto y tiempo de cocina
- Varía fuentes proteicas, carbohidratos y técnicas de cocción

🔥 **PERSONALIZACIÓN TOTAL:**
- Si hay información adicional del cliente, es PRIORIDAD MÁXIMA
- Adapta TODO al objetivo específico y preferencias
- Respeta absolutamente cualquier restricción física o alimentaria
- Cada día debe ser único y variado en el plan nutricional
- Ejercicios seguros y apropiados para el perfil específico

FORMATO JSON REQUERIDO:

{
  "trainingPlan": {
    "id": "training-${Date.now()}",
    "name": "Programa Personalizado - ${data.name}",
    "description": "Plan científico adaptado completamente al perfil del cliente",
    "duration": ${data.timeframe === '1-3' ? 3 : data.timeframe === '3-6' ? 6 : 12},
    "frequency": ${data.workoutFrequency},
    "workoutDays": [/* Diseña ${data.workoutFrequency} días de entrenamiento personalizados usando tu criterio profesional */],
    "isActive": true,
    "createdAt": "${new Date().toISOString()}",
    "updatedAt": "${new Date().toISOString()}"
  },
  "nutritionPlan": {
    "goals": {
      "dailyCalories": ${targetCalories},
      "dailyProtein": ${proteinTarget},
      "dailyCarbs": ${Math.round(targetCalories * 0.45 / 4)},
      "dailyFats": ${Math.round(targetCalories * 0.25 / 9)},
      "calorieDeficit": ${data.primaryGoal === 'lose_weight' ? 400 : 0}
    },
    "weeklyPlan": {
      "id": "meal-plan-${Date.now()}",
      "name": "Plan Nutricional Profesional",
      "description": "Programa alimentario diseñado específicamente para el perfil del cliente",
      "days": [/* Diseña 7 días únicos con recetas variadas y nutritivas - cada día debe sumar aproximadamente ${targetCalories} kcal */],
      "shoppingList": [/* Lista de compras basada en las recetas generadas */],
      "prepTips": ["Meal prep según tiempo disponible", "Optimización de preparación", "Hidratación: ${Math.round(data.weight * 35)}ml/día"],
      "createdAt": "${new Date().toISOString()}",
      "updatedAt": "${new Date().toISOString()}"
    }
  },
  "tips": [
    "Progresión apropiada basada en tu nivel y objetivos específicos",
    "Recuperación óptima: ${data.age < 30 ? '48-72h' : '72h+'} entre sesiones del mismo grupo muscular",
    "Nutrición post-entreno adaptada a tu objetivo de ${data.primaryGoal}",
    "Hidratación personalizada: ${Math.round(data.weight * 35)}ml agua/día + extra durante ejercicio",
    "Monitoreo de progreso adaptado a tu perfil específico"
  ]
}

📋 **CRITERIOS PROFESIONALES:**
- Usa tu experiencia para determinar el número óptimo de ejercicios por sesión
- Sets y reps apropiados para el nivel específico y objetivo del cliente
- Fuentes proteicas variadas a lo largo de la semana según preferencias
- Técnicas de cocción apropiadas para el tiempo disponible
- URLs de YouTube reales para demostraciones de ejercicios
- Todas las cantidades en gramos o unidades específicas

✅ **VERIFICACIÓN FINAL:**
- El plan de entrenamiento es seguro y apropiado para el perfil
- Cada día nutricional suma aproximadamente ${targetCalories} kcal (±50)
- Se respetan todas las restricciones físicas y alimentarias
- El programa es realista para el estilo de vida del cliente
- Plan completo y variado de 7 días únicos

🚨 **ESTRUCTURA JSON OBLIGATORIA:**
- workoutDays: array con los días de entrenamiento diseñados profesionalmente
- weeklyPlan.days: array de 7 objetos (monday a sunday)
- Cada día nutricional: day, breakfast[], lunch[], dinner[], totalCalories, totalProtein
- Cada comida: title, description, prepTime, recipe, calories, protein, foods[]
- Cada food: name, quantity, unit, calories, protein, carbs, fats
`
  }
}

export type { OnboardingData }