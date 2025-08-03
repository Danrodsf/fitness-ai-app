import { useAppContext } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui'
import { BarChart3, TrendingDown, Calendar, Flame } from 'lucide-react'

export const ProgressStats = () => {
  const { state } = useAppContext()
  const { stats } = state.progress

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="text-indigo-600" />
            Estadísticas de Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Registra algunos datos para ver tus estadísticas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="text-indigo-600" />
          Estadísticas de Progreso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Weight stats */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              📊 Seguimiento de Peso
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {stats.weightChange >= 0 ? '+' : ''}{stats.weightChange}kg
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Cambio total
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.averageWeeklyWeightChange >= 0 ? '+' : ''}{stats.averageWeeklyWeightChange}kg
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Por semana
                </div>
              </div>
            </div>
          </div>

          {/* Tracking streaks */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              🔥 Rachas de Seguimiento
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <Flame className="text-orange-600 dark:text-orange-400" size={20} />
                  <div>
                    <div className="font-semibold text-orange-800 dark:text-orange-200">
                      Racha actual
                    </div>
                    <div className="text-sm text-orange-600 dark:text-orange-400">
                      Días consecutivos registrando peso
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.currentWeightTrackingStreak}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3">
                  <Flame className="text-purple-600 dark:text-purple-400" size={20} />
                  <div>
                    <div className="font-semibold text-purple-800 dark:text-purple-200">
                      Mejor racha
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      Récord personal de consistencia
                    </div>
                  </div>
                </div>
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.longestWeightTrackingStreak}
                </div>
              </div>
            </div>
          </div>

          {/* Progress insights */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              💡 Insights
            </h4>
            
            <div className="space-y-3">
              {stats.weightChange < 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-green-800 dark:text-green-200 font-medium mb-1">
                    ¡Excelente progreso! 🎉
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Has perdido {Math.abs(stats.weightChange)}kg. Mantén este ritmo para alcanzar tu objetivo.
                  </div>
                </div>
              )}

              {stats.currentWeightTrackingStreak >= 7 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                    Consistencia perfecta 👏
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Llevas {stats.currentWeightTrackingStreak} días registrando tu peso. La consistencia es clave para el éxito.
                  </div>
                </div>
              )}

              {stats.totalDaysTracked >= 30 && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-purple-800 dark:text-purple-200 font-medium mb-1">
                    Hábito establecido 🏆
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    Has registrado datos durante {stats.totalDaysTracked} días. ¡El seguimiento ya es parte de tu rutina!
                  </div>
                </div>
              )}

              {/* Motivational message for beginners */}
              {stats.totalDaysTracked < 7 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-yellow-800 dark:text-yellow-200 font-medium mb-1">
                    ¡Acabas de empezar! 🌱
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">
                    Registra tu peso diariamente durante una semana para ver patrones y tendencias.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overall summary */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.totalDaysTracked}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                días haciendo seguimiento
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}