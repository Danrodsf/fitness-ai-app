import { TrainingProgram, WorkoutDay as TrainingWorkoutDay } from '@/domains/training/types'
import { NutritionGoals, WeeklyMealPlan, DayMealPlan } from '@/domains/nutrition/types'
import { AIPrompts, type OnboardingData } from './prompts/aiPrompts'
import { NutritionCalculator } from './calculators/nutritionCalculator'

interface AIResponse {
  trainingPlan: TrainingProgram
  nutritionPlan: {
    goals: NutritionGoals
    weeklyPlan: WeeklyMealPlan
  }
  tips: string[]
}

export class AIService {
  private static readonly AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || ''
  private static readonly AI_API_KEY = import.meta.env.VITE_AI_API_KEY || ''

  // 🔥 PROMPT SOLO PARA ENTRENAMIENTO
  static generateTrainingOnlyPrompt(data: OnboardingData): string {
    return AIPrompts.generateTrainingOnlyPrompt(data)
  }

  // 🔥 PROMPT SOLO PARA NUTRICIÓN
  static generateNutritionOnlyPrompt(data: OnboardingData): string {
    const bmr = NutritionCalculator.calculateBMR(data)
    const targetCalories = NutritionCalculator.calculateTargetCalories(data, bmr)
    const proteinTarget = NutritionCalculator.calculateProteinTarget(data)
    
    return AIPrompts.generateNutritionOnlyPrompt(data, targetCalories, proteinTarget)
  }

  // 🎯 PROMPT PRINCIPAL - PLAN COMPLETO
  static generatePrompt(data: OnboardingData): string {
    const bmr = NutritionCalculator.calculateBMR(data)
    const targetCalories = NutritionCalculator.calculateTargetCalories(data, bmr)
    const proteinTarget = NutritionCalculator.calculateProteinTarget(data)
    
    return AIPrompts.generateMainPrompt(data, bmr, targetCalories, proteinTarget)
  }

  // Generar key para cache basado en datos del usuario
  private static generateCacheKey(data: OnboardingData): string {
    const keyData = {
      age: data.age,
      weight: data.weight,
      height: data.height,
      primaryGoal: data.primaryGoal,
      currentActivity: data.currentActivity,
      timePerWorkout: data.timePerWorkout,
      mealsPerDay: data.mealsPerDay,
      dietaryRestrictions: data.dietaryRestrictions?.sort().join(',') || '',
      cookingTime: data.cookingTime,
      additionalInfo: data.additionalInfo || ''
    }
    return `ai_plans_${JSON.stringify(keyData).replace(/[^a-zA-Z0-9]/g, '')}`
  }

  // Guardar respuesta en cache
  private static saveToCache(cacheKey: string, response: AIResponse): void {
    try {
      const cacheData = {
        response,
        timestamp: Date.now(),
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      // Silently fail cache save
    }
  }

  // Cargar respuesta desde cache
  private static loadFromCache(cacheKey: string): AIResponse | null {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const cacheData = JSON.parse(cached)
      
      // Verificar si no ha expirado
      if (Date.now() > cacheData.expiry) {
        localStorage.removeItem(cacheKey)
        return null
      }

      return cacheData.response
    } catch (error) {
      return null
    }
  }

  // 🔄 REGENERAR SOLO PLAN DE ENTRENAMIENTO
  static async regenerateTrainingPlan(data: OnboardingData): Promise<TrainingProgram> {
    
    if (!this.AI_ENDPOINT || !this.AI_API_KEY) {
      throw new Error('IA no configurada - no se puede regenerar plan')
    }

    try {
      const prompt = this.generateTrainingOnlyPrompt(data)
      
      const response = await fetch(this.AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un ENTRENADOR PERSONAL CERTIFICADO especializado en programación de entrenamientos. Respondes SIEMPRE con JSON válido completo. IMPORTANTE: NO uses markdown, NO uses ```json, responde SOLO con el objeto JSON sin formatear.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.9, // Más creatividad para planes únicos
          max_tokens: 4000
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const result = await response.json()
      let aiContent = result.choices[0].message.content
      
      // 🔥 ARREGLADO: Limpiar markdown code blocks si existen
      if (aiContent.includes('```json')) {
        aiContent = aiContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
      }
      
      const parsedResponse = JSON.parse(aiContent)
      
      if (!parsedResponse.trainingPlan) {
        throw new Error('Invalid AI response - missing training plan')
      }

      return this.transformAITrainingPlan(parsedResponse.trainingPlan)
    } catch (error) {
      throw error
    }
  }

  // Transform AI response to match our component structure
  private static transformAITrainingPlan(aiPlan: any): TrainingProgram {
    return {
      ...aiPlan,
      workoutDays: aiPlan.workoutDays?.map((day: any) => ({
        ...day,
        exercises: day.exercises?.map((aiExercise: any, index: number) => ({
          exercise: {
            id: `exercise-${day.id || day.name}-${index}`,
            name: aiExercise.name,
            description: aiExercise.description || '',
            videoUrl: aiExercise.videoUrl,
            tips: aiExercise.tips || [],
            targetMuscles: aiExercise.targetMuscles || [],
            difficulty: aiExercise.difficulty || 'beginner',
            category: aiExercise.category || 'push',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          plannedSets: aiExercise.sets || 3,
          plannedReps: aiExercise.reps || '8-12',
          actualSets: [],
          completed: false
        })) || []
      })) || []
    }
  }

  // 🔄 REGENERAR SOLO PLAN NUTRICIONAL
  static async regenerateNutritionPlan(data: OnboardingData): Promise<{ goals: NutritionGoals; weeklyPlan: WeeklyMealPlan }> {
    
    if (!this.AI_ENDPOINT || !this.AI_API_KEY) {
      throw new Error('IA no configurada - no se puede regenerar plan')
    }

    try {
      const prompt = this.generateNutritionOnlyPrompt(data)
      
      const response = await fetch(this.AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres un NUTRICIONISTA DEPORTIVO CERTIFICADO especializado en planes alimentarios. Respondes SIEMPRE con JSON válido completo. IMPORTANTE: Generar EXACTAMENTE la estructura JSON especificada, con todos los campos requeridos. NO usar markdown, NO explicaciones adicionales, SOLO JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7, // Menos creatividad para mejor consistencia estructural
          max_tokens: 6000 // Más tokens para plan completo de 7 días
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const result = await response.json()
      let aiContent = result.choices[0].message.content
      
      // 🔥 ARREGLADO: Limpiar markdown code blocks si existen
      if (aiContent.includes('```json')) {
        aiContent = aiContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
      }
      
      const parsedResponse = JSON.parse(aiContent)
      
      if (!parsedResponse.nutritionPlan) {
        throw new Error('Invalid AI response - missing nutrition plan')
      }

      // 🔥 VALIDACIÓN ADICIONAL: Verificar estructura del plan
      const nutritionPlan = parsedResponse.nutritionPlan
      if (!nutritionPlan.weeklyPlan || !nutritionPlan.weeklyPlan.days || !Array.isArray(nutritionPlan.weeklyPlan.days)) {
        throw new Error('Invalid nutrition plan structure - missing or invalid weeklyPlan.days')
      }

      if (nutritionPlan.weeklyPlan.days.length !== 7) {
      }

      // Validar que cada día tenga la estructura correcta
      nutritionPlan.weeklyPlan.days.forEach((day: any) => {
        if (!day.day || !day.breakfast || !day.lunch || !day.dinner) {
          // Day structure validation failed
        }
      })

      return nutritionPlan
    } catch (error) {
      throw error
    }
  }

  // 🚀 GENERAR PLANES COMPLETOS
  static async generatePlans(data: OnboardingData, forceNewCall: boolean = false): Promise<AIResponse> {
    // Generar key de cache
    const cacheKey = this.generateCacheKey(data)
    
    // Solo usar cache si NO se fuerza nueva llamada
    if (!forceNewCall) {
      const cachedResponse = this.loadFromCache(cacheKey)
      if (cachedResponse) {
        return cachedResponse
      }
    }

    // Si no hay configuración de IA, devolver plan por defecto
    if (!this.AI_ENDPOINT || !this.AI_API_KEY) {
      return this.generateDefaultPlan(data)
    }

    try {
      const prompt = this.generatePrompt(data)
      
      const response = await fetch(this.AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // o el modelo que uses
          messages: [
            {
              role: 'system',
              content: 'Eres un ENTRENADOR PERSONAL CERTIFICADO y NUTRICIONISTA DEPORTIVO con 15 años de experiencia. Especialista en programación científica de entrenamientos y nutrición deportiva. Respondes SIEMPRE con JSON válido completo y detallado.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8, // Más creatividad para planes únicos
          max_tokens: 8000 // Aumentado para planes completos
        })
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const result = await response.json()
      let aiContent = result.choices[0].message.content

      // 🔥 ARREGLADO: Limpiar markdown code blocks si existen
      if (aiContent.includes('```json')) {
        aiContent = aiContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '')
      }

      // Parsear la respuesta JSON
      const parsedResponse = JSON.parse(aiContent)
      
      // Validar que tenga la estructura esperada
      if (!parsedResponse.trainingPlan || !parsedResponse.nutritionPlan) {
        throw new Error('Invalid AI response structure')
      }

      const aiResponse = {
        ...parsedResponse,
        trainingPlan: this.transformAITrainingPlan(parsedResponse.trainingPlan)
      } as AIResponse
      
      // Guardar en cache la respuesta exitosa (solo si no es forzada)
      if (!forceNewCall) {
        this.saveToCache(cacheKey, aiResponse)
      }

      return aiResponse

    } catch (error) {
      // Fallback to default plan if AI fails
      return this.generateDefaultPlan(data)
    }
  }

  // 🔧 PLAN POR DEFECTO
  private static generateDefaultPlan(data: OnboardingData): AIResponse {
    const bmr = NutritionCalculator.calculateBMR(data)
    const calories = NutritionCalculator.calculateTargetCalories(data, bmr)
    const proteinTarget = NutritionCalculator.calculateProteinTarget(data)
    const macros = NutritionCalculator.calculateMacros(calories, data.primaryGoal)
    const timestamp = new Date().toISOString()

    return {
      trainingPlan: {
        id: `default-training-${Date.now()}`,
        name: `Plan personalizado para ${data.name}`,
        description: `Plan de ${data.primaryGoal} para nivel ${data.experienceLevel}`,
        duration: 12,
        frequency: data.workoutFrequency,
        workoutDays: this.generateDefaultWorkoutDays(data, timestamp),
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      nutritionPlan: {
        goals: {
          dailyCalories: calories,
          dailyProtein: proteinTarget,
          dailyCarbs: macros.carbs,
          dailyFats: macros.fats,
          calorieDeficit: data.primaryGoal === 'lose_weight' ? 500 : 0
        },
        weeklyPlan: {
          id: `default-meal-plan-${Date.now()}`,
          name: 'Plan Alimenticio Estándar',
          description: `Plan nutricional para ${data.primaryGoal} con ${data.mealsPerDay} comidas diarias`,
          days: this.generateDefaultMealDays(data, calories, macros, timestamp),
          shoppingList: this.generateDefaultShoppingList(),
          prepTips: [
            'Prepara tus comidas el domingo para toda la semana',
            'Mantén snacks saludables siempre a mano',
            `Bebe al menos ${NutritionCalculator.calculateDailyHydration(data.weight, data.workoutFrequency)}ml de agua al día`
          ],
          createdAt: timestamp,
          updatedAt: timestamp
        }
      },
      tips: [
        'Mantén constancia en tu rutina de ejercicios',
        `Hidratación diaria: ${NutritionCalculator.calculateDailyHydration(data.weight, data.workoutFrequency)}ml`,
        `Tiempo de recuperación: ${NutritionCalculator.calculateRecoveryTime(data.age, data.experienceLevel)} entre sesiones`,
        'Escucha a tu cuerpo y ajusta la intensidad según sea necesario'
      ]
    }
  }

  private static generateDefaultWorkoutDays(data: OnboardingData, timestamp: string): TrainingWorkoutDay[] {
    const days: ('monday' | 'wednesday' | 'friday')[] = ['monday', 'wednesday', 'friday']
    const workoutNames = ['Tren Superior', 'Piernas', 'Full Body']
    
    return days.slice(0, data.workoutFrequency).map((day, index) => ({
      id: `default-workout-${day}`,
      name: workoutNames[index],
      description: `Entrenamiento ${workoutNames[index]} para ${data.experienceLevel}`,
      day,
      exercises: [
        {
          exercise: {
            id: `exercise-${day}-1`,
            name: index === 0 ? 'Flexiones' : index === 1 ? 'Sentadillas' : 'Burpees',
            description: 'Ejercicio básico fundamental',
            videoUrl: 'https://www.youtube.com/watch?v=ejemplo',
            tips: ['Mantén la forma correcta', 'Controla el movimiento'],
            targetMuscles: index === 0 ? ['Pectorales', 'Tríceps'] : index === 1 ? ['Cuádriceps', 'Glúteos'] : ['Todo el cuerpo'],
            difficulty: data.experienceLevel as any,
            category: index === 0 ? 'push' : index === 1 ? 'legs' : 'cardio',
            createdAt: timestamp,
            updatedAt: timestamp
          },
          plannedSets: 3,
          plannedReps: data.experienceLevel === 'beginner' ? '8-10' : '12-15',
          actualSets: [],
          completed: false
        }
      ],
      estimatedDuration: data.timePerWorkout,
      completed: false,
      warmUp: ['Calentamiento general', 'Movilidad articular'],
      createdAt: timestamp,
      updatedAt: timestamp
    }))
  }

  private static generateDefaultMealDays(data: OnboardingData, calories: number, macros: any, timestamp: string): DayMealPlan[] {
    const days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[] = 
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    // 🔥 NUEVO: Definir comidas variadas para cada día
    const mealTemplates = [
      // LUNES
      {
        breakfast: { title: 'Avena con plátano y almendras', protein: 'Almendras', carb: 'Avena' },
        lunch: { title: 'Pollo teriyaki con arroz integral', protein: 'Pollo', carb: 'Arroz integral' },
        dinner: { title: 'Salmón al horno con quinoa', protein: 'Salmón', carb: 'Quinoa' }
      },
      // MARTES
      {
        breakfast: { title: 'Tortilla de espinacas con tostada integral', protein: 'Huevos', carb: 'Pan integral' },
        lunch: { title: 'Pescado a la plancha con pasta integral', protein: 'Pescado blanco', carb: 'Pasta integral' },
        dinner: { title: 'Lentejas estofadas con verduras', protein: 'Lentejas', carb: 'Legumbres' }
      },
      // MIÉRCOLES
      {
        breakfast: { title: 'Yogur griego con granola casera', protein: 'Yogur griego', carb: 'Granola' },
        lunch: { title: 'Pavo asado con batata y ensalada', protein: 'Pavo', carb: 'Batata' },
        dinner: { title: 'Tofu salteado con verduras asiáticas', protein: 'Tofu', carb: 'Verduras' }
      },
      // JUEVES
      {
        breakfast: { title: 'Huevos revueltos con aguacate', protein: 'Huevos', carb: 'Aguacate' },
        lunch: { title: 'Pollo al curry con arroz basmati', protein: 'Pollo', carb: 'Arroz basmati' },
        dinner: { title: 'Quinoa con garbanzos y vegetales', protein: 'Garbanzos', carb: 'Quinoa' }
      },
      // VIERNES
      {
        breakfast: { title: 'Smoothie verde con proteína', protein: 'Proteína en polvo', carb: 'Frutas' },
        lunch: { title: 'Atún con pasta y tomates cherry', protein: 'Atún', carb: 'Pasta' },
        dinner: { title: 'Carne magra con puré de coliflor', protein: 'Carne magra', carb: 'Coliflor' }
      },
      // SÁBADO
      {
        breakfast: { title: 'Salmón ahumado con tostada de centeno', protein: 'Salmón ahumado', carb: 'Pan de centeno' },
        lunch: { title: 'Ensalada de quinoa con pollo', protein: 'Pollo', carb: 'Quinoa' },
        dinner: { title: 'Pescado blanco al vapor con brócoli', protein: 'Pescado blanco', carb: 'Brócoli' }
      },
      // DOMINGO
      {
        breakfast: { title: 'Tortitas de avena con frutas del bosque', protein: 'Claras de huevo', carb: 'Avena' },
        lunch: { title: 'Bowl de Buddha con tempeh', protein: 'Tempeh', carb: 'Bulgur' },
        dinner: { title: 'Pollo asado con verduras mediterráneas', protein: 'Pollo', carb: 'Verduras' }
      }
    ]
    
    const mealDistribution = NutritionCalculator.calculateMealDistribution(calories, data.mealsPerDay)
    
    return days.map((day, index) => {
      const template = mealTemplates[index]
      
      return {
        id: `day-${day}`,
        day,
        breakfast: [
          {
            title: template.breakfast.title,
            description: `Desayuno energético con ${template.breakfast.protein}`,
            prepTime: 10,
            recipe: `Prepara ${template.breakfast.title} siguiendo técnicas saludables.`,
            foods: [
              {
                name: template.breakfast.carb,
                quantity: 50,
                unit: 'g',
                calories: 190,
                protein: 7,
                carbs: 32,
                fats: 3
              }
            ],
            calories: mealDistribution.breakfast || Math.round(calories * 0.25),
            protein: Math.round(macros.protein * 0.2)
          }
        ],
        lunch: [
          {
            title: template.lunch.title,
            description: `Almuerzo balanceado con ${template.lunch.protein}`,
            prepTime: 20,
            recipe: `Prepara ${template.lunch.title} de forma saludable.`,
            foods: [
              {
                name: template.lunch.protein,
                quantity: 150,
                unit: 'g',
                calories: 230,
                protein: 43,
                carbs: 0,
                fats: 5
              }
            ],
            calories: mealDistribution.lunch || Math.round(calories * 0.4),
            protein: Math.round(macros.protein * 0.4)
          }
        ],
        dinner: [
          {
            title: template.dinner.title,
            description: `Cena nutritiva con ${template.dinner.protein}`,
            prepTime: 25,
            recipe: `Prepara ${template.dinner.title} de manera saludable.`,
            foods: [
              {
                name: template.dinner.protein,
                quantity: 120,
                unit: 'g',
                calories: 250,
                protein: 35,
                carbs: 0,
                fats: 12
              }
            ],
            calories: mealDistribution.dinner || Math.round(calories * 0.25),
            protein: Math.round(macros.protein * 0.3)
          }
        ],
        snacks: data.mealsPerDay > 3 ? [
          {
            title: 'Snack proteico variado',
            description: 'Snack saludable del día',
            prepTime: 5,
            recipe: 'Snack saludable personalizado.',
            foods: [
              {
                name: 'Snack proteico',
                quantity: 100,
                unit: 'g',
                calories: 100,
                protein: 15,
                carbs: 6,
                fats: 2
              }
            ],
            calories: Math.round(calories * 0.1),
            protein: Math.round(macros.protein * 0.1)
          }
        ] : [],
        totalCalories: calories,
        totalProtein: macros.protein,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    })
  }

  private static generateDefaultShoppingList() {
    return [
      {
        category: 'proteins' as const,
        name: 'Pechuga de pollo',
        quantity: '1kg',
        estimated: false
      },
      {
        category: 'proteins' as const,
        name: 'Salmón',
        quantity: '500g',
        estimated: false
      },
      {
        category: 'grains' as const,
        name: 'Avena',
        quantity: '500g',
        estimated: false
      },
      {
        category: 'vegetables' as const,
        name: 'Brócoli',
        quantity: '2 unidades',
        estimated: false
      },
      {
        category: 'dairy' as const,
        name: 'Yogur griego',
        quantity: '1kg',
        estimated: false
      }
    ]
  }
}