import { useAppContext } from '@/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui'
import { BarChart3, Flame } from 'lucide-react'
import { WeightProgressChart } from './WeightProgressChart'

export const ProgressStats = () => {
  const { state } = useAppContext()
  const { stats } = state.progress

  if (!stats) {
    return (
      <Card>
        <CardHeader className="p-2 xs:p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm xs:text-base sm:text-lg">
            <BarChart3 className="text-indigo-600" size={16} />
            <span className="break-words">Estadísticas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 xs:p-3 sm:p-4 md:p-6">
          <div className="text-center py-6 xs:py-8 text-gray-500 dark:text-gray-400">
            <BarChart3 size={32} className="mx-auto mb-4 opacity-50" />
            <p className="text-xs xs:text-sm break-words">Registra datos para ver estadísticas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="p-2 xs:p-3 sm:p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-sm xs:text-base sm:text-lg">
          <BarChart3 className="text-indigo-600" size={16} />
          <span className="break-words">Estadísticas</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 xs:p-3 sm:p-4 md:p-6">
        <div className="space-y-4 xs:space-y-6">
          {/* Weight progress chart */}
          <WeightProgressChart />

          {/* Tracking streaks */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 xs:mb-4 text-sm xs:text-base">
              🔥 Rachas
            </h4>
            
            <div className="space-y-2 xs:space-y-3">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-2 xs:p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                  <Flame className="text-orange-600 dark:text-orange-400 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <div className="font-semibold text-orange-800 dark:text-orange-200 text-sm xs:text-base">
                      Racha actual
                    </div>
                    <div className="text-xs xs:text-sm text-orange-600 dark:text-orange-400 break-words">
                      Días consecutivos
                    </div>
                  </div>
                </div>
                <div className="text-lg xs:text-xl font-bold text-orange-600 dark:text-orange-400 flex-shrink-0">
                  {stats.currentWeightTrackingStreak}
                </div>
              </div>

              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-2 xs:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                  <Flame className="text-purple-600 dark:text-purple-400 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <div className="font-semibold text-purple-800 dark:text-purple-200 text-sm xs:text-base">
                      Mejor racha
                    </div>
                    <div className="text-xs xs:text-sm text-purple-600 dark:text-purple-400 break-words">
                      Récord personal
                    </div>
                  </div>
                </div>
                <div className="text-lg xs:text-xl font-bold text-purple-600 dark:text-purple-400 flex-shrink-0">
                  {stats.longestWeightTrackingStreak}
                </div>
              </div>
            </div>
          </div>

          {/* Progress insights */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 xs:mb-4 text-sm xs:text-base">
              💡 Insights
            </h4>
            
            <div className="space-y-2 xs:space-y-3">
              {stats.weightChange < 0 && (
                <div className="p-2 xs:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-green-800 dark:text-green-200 font-medium mb-1 text-sm xs:text-base">
                    ¡Excelente progreso! 🎉
                  </div>
                  <div className="text-xs xs:text-sm text-green-600 dark:text-green-400 break-words">
                    Has perdido {Math.abs(stats.weightChange)}kg. Mantén este ritmo.
                  </div>
                </div>
              )}

              {stats.currentWeightTrackingStreak >= 7 && (
                <div className="p-2 xs:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-blue-800 dark:text-blue-200 font-medium mb-1 text-sm xs:text-base">
                    Consistencia perfecta 👏
                  </div>
                  <div className="text-xs xs:text-sm text-blue-600 dark:text-blue-400 break-words">
                    Llevas {stats.currentWeightTrackingStreak} días registrando. La consistencia es clave.
                  </div>
                </div>
              )}

              {stats.totalDaysTracked >= 30 && (
                <div className="p-2 xs:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-purple-800 dark:text-purple-200 font-medium mb-1 text-sm xs:text-base">
                    Hábito establecido 🏆
                  </div>
                  <div className="text-xs xs:text-sm text-purple-600 dark:text-purple-400 break-words">
                    {stats.totalDaysTracked} días registrados. ¡Es parte de tu rutina!
                  </div>
                </div>
              )}

              {/* Motivational message for beginners */}
              {stats.totalDaysTracked < 7 && (
                <div className="p-2 xs:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-yellow-800 dark:text-yellow-200 font-medium mb-1 text-sm xs:text-base">
                    ¡Acabas de empezar! 🌱
                  </div>
                  <div className="text-xs xs:text-sm text-yellow-600 dark:text-yellow-400 break-words">
                    Registra diariamente una semana para ver tendencias.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overall summary */}
          <div className="pt-3 xs:pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.totalDaysTracked}
              </div>
              <div className="text-xs xs:text-sm text-gray-500 dark:text-gray-400">
                días haciendo seguimiento
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}