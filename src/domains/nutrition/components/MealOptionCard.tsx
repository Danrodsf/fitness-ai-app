import { useState } from 'react'
import { MealOption } from '../types'
import { Card, CardContent, Button } from '@/shared/components/ui'
import { Clock, ChevronDown, ChevronUp, Utensils } from 'lucide-react'
import { clsx } from 'clsx'

interface MealOptionCardProps {
  option: MealOption
  type: 'breakfast' | 'lunch' | 'dinner'
}

export const MealOptionCard = ({ option, type }: MealOptionCardProps) => {
  const [showDetails, setShowDetails] = useState(false)


  const typeColors = {
    breakfast: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    lunch: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    dinner: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  }

  // 🔥 VALIDACIÓN: Verificar que option tiene los datos necesarios
  if (!option || !option.title) {
    console.error(`❌ MealOptionCard ${type}: option inválida:`, option)
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">❌ Error: Datos de comida incompletos</p>
        </CardContent>
      </Card>
    )
  }

  // Asegurar que foods es un array válido
  const safeFoods = Array.isArray(option.foods) ? option.foods : []

  return (
    <Card variant="bordered" className={clsx('transition-all duration-200', typeColors[type])}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                {option.title}
              </h5>
              {option.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {option.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {option.prepTime} min
                </div>
                <div className="flex items-center gap-1">
                  <Utensils size={14} />
                  {option.calories} cal
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{option.protein}g</span>
                  <span>proteína</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              rightIcon={showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            >
              {showDetails ? 'Ocultar' : 'Detalles'}
            </Button>
          </div>

          {/* Food list */}
          <div className="space-y-2">
            {safeFoods.slice(0, showDetails ? undefined : 3).map((food, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {food.name || 'Ingrediente sin nombre'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                  <span>{food.quantity || '—'} {food.unit || ''}</span>
                  {showDetails && (
                    <>
                      <span>|</span>
                      <span>{food.calories || 0} cal</span>
                      <span>|</span>
                      <span>{food.protein || 0}g prot</span>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {!showDetails && safeFoods.length > 3 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-1">
                ... y {safeFoods.length - 3} ingredientes más
              </div>
            )}
          </div>

          {/* Recipe */}
          {showDetails && option.recipe && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h6 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Utensils size={14} />
                Receta
              </h6>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {option.recipe}
              </p>
            </div>
          )}

          {/* Nutritional summary */}
          {showDetails && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {option.calories}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Cal</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {option.protein}g
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Prot</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {safeFoods.reduce((total, food) => total + (food.carbs || 0), 0).toFixed(1)}g
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Carb</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {safeFoods.reduce((total, food) => total + (food.fats || 0), 0).toFixed(1)}g
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Gras</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}