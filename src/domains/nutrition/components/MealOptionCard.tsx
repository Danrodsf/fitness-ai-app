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
      <CardContent className="p-2 xs:p-3 sm:p-4">
        <div className="space-y-2 xs:space-y-3">
          {/* Header */}
          <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 xs:gap-0">
            <div className="flex-1 min-w-0">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm xs:text-base break-words">
                {option.title}
              </h5>
              {option.description && (
                <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-300 mb-2 break-words">
                  {option.description}
                </p>
              )}
              
              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs xs:text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{option.prepTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Utensils size={12} />
                  <span>{option.calories} cal</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{option.protein}g</span>
                  <span>prot</span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              rightIcon={showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              className="text-xs xs:text-sm px-2 xs:px-3 flex-shrink-0 w-full xs:w-auto"
            >
              {showDetails ? 'Ocultar' : 'Ver'}
            </Button>
          </div>

          {/* Food list */}
          <div className="space-y-1 xs:space-y-2">
            {safeFoods.slice(0, showDetails ? undefined : 3).map((food, index) => (
              <div key={index} className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0 text-xs xs:text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 break-words">
                    {food.name || 'Ingrediente sin nombre'}
                  </span>
                </div>
                <div className="flex items-center gap-2 xs:gap-3 text-gray-500 dark:text-gray-400 text-xs ml-4 xs:ml-0">
                  <span>{food.quantity || '—'} {food.unit || ''}</span>
                  {showDetails && (
                    <>
                      <span className="hidden xs:inline">|</span>
                      <span>{food.calories || 0} cal</span>
                      <span className="hidden xs:inline">|</span>
                      <span>{food.protein || 0}g</span>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {!showDetails && safeFoods.length > 3 && (
              <div className="text-xs xs:text-sm text-gray-500 dark:text-gray-400 text-center py-1">
                ... y {safeFoods.length - 3} más
              </div>
            )}
          </div>

          {/* Recipe */}
          {showDetails && option.recipe && (
            <div className="pt-2 xs:pt-3 border-t border-gray-200 dark:border-gray-700">
              <h6 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm xs:text-base">
                <Utensils size={12} />
                Receta
              </h6>
              <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                {option.recipe}
              </p>
            </div>
          )}

          {/* Nutritional summary */}
          {showDetails && (
            <div className="pt-2 xs:pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 text-center text-xs xs:text-sm">
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