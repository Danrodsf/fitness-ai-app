import { useEffect, useState } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { AIService } from '@/shared/services/AIService'
import { NutritionService } from '../services/nutritionService'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/shared/components/ui'
import { Target, Flame, Droplets, Sparkles, Apple, RefreshCw } from 'lucide-react'
import { MealPlanCard } from './MealPlanCard'
import { ProteinShakeGuide } from './ProteinShakeGuide'
import { ShoppingList } from './ShoppingList'
import { defaultNutritionGoals, defaultWeeklyMealPlan } from '../data/nutritionData'
import { transformAIDayToDayMealPlan, transformNewAIFormatToDayMealPlan, isAIFormat, isNewAIFormat } from '@/shared/utils/nutritionTransformers'

export const NutritionDashboard = () => {
  const { state, dispatch } = useAppContext()
  const { profile, user, updateProfile } = useAuth()
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 🔥 OPTIMIZADO: Cargar datos desde base de datos con menos logs y sin re-ejecutar innecesariamente
  useEffect(() => {
    const loadNutritionData = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      // NO cargar datos si el onboarding no está completado
      if (!profile?.preferences?.onboardingCompleted) {
        setIsLoading(false)
        return
      }

      // Evitar cargar si ya hay datos en el estado (prevenir llamadas duplicadas)
      if (state.nutrition.goals && state.nutrition.weeklyPlan) {
        setIsLoading(false)
        return
      }

      try {
        console.log('📊 Cargando datos nutricionales desde BD...')
        
        // Cargar objetivos nutricionales
        const goals = await NutritionService.getNutritionGoals(user.id)
        if (goals) {
          dispatch({
            type: 'NUTRITION_GOALS_UPDATE',
            payload: goals,
          })
        } else {
          dispatch({
            type: 'NUTRITION_GOALS_UPDATE',
            payload: defaultNutritionGoals,
          })
        }

        // Cargar plan de comidas más reciente
        const mealPlan = await NutritionService.getCurrentWeeklyMealPlan(user.id)
        if (mealPlan) {
          dispatch({
            type: 'MEAL_PLAN_LOAD',
            payload: mealPlan,
          })
          console.log('✅ Datos nutricionales cargados desde BD')
        } else {
          dispatch({
            type: 'MEAL_PLAN_LOAD',
            payload: defaultWeeklyMealPlan,
          })
          console.log('⚠️ Usando datos por defecto')
        }
      } catch (error) {
        console.error('❌ Error cargando datos nutricionales:', error)
        // Usar datos por defecto en caso de error
        dispatch({
          type: 'NUTRITION_GOALS_UPDATE',
          payload: defaultNutritionGoals,
        })
        dispatch({
          type: 'MEAL_PLAN_LOAD',
          payload: defaultWeeklyMealPlan,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionData()
  }, [user?.id, profile?.preferences?.onboardingCompleted, dispatch])

  // 🔥 NUEVO: Función para regenerar SOLO plan nutricional
  const handleRegeneratePlan = async () => {
    if (!user?.id || !profile?.preferences?.onboardingData) {
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pueden regenerar los datos. Completa el onboarding primero.'
        }
      })
      return
    }

    setIsRegenerating(true)
    try {
      console.log('🔄 Regenerando SOLO plan nutricional...')
      console.log('👤 Datos de usuario disponibles:', profile.preferences.onboardingData)
      
      // Regenerar SOLO plan nutricional con IA
      const newNutritionPlan = await AIService.regenerateNutritionPlan(profile.preferences.onboardingData)
      console.log('🍽️ Nuevo plan nutricional recibido:', newNutritionPlan)
      
      // Guardar SOLO el nuevo plan nutricional en Supabase
      if (user.id) {
        console.log('💾 Guardando en Supabase...')
        await NutritionService.saveNutritionGoals(user.id, newNutritionPlan.goals)
        await NutritionService.saveWeeklyMealPlan(user.id, newNutritionPlan.weeklyPlan)
        console.log('✅ Nuevo plan nutricional guardado en BD')
      }
      
      // Actualizar perfil manteniendo el plan de entrenamiento existente
      console.log('🔄 Actualizando perfil de usuario...')
      const updatedAiPlans = {
        ...profile.preferences.aiPlans,
        nutritionPlan: newNutritionPlan // Solo actualizar nutrición
      }
      
      await updateProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          aiPlans: updatedAiPlans
        }
      })

      // Recargar datos nutricionales en el estado
      console.log('🔄 Actualizando estado local...')
      dispatch({
        type: 'NUTRITION_GOALS_UPDATE',
        payload: newNutritionPlan.goals,
      })
      
      dispatch({
        type: 'MEAL_PLAN_LOAD',
        payload: newNutritionPlan.weeklyPlan,
      })

      console.log('✅ Regeneración completa exitosa')
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: '¡Plan nutricional regenerado!',
          message: 'Tu nuevo menú semanal ha sido creado con IA y guardado'
        }
      })
    } catch (error) {
      console.error('❌ Error regenerando plan nutricional:', error)
      
      // Mostrar error específico
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error regenerando plan',
          message: `${errorMessage}. Revisa la configuración de IA o inténtalo de nuevo.`
        }
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  // Mostrar loading mientras cargan los datos
  if (isLoading || !state.nutrition.goals || !state.nutrition.weeklyPlan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {isLoading ? 'Cargando plan nutricional desde base de datos...' : 'Cargando tu plan nutricional personalizado...'}
          </p>
        </div>
      </div>
    )
  }

  const { goals, weeklyPlan } = state.nutrition
  
  // Verificar si hay datos en BD (no usar aiNutritionPlan del profile)
  const isAIGenerated = weeklyPlan?.id !== 'default-meal-plan'

  // 🔥 MOSTRAR OBJETIVOS DE LA IA (sin cálculos complejos)
  const getNutritionMetrics = () => {
    // Si tenemos goals de la IA, usarlos directamente
    if (goals?.dailyCalories && goals?.dailyProtein) {
      console.log('📊 Usando objetivos de la IA:', {
        dailyCalories: goals.dailyCalories,
        dailyProtein: goals.dailyProtein,
        source: 'AI_GOALS'
      })
      
      return {
        avgDailyCalories: goals.dailyCalories,
        avgDailyProtein: goals.dailyProtein,
        source: 'AI_GENERATED'
      }
    }

    // Fallback: Si no hay goals, tratar de obtener del primer día del plan
    if (weeklyPlan?.days?.[0]?.totalCalories) {
      const firstDay = weeklyPlan.days[0]
      console.log('📊 Usando datos del primer día como referencia:', {
        dailyCalories: firstDay.totalCalories,
        dailyProtein: firstDay.totalProtein,
        source: 'FIRST_DAY'
      })
      
      return {
        avgDailyCalories: firstDay.totalCalories,
        avgDailyProtein: firstDay.totalProtein,
        source: 'PLAN_ESTIMATE'
      }
    }

    // Fallback final
    console.log('⚠️ No hay datos nutricionales disponibles, usando valores por defecto')
    return {
      avgDailyCalories: 2000,
      avgDailyProtein: 120,
      source: 'DEFAULT'
    }
  }

  const nutritionMetrics = getNutritionMetrics()

  // 🔥 GENERAR LISTA DE COMPRAS dinámicamente para planes de IA
  const generateDynamicShoppingList = () => {
    if (!weeklyPlan?.days || !Array.isArray(weeklyPlan.days) || !isAIGenerated) {
      return weeklyPlan?.shoppingList || []
    }

    const ingredientCounts: Record<string, { category: string, count: number }> = {}
    
    // Mapeo de ingredientes a categorías
    const categoryMapping: Record<string, string> = {
      'Huevos': 'proteins',
      'Pechuga de pollo': 'proteins', 
      'Pollo': 'proteins',
      'Garbanzos': 'proteins',
      'Atún': 'proteins',
      'Salmón': 'proteins',
      'Ternera': 'proteins',
      'Tostadas integrales': 'grains',
      'Pasta': 'grains',
      'Bulgur': 'grains',
      'Arroz': 'grains',
      'Patatas': 'vegetables',
      'Tomates': 'vegetables',
      'Espinacas': 'vegetables',
      'Pimientos': 'vegetables',
      'Cebolla': 'vegetables',
      'Lechuga': 'vegetables'
    }

    weeklyPlan.days.forEach(day => {
      // Transformar día si es necesario
      let processedDay = day
      if (isAIFormat(day)) {
        try {
          processedDay = transformAIDayToDayMealPlan(day as any)
        } catch (error) {
          return
        }
      }

      const allMeals = [...(processedDay.breakfast || []), ...(processedDay.lunch || []), ...(processedDay.dinner || [])]
      
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

    // Convertir a formato de lista de compras con cantidades en gramos/kilos
    return Object.entries(ingredientCounts).map(([name, data]) => {
      let quantity = '100g'
      
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

  const dynamicShoppingList = generateDynamicShoppingList()

  return (
    <div className="space-y-8">
      {/* Nutrition Goals Header */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl text-primary-600 dark:text-primary-400">
                  Plan Alimenticio
                </CardTitle>
                {isAIGenerated && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-full">
                    <Sparkles className="w-4 h-4" />
                    Generado por IA
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {isAIGenerated ? 
                  `Plan nutricional personalizado con ${nutritionMetrics.avgDailyCalories} calorías diarias` :
                  weeklyPlan.description
                }
              </p>
              {isAIGenerated && profile?.preferences?.onboardingData && (
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Apple className="w-4 h-4" />
                    {profile.preferences.onboardingData.mealsPerDay} comidas/día
                  </div>
                  <div>
                    Cocina: {profile.preferences.onboardingData.cookingTime}
                  </div>
                  {profile.preferences.onboardingData.dietaryRestrictions?.length > 0 && (
                    <div>
                      Restricciones: {profile.preferences.onboardingData.dietaryRestrictions.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="warning" size="lg">
                {nutritionMetrics.avgDailyCalories} cal/día
              </Badge>
              {isAIGenerated && (
                <Badge variant="outline" size="sm">
                  Macros calculados por IA
                </Badge>
              )}
              
              {/* 🔥 NUEVO: Botón para regenerar plan nutricional */}
              {isAIGenerated && profile?.preferences?.onboardingData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegeneratePlan}
                  disabled={isRegenerating}
                  leftIcon={isRegenerating ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                  className="mt-2"
                >
                  {isRegenerating ? 'Regenerando...' : 'Regenerar Plan'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Nutrition Goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Target className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {nutritionMetrics.avgDailyProtein}g
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Proteína Diaria
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Flame className="text-orange-500" size={24} />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {nutritionMetrics.avgDailyCalories}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Calorías
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Droplets className="text-blue-500" size={24} />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              Post-entreno
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Batido Obligatorio
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Meal Plan */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Plan Semanal de Comidas
        </h2>
        
        <div className="grid gap-6">
          {(() => {
            if (weeklyPlan && weeklyPlan.days && Array.isArray(weeklyPlan.days)) {
              return weeklyPlan.days.map((dayPlan, index) => {
                // 🔥 TRANSFORMACIÓN: Si algún día viene en formato de IA, transformarlo
                let processedDayPlan = dayPlan
                if (isAIFormat(dayPlan)) {
                  try {
                    processedDayPlan = transformAIDayToDayMealPlan(dayPlan as any)
                  } catch (error) {
                    console.error('❌ Error transformando día:', error)
                    processedDayPlan = dayPlan
                  }
                }
                
                return (
                  <MealPlanCard
                    key={processedDayPlan.id || dayPlan.id || `day-${index}`}
                    dayPlan={processedDayPlan}
                  />
                )
              })
            } else {
              console.warn('❌ No se puede renderizar meal plan:', {
                weeklyPlan: !!weeklyPlan,
                days: !!weeklyPlan?.days,
                isArray: Array.isArray(weeklyPlan?.days)
              })
              return (
                <div className="text-center text-gray-500 py-8">
                  <p>No hay plan de comidas disponible.</p>
                  <p className="text-sm mt-2">Por favor, configura tu plan nutricional.</p>
                  {weeklyPlan && (
                    <details className="mt-4 text-xs text-left">
                      <summary className="cursor-pointer">Ver estructura de datos (debug)</summary>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(weeklyPlan, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )
            }
          })()}
        </div>
      </div>

      {/* Protein Shake Guide */}
      <ProteinShakeGuide />

      {/* Shopping List */}
      {dynamicShoppingList && dynamicShoppingList.length > 0 ? (
        <ShoppingList shoppingList={dynamicShoppingList} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛒 Lista de Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">
              Lista de compras no disponible para este plan.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Tip: Revisa los ingredientes de las comidas para crear tu lista de compras.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Prep Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💡 Trucos para Pereza Nocturna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                📅 Prep Domingo (1 hora)
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full" />
                  Pollo a la plancha → guarda tuppers
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full" />
                  Verduras lavadas y cortadas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full" />
                  Huevos duros (x6)
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                🛒 Compras Smart
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-400 rounded-full" />
                  Ensalada bolsa (no lavar lechuga)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-400 rounded-full" />
                  Zanahoria rallada (bolsa)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-400 rounded-full" />
                  Tomate cherry (no cortar)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}