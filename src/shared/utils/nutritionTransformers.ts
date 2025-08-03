import { DayMealPlan, MealOption, WeeklyMealPlan } from '@/domains/nutrition/types'

// Tipos para datos que vienen de la IA
interface AIMealData {
  carb: string
  protein: string
  vegetable: string 
  recipe: string
}

interface AIDayPlan {
  day: string
  meals: {
    breakfast: AIMealData
    lunch: AIMealData
    dinner: AIMealData
  }
}

interface AIWeeklyPlan {
  days: AIDayPlan[]
  goals?: {
    dailyCalories: number
    dailyProtein: number
  }
}

// Mapeo de nombres de días de español a inglés
const dayNameMapping: Record<string, string> = {
  'Lunes': 'monday',
  'Martes': 'tuesday', 
  'Miércoles': 'wednesday',
  'Jueves': 'thursday',
  'Viernes': 'friday',
  'Sábado': 'saturday',
  'Domingo': 'sunday'
}

// Función para estimar calorías y macros basado en ingredientes
function estimateNutrition(meal: AIMealData): { calories: number, protein: number } {
  // Estimaciones muy básicas - en el futuro podrías usar una API de nutrición
  const proteinCalories: Record<string, { calories: number, protein: number }> = {
    'Huevos': { calories: 140, protein: 12 },
    'Pechuga de pollo': { calories: 200, protein: 40 },
    'Garbanzos': { calories: 150, protein: 8 },
    'Atún': { calories: 180, protein: 35 },
    'Salmón': { calories: 220, protein: 25 },
    'Ternera': { calories: 250, protein: 35 },
    'default': { calories: 150, protein: 20 }
  }

  const carbCalories: Record<string, number> = {
    'Tostadas integrales': 140,
    'Pasta': 200,
    'Bulgur': 180,
    'Arroz': 200,
    'Patatas': 150,
    'default': 150
  }

  const vegCalories = 30 // Estimación base para verduras

  const proteinData = proteinCalories[meal.protein] || proteinCalories.default
  const carbCals = carbCalories[meal.carb] || carbCalories.default

  return {
    calories: proteinData.calories + carbCals + vegCalories,
    protein: proteinData.protein
  }
}

// Función para transformar datos de IA al formato esperado
export function transformAIMealToMealOption(aiMeal: AIMealData, mealType: string): MealOption {
  const nutrition = estimateNutrition(aiMeal)
  
  return {
    title: aiMeal.recipe,
    description: `${aiMeal.protein} con ${aiMeal.carb.toLowerCase()} y ${aiMeal.vegetable.toLowerCase()}`,
    prepTime: mealType === 'breakfast' ? 10 : mealType === 'lunch' ? 25 : 15,
    recipe: aiMeal.recipe,
    foods: [
      {
        name: aiMeal.protein,
        quantity: aiMeal.protein.includes('Huevos') ? 2 : 150,
        unit: aiMeal.protein.includes('Huevos') ? 'unidades' : 'g',
        calories: nutrition.calories * 0.6, // Aprox 60% de calorías de proteína
        protein: nutrition.protein,
        carbs: 0,
        fats: 5
      },
      {
        name: aiMeal.carb,
        quantity: 80,
        unit: 'g',
        calories: nutrition.calories * 0.3, // Aprox 30% de calorías de carbos
        protein: 2,
        carbs: nutrition.calories * 0.3 / 4, // 4 cal por gramo de carbs
        fats: 1
      },
      {
        name: aiMeal.vegetable,
        quantity: 200,
        unit: 'g',
        calories: nutrition.calories * 0.1, // Aprox 10% de calorías de verduras
        protein: 1,
        carbs: 5,
        fats: 0
      }
    ],
    calories: nutrition.calories,
    protein: nutrition.protein
  }
}

// Función principal para transformar un día de IA al formato esperado
export function transformAIDayToDayMealPlan(aiDay: AIDayPlan): DayMealPlan {
  const dayKey = dayNameMapping[aiDay.day] || aiDay.day.toLowerCase()
  
  const breakfast = transformAIMealToMealOption(aiDay.meals.breakfast, 'breakfast')
  const lunch = transformAIMealToMealOption(aiDay.meals.lunch, 'lunch') 
  const dinner = transformAIMealToMealOption(aiDay.meals.dinner, 'dinner')
  
  const totalCalories = breakfast.calories + lunch.calories + dinner.calories
  const totalProtein = breakfast.protein + lunch.protein + dinner.protein

  return {
    id: `${dayKey}-plan-ai`,
    day: dayKey as any,
    breakfast: [breakfast],
    lunch: [lunch], 
    dinner: [dinner],
    totalCalories,
    totalProtein,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Función para generar lista de compras basada en los días del plan
function generateShoppingListFromDays(days: DayMealPlan[]): any[] {
  const ingredientCounts: Record<string, { category: string, count: number }> = {}
  
  // Mapeo de ingredientes a categorías
  const categoryMapping: Record<string, string> = {
    // Proteínas
    'Huevos': 'proteins',
    'Pechuga de pollo': 'proteins', 
    'Pollo': 'proteins',
    'Garbanzos': 'proteins',
    'Atún': 'proteins',
    'Salmón': 'proteins',
    'Ternera': 'proteins',
    
    // Carbohidratos
    'Tostadas integrales': 'grains',
    'Pasta': 'grains',
    'Bulgur': 'grains',
    'Arroz': 'grains',
    'Patatas': 'vegetables',
    
    // Verduras
    'Tomates': 'vegetables',
    'Espinacas': 'vegetables',
    'Pimientos': 'vegetables',
    'Cebolla': 'vegetables',
    'Lechuga': 'vegetables'
  }

  days.forEach(day => {
    const allMeals = [...(day.breakfast || []), ...(day.lunch || []), ...(day.dinner || [])]
    
    allMeals.forEach(meal => {
      if (meal.foods && Array.isArray(meal.foods)) {
        meal.foods.forEach(food => {
          const ingredientName = food.name
          const category = categoryMapping[ingredientName] || 'pantry'
          
          if (ingredientCounts[ingredientName]) {
            ingredientCounts[ingredientName].count++
          } else {
            ingredientCounts[ingredientName] = { category, count: 1 }
          }
        })
      }
    })
  })

  // Convertir a formato de lista de compras
  return Object.entries(ingredientCounts).map(([name, data]) => {
    let quantity = '1 porción'
    
    // Estimar cantidades en gramos/kilos/unidades
    if (name.includes('Huevos')) {
      quantity = `${data.count * 2} unidades`
    } else if (name.includes('Pollo') || name.includes('Ternera') || name.includes('Salmón') || name.includes('Atún') || name.includes('Pescado')) {
      const totalGrams = Math.ceil(data.count * 150)
      quantity = totalGrams >= 1000 ? `${(totalGrams/1000).toFixed(1)}kg` : `${totalGrams}g`
    } else if (name.includes('Arroz') || name.includes('Pasta') || name.includes('Quinoa') || name.includes('Avena')) {
      const totalGrams = Math.ceil(data.count * 80)
      quantity = totalGrams >= 1000 ? `${(totalGrams/1000).toFixed(1)}kg` : `${totalGrams}g`
    } else if (categoryMapping[name] === 'vegetables') {
      const totalGrams = Math.ceil(data.count * 200)
      quantity = totalGrams >= 1000 ? `${(totalGrams/1000).toFixed(1)}kg` : `${totalGrams}g`
    } else {
      quantity = `${Math.ceil(data.count * 100)}g`
    }
    
    return {
      category: data.category,
      name,
      quantity,
      estimated: true
    }
  })
}

// Función para transformar plan semanal completo de IA
export function transformAIWeeklyPlan(aiPlan: AIWeeklyPlan, userId: string): WeeklyMealPlan {
  const transformedDays = aiPlan.days.map(transformAIDayToDayMealPlan)

  return {
    id: `ai-weekly-plan-${Date.now()}`,
    name: 'Plan Semanal Generado por IA',
    description: 'Plan nutricional personalizado creado con inteligencia artificial',
    days: transformedDays,
    shoppingList: generateShoppingListFromDays(transformedDays),
    prepTips: [
      'Plan generado por IA basado en tus preferencias',
      'Ajusta las porciones según tu apetito',
      'Puedes intercambiar comidas del mismo tipo entre días'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// 🔥 NUEVO: Formato de IA con meals array
interface AINewFormat {
  day: string
  meals: Array<{
    name: string
    total: {
      calories: number
      protein: number
      carbs: number
      fats: number
    }
    ingredients: {
      protein: string
      carb: string
      vegetable: string
    }
  }>
  totals: {
    calories: number
    protein: number
    carbs: number
    fats: number
  }
}

// 🔥 NUEVO: Transformador para el nuevo formato de IA
export function transformNewAIFormatToDayMealPlan(newAIData: AINewFormat): DayMealPlan {
  console.log('🔄 Iniciando transformación de nuevo formato:', newAIData)
  
  try {
    const dayKey = dayNameMapping[newAIData.day] || newAIData.day.toLowerCase()
    console.log('📅 Día transformado:', newAIData.day, '→', dayKey)
    
    // Mapear meals array a breakfast, lunch, dinner
    const meals = newAIData.meals || []
    console.log('🍽️ Meals array:', meals.length, 'comidas')
    
    const breakfast = meals[0] ? transformNewAIMealToMealOption(meals[0], 'breakfast') : null
    const lunch = meals[1] ? transformNewAIMealToMealOption(meals[1], 'lunch') : null  
    const dinner = meals[2] ? transformNewAIMealToMealOption(meals[2], 'dinner') : null

    const result = {
      id: `${dayKey}-plan-new-ai`,
      day: dayKey as any,
      breakfast: breakfast ? [breakfast] : [],
      lunch: lunch ? [lunch] : [],
      dinner: dinner ? [dinner] : [],
      totalCalories: newAIData.totals?.calories || 0,
      totalProtein: newAIData.totals?.protein || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('✅ Transformación completada:', result)
    return result
  } catch (error) {
    console.error('❌ Error en transformación:', error)
    console.error('❌ Datos originales:', newAIData)
    throw error
  }
}

// 🔥 NUEVO: Transformar meal individual del nuevo formato
function transformNewAIMealToMealOption(aiMeal: any, mealType: string): MealOption {
  // 🔥 VALIDACIONES DEFENSIVAS
  const name = aiMeal?.name || 'Comida sin nombre'
  const ingredients = aiMeal?.ingredients || {}
  const total = aiMeal?.total || { calories: 300, protein: 20, carbs: 30, fats: 10 }
  
  const protein = ingredients.protein || 'Proteína'
  const carb = ingredients.carb || 'Carbohidrato'
  const vegetable = ingredients.vegetable || 'Verdura'
  
  // Crear descripción segura
  const carbLower = typeof carb === 'string' ? carb.toLowerCase() : 'carbohidrato'
  const vegLower = typeof vegetable === 'string' ? vegetable.toLowerCase() : 'verdura'
  
  console.log('🔍 Transformando meal:', { name, protein, carb, vegetable, total })
  
  return {
    title: name,
    description: `${protein} con ${carbLower} y ${vegLower}`,
    prepTime: mealType === 'breakfast' ? 10 : mealType === 'lunch' ? 25 : 15,
    recipe: name,
    foods: [
      {
        name: protein,
        quantity: protein.toLowerCase().includes('huevos') ? 2 : 150,
        unit: protein.toLowerCase().includes('huevos') ? 'unidades' : 'g',
        calories: Math.round((total.calories || 300) * 0.4),
        protein: Math.round((total.protein || 20) * 0.8),
        carbs: 0,
        fats: Math.round((total.fats || 10) * 0.3)
      },
      {
        name: carb,
        quantity: 80,
        unit: 'g',
        calories: Math.round((total.calories || 300) * 0.4),
        protein: Math.round((total.protein || 20) * 0.1),
        carbs: Math.round((total.carbs || 30) * 0.8),
        fats: Math.round((total.fats || 10) * 0.2)
      },
      {
        name: vegetable,
        quantity: 200,
        unit: 'g',
        calories: Math.round((total.calories || 300) * 0.2),
        protein: Math.round((total.protein || 20) * 0.1),
        carbs: Math.round((total.carbs || 30) * 0.2),
        fats: Math.round((total.fats || 10) * 0.1)
      }
    ],
    calories: total.calories || 300,
    protein: total.protein || 20
  }
}

// Función para detectar si los datos son del formato de IA ORIGINAL
export function isAIFormat(data: any): boolean {
  return data && 
         typeof data.day === 'string' && 
         data.meals && 
         data.meals.breakfast && 
         data.meals.lunch && 
         data.meals.dinner &&
         typeof data.meals.breakfast.recipe === 'string'
}

// 🔥 NUEVO: Detectar nuevo formato de IA (con validaciones defensivas)
export function isNewAIFormat(data: any): boolean {
  try {
    return data &&
           typeof data.day === 'string' &&
           Array.isArray(data.meals) &&
           data.meals.length > 0 &&
           data.meals[0] &&
           typeof data.meals[0].name === 'string' &&
           data.totals &&
           typeof data.totals === 'object'
  } catch (error) {
    console.warn('Error detectando nuevo formato de IA:', error)
    return false
  }
}

// Función para detectar si los datos son del formato estándar
export function isStandardFormat(data: any): boolean {
  return data &&
         typeof data.day === 'string' &&
         Array.isArray(data.breakfast) &&
         Array.isArray(data.lunch) &&
         Array.isArray(data.dinner)
}