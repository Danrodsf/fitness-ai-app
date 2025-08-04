import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/shared/components/ui'
import { Target, AlertTriangle, CheckCircle, TrendingUp, Scale } from 'lucide-react'
import { calculateSmartWeightGoal, UserData, calculateHealthyWeightRange } from '../utils/smartWeightGoals'
import { calculateBMI } from '../data/progressData'

export const SmartWeightGoals = () => {
  const { state } = useAppContext()
  const { profile } = useAuth()
  const { weightHistory } = state.progress

  if (!profile || weightHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="text-blue-600" />
            Objetivos Inteligentes de Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Scale size={48} className="mx-auto mb-4 opacity-50" />
            <p>Registra tu peso para recibir recomendaciones personalizadas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentWeight = weightHistory[0]?.weight || profile.weight
  const currentBMI = calculateBMI(currentWeight, profile.height)
  const healthyRange = calculateHealthyWeightRange(profile.height)

  // Determinar objetivo principal basado en el perfil
  const primaryGoal = profile.goals?.includes('gain_muscle') ? 'gain_muscle' :
                     profile.goals?.includes('lose_weight') ? 'lose_weight' : 'maintain_weight'

  const userData: UserData = {
    currentWeight,
    height: profile.height,
    age: profile.age,
    gender: 'male', // Por defecto, se podría obtener del perfil
    experienceLevel: 'beginner', // Se podría obtener del perfil
    primaryGoal: primaryGoal as any,
    activityLevel: 'moderate'
  }

  const smartGoal = calculateSmartWeightGoal(userData)

  // Determinar color del badge según IMC
  const getBMIBadgeVariant = () => {
    if (currentBMI < 18.5) return 'secondary'
    if (currentBMI < 25) return 'success'
    if (currentBMI < 30) return 'warning'
    return 'danger'
  }

  const getBMIStatus = () => {
    if (currentBMI < 18.5) return 'Bajo peso'
    if (currentBMI < 25) return 'Peso normal'
    if (currentBMI < 30) return 'Sobrepeso'
    return 'Obesidad'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="text-blue-600" />
          Objetivos Inteligentes de Peso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          
          {/* Estado actual */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Estado Actual</h4>
              <Badge variant={getBMIBadgeVariant()}>
                IMC {currentBMI.toFixed(1)} - {getBMIStatus()}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Peso:</span>
                <span className="ml-2 font-semibold">{currentWeight}kg</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Altura:</span>
                <span className="ml-2 font-semibold">{profile.height}cm</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Peso saludable:</span>
                <span className="ml-2 font-semibold">{healthyRange.min.toFixed(0)}-{healthyRange.max.toFixed(0)}kg</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Peso atlético:</span>
                <span className="ml-2 font-semibold">≤{healthyRange.athletic.toFixed(0)}kg</span>
              </div>
            </div>
          </div>

          {/* Recomendación inteligente */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-green-600" size={20} />
              <h4 className="font-semibold text-gray-900 dark:text-white">Recomendación Personalizada</h4>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <div className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    {smartGoal.strategy}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                    {smartGoal.rationale}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 text-sm">
                    <strong>Objetivo:</strong> {smartGoal.targetWeight.toFixed(1)}kg en {smartGoal.timeframe} meses
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan mensual */}
          {smartGoal.monthlyTargets.length > 1 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Plan Progresivo</h4>
              <div className="space-y-2">
                {smartGoal.monthlyTargets.slice(0, 4).map((target, index) => (
                  <div key={target.month} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                        {target.month}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {target.weight.toFixed(1)}kg
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {target.focus}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {target.month === 1 ? '' : `+${(target.weight - smartGoal.monthlyTargets[0].weight).toFixed(1)}kg`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advertencias importantes */}
          {smartGoal.warnings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-yellow-600" size={20} />
                <h4 className="font-semibold text-gray-900 dark:text-white">Consideraciones Importantes</h4>
              </div>
              
              <div className="space-y-2">
                {smartGoal.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-yellow-800 dark:text-yellow-200 text-sm">
                      {warning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ejemplo específico para 181cm */}
          {profile.height >= 180 && profile.height <= 182 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
                <div className="text-sm">
                  <div className="font-semibold text-green-800 dark:text-green-200 mb-1">
                    💡 Para tu altura ({profile.height}cm):
                  </div>
                  <div className="text-green-700 dark:text-green-300">
                    • <strong>Peso saludable:</strong> 60-81kg (IMC 18.5-24.9)<br/>
                    • <strong>Peso atlético óptimo:</strong> 72-79kg (IMC 22-24)<br/>
                    • <strong>Límite recomendado:</strong> 79kg (IMC 24) para mantener definición muscular<br/>
                    • <strong>Ganancia muscular realista:</strong> 0.5-1kg/mes dependiendo de tu experiencia
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  )
}