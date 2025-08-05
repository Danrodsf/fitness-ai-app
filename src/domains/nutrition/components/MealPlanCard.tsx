import { useState } from 'react'
import { DayMealPlan } from '../types'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/shared/components/ui'
import { Sun, Clock, Moon, ChevronDown, ChevronUp } from 'lucide-react'
import { MealOptionCard } from './MealOptionCard'
import { transformAIDayToDayMealPlan, transformNewAIFormatToDayMealPlan, isAIFormat, isNewAIFormat, isStandardFormat } from '@/shared/utils/nutritionTransformers'

interface MealPlanCardProps {
  dayPlan: DayMealPlan
}

const dayNames: Record<string, string> = {
  monday: 'LUNES',
  tuesday: 'MARTES', 
  wednesday: 'MIÉRCOLES',
  thursday: 'JUEVES',
  friday: 'VIERNES',
  saturday: 'SÁBADO',
  sunday: 'DOMINGO'
}

export const MealPlanCard = ({ dayPlan }: MealPlanCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true) // 🔥 CAMBIO: Expandir por defecto para mejor UX

  // 🔥 TRANSFORMACIÓN: Detectar y transformar datos de IA
  let processedDayPlan = dayPlan

  // Detectar tipo de formato y transformar
  if (dayPlan && isNewAIFormat(dayPlan)) {
    try {
      processedDayPlan = transformNewAIFormatToDayMealPlan(dayPlan as any)
    } catch (error) {
      console.error('❌ Error transformando NUEVO formato de IA:', error)
      processedDayPlan = dayPlan
    }
  } else if (dayPlan && isAIFormat(dayPlan)) {
    try {
      processedDayPlan = transformAIDayToDayMealPlan(dayPlan as any)
    } catch (error) {
      console.error('❌ Error transformando datos de IA original:', error)
      processedDayPlan = dayPlan
    }
  } else if (dayPlan && isStandardFormat(dayPlan)) {
    processedDayPlan = dayPlan
  } else if (dayPlan) {
  }

  // 🔥 VALIDACIÓN DEFENSIVA: Asegurar que las propiedades existen y son arrays
  const safeBreakfast = Array.isArray(processedDayPlan?.breakfast) ? processedDayPlan.breakfast : []
  const safeLunch = Array.isArray(processedDayPlan?.lunch) ? processedDayPlan.lunch : []
  const safeDinner = Array.isArray(processedDayPlan?.dinner) ? processedDayPlan.dinner : []
  const totalMeals = safeBreakfast.length + safeLunch.length + safeDinner.length

  // Solo log si no hay comidas
  if (totalMeals === 0) {
  }

  // Si no hay processedDayPlan válido, mostrar mensaje de error
  if (!processedDayPlan || !processedDayPlan.day) {
    console.error('❌ MealPlanCard: processedDayPlan inválido:', processedDayPlan)
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">❌ Error cargando plan del día</p>
          <p className="text-sm text-red-500 mt-2">
            Datos del plan incompletos. Intenta regenerar el plan.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300">
      <CardHeader className="p-2 xs:p-3 sm:p-4 md:p-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm xs:text-base sm:text-lg break-words">
              {dayNames[processedDayPlan.day] || processedDayPlan.day?.toUpperCase() || 'DÍA DESCONOCIDO'}
            </CardTitle>
            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 mt-2 text-xs xs:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <span className="font-medium">{processedDayPlan.totalCalories || '—'}</span>
                <span>cal</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{processedDayPlan.totalProtein || '—'}g</span>
                <span>prot</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 xs:gap-2 flex-shrink-0">
            <Badge variant="primary" size="sm" className="text-xs">
              {totalMeals}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              rightIcon={isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              className="text-xs xs:text-sm px-2 xs:px-3"
            >
              {isExpanded ? 'Ocultar' : 'Ver'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="animate-slide-down p-2 xs:p-3 sm:p-4 md:p-6">
          <div className="space-y-4 xs:space-y-6">
            {/* Breakfast */}
            <div>
              <h4 className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 font-semibold text-gray-900 dark:text-white mb-3 xs:mb-4 text-sm xs:text-base">
                <div className="flex items-center gap-2">
                  <Sun className="text-yellow-500" size={16} />
                  <span>DESAYUNO</span>
                </div>
                <span className="text-xs text-gray-500">(7:00-8:00)</span>
              </h4>
              <div className="space-y-2 xs:space-y-3">
                {safeBreakfast.length > 0 ? (
                  safeBreakfast.map((option, index) => (
                    <MealOptionCard 
                      key={index} 
                      option={option} 
                      type="breakfast"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-xs xs:text-sm">No hay opciones de desayuno</p>
                )}
              </div>
            </div>

            {/* Lunch */}
            <div>
              <h4 className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 font-semibold text-gray-900 dark:text-white mb-3 xs:mb-4 text-sm xs:text-base">
                <div className="flex items-center gap-2">
                  <Clock className="text-orange-500" size={16} />
                  <span>ALMUERZO</span>
                </div>
                <span className="text-xs text-gray-500">(13:00-14:00)</span>
              </h4>
              <div className="space-y-2 xs:space-y-3">
                {safeLunch.length > 0 ? (
                  safeLunch.map((option, index) => (
                    <MealOptionCard 
                      key={index} 
                      option={option} 
                      type="lunch"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-xs xs:text-sm">No hay opciones de almuerzo</p>
                )}
              </div>
            </div>

            {/* Dinner */}
            <div>
              <h4 className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 font-semibold text-gray-900 dark:text-white mb-3 xs:mb-4 text-sm xs:text-base">
                <div className="flex items-center gap-2">
                  <Moon className="text-purple-500" size={16} />
                  <span>CENA</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">(20:00-21:00)</span>
                  <Badge variant="outline" size="sm" className="text-xs">10 min</Badge>
                </div>
              </h4>
              <div className="space-y-2 xs:space-y-3">
                {safeDinner.length > 0 ? (
                  safeDinner.map((option, index) => (
                    <MealOptionCard 
                      key={index} 
                      option={option} 
                      type="dinner"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-xs xs:text-sm">No hay opciones de cena</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}