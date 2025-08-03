import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/shared/components/ui'
import { Activity } from 'lucide-react'
import { calculateBMI, getBMICategory, getWeightGoalStatus } from '../data/progressData'

interface BMICardProps {
  currentWeight: number
  height: number
  targetWeight?: number
  initialWeight?: number
}

export const BMICard = ({ currentWeight, height, targetWeight, initialWeight }: BMICardProps) => {
  const bmi = calculateBMI(currentWeight, height)
  const bmiInfo = getBMICategory(bmi)
  
  // Solo mostrar status de objetivos si se proporcionan ambos pesos
  const goalStatus = (targetWeight && initialWeight) 
    ? getWeightGoalStatus(currentWeight, targetWeight, initialWeight)
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="text-green-600" />
          Índice de Masa Corporal (IMC)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current BMI */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2" style={{ color: bmiInfo.color.split(' ')[0] }}>
              {bmi}
            </div>
            <Badge 
              variant={
                bmi < 18.5 ? 'secondary' :
                bmi < 25 ? 'success' :
                bmi < 30 ? 'warning' : 'danger'
              }
              size="lg"
            >
              {bmiInfo.category}
            </Badge>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {bmiInfo.description}
            </p>
          </div>

          {/* BMI Scale */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Escala IMC
            </div>
            
            <div className="relative">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div className="flex-1 bg-blue-300" />
                <div className="flex-1 bg-green-400" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-red-400" />
              </div>
              
              {/* BMI indicator */}
              <div 
                className="absolute top-0 w-1 h-4 bg-gray-800 dark:bg-white"
                style={{ 
                  left: `${Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100))}%`,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>15</span>
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>35</span>
            </div>
            
            <div className="grid grid-cols-4 gap-1 text-xs text-center">
              <span className="text-blue-600">Bajo</span>
              <span className="text-green-600">Normal</span>
              <span className="text-yellow-600">Sobrepeso</span>
              <span className="text-red-600">Obesidad</span>
            </div>
          </div>

          {/* Weight goal progress - solo si se proporcionan objetivos */}
          {goalStatus && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Progreso hacia objetivo
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {goalStatus.percentage.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-primary-500 to-success-500"
                  style={{ width: `${goalStatus.percentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {goalStatus.lostSoFar.toFixed(1)}kg
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Perdidos</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {goalStatus.remaining.toFixed(1)}kg
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Restantes</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {targetWeight}kg
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Objetivo</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  )
}