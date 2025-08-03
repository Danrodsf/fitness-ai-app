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
      console.log('🔄 Transformando NUEVO formato de IA:', dayPlan)
      processedDayPlan = transformNewAIFormatToDayMealPlan(dayPlan as any)
      console.log('✅ Transformación exitosa:', processedDayPlan)
    } catch (error) {
      console.error('❌ Error transformando NUEVO formato de IA:', error)
      processedDayPlan = dayPlan
    }
  } else if (dayPlan && isAIFormat(dayPlan)) {
    try {
      console.log('🔄 Transformando formato de IA ORIGINAL:', dayPlan)
      processedDayPlan = transformAIDayToDayMealPlan(dayPlan as any)
    } catch (error) {
      console.error('❌ Error transformando datos de IA original:', error)
      processedDayPlan = dayPlan
    }
  } else if (dayPlan && isStandardFormat(dayPlan)) {
    console.log('✅ Formato estándar detectado:', dayPlan)
    processedDayPlan = dayPlan
  } else if (dayPlan) {
    console.warn('⚠️ Formato de datos no reconocido:', dayPlan)
  }

  // 🔥 VALIDACIÓN DEFENSIVA: Asegurar que las propiedades existen y son arrays
  const safeBreakfast = Array.isArray(processedDayPlan?.breakfast) ? processedDayPlan.breakfast : []
  const safeLunch = Array.isArray(processedDayPlan?.lunch) ? processedDayPlan.lunch : []
  const safeDinner = Array.isArray(processedDayPlan?.dinner) ? processedDayPlan.dinner : []
  const totalMeals = safeBreakfast.length + safeLunch.length + safeDinner.length

  // Solo log si no hay comidas
  if (totalMeals === 0) {
    console.warn(`⚠️ No hay comidas para ${processedDayPlan?.day}`)
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {dayNames[processedDayPlan.day] || processedDayPlan.day?.toUpperCase() || 'DÍA DESCONOCIDO'}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <span className="font-medium">{processedDayPlan.totalCalories || '—'}</span>
                <span>calorías</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{processedDayPlan.totalProtein || '—'}g</span>
                <span>proteína</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              {totalMeals} opciones
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              rightIcon={isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            >
              {isExpanded ? 'Contraer' : 'Ver comidas'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="animate-slide-down">
          <div className="space-y-6">
            {/* Breakfast */}
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                <Sun className="text-yellow-500" size={18} />
                DESAYUNO (7:00-8:00 AM)
              </h4>
              <div className="space-y-3">
                {safeBreakfast.length > 0 ? (
                  safeBreakfast.map((option, index) => (
                    <MealOptionCard 
                      key={index} 
                      option={option} 
                      type="breakfast"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay opciones de desayuno disponibles</p>
                )}
              </div>
            </div>

            {/* Lunch */}
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                <Clock className="text-orange-500" size={18} />
                ALMUERZO (13:00-14:00) - MÁS ELABORADO
              </h4>
              <div className="space-y-3">
                {safeLunch.length > 0 ? (
                  safeLunch.map((option, index) => (
                    <MealOptionCard 
                      key={index} 
                      option={option} 
                      type="lunch"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay opciones de almuerzo disponibles</p>
                )}
              </div>
            </div>

            {/* Dinner */}
            <div>
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-4">
                <Moon className="text-purple-500" size={18} />
                CENA (20:00-21:00) - SÚPER SENCILLO
                <Badge variant="outline" size="sm">Máx 10 min</Badge>
              </h4>
              <div className="space-y-3">
                {safeDinner.length > 0 ? (
                  safeDinner.map((option, index) => (
                    <MealOptionCard 
                      key={index} 
                      option={option} 
                      type="dinner"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No hay opciones de cena disponibles</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}