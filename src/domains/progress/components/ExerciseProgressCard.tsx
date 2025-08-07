import { Badge } from '@/shared/components/ui'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ExerciseProgressCardProps {
  exercise: {
    exerciseId: string
    name: string
    weeklyData: Array<{
      date: string
      maxWeight: number
      totalReps: number
      trend: string
    }>
  }
}

export const ExerciseProgressCard = ({ exercise }: ExerciseProgressCardProps) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          {exercise.name}
        </h4>
        <div className="flex items-center gap-2">
          <Badge variant="outline" size="sm">
            {exercise.weeklyData.length} sesiones
          </Badge>
          {exercise.weeklyData.length > 1 && (
            <Badge 
              variant={
                (exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0) >= (exercise.weeklyData[0]?.maxWeight || 0) 
                  ? "success" 
                  : "danger"
              } 
              size="sm"
            >
              {(exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0) >= (exercise.weeklyData[0]?.maxWeight || 0) ? (
                <TrendingUp size={12} className="mr-1" />
              ) : (
                <TrendingDown size={12} className="mr-1" />
              )}
              {Math.round(((exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0) - (exercise.weeklyData[0]?.maxWeight || 0)) * 100) / 100}kg
            </Badge>
          )}
        </div>
      </div>
      
      {/* Gráfico de líneas con SVG */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Progresión de peso máximo</span>
          <span>{exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0}kg</span>
        </div>
        
        {exercise.weeklyData.length > 1 ? (
          <div className="relative">
            <svg 
              viewBox="0 0 400 100" 
              className="w-full h-20 bg-gray-50 dark:bg-gray-800 rounded-lg"
              preserveAspectRatio="xMidYMid meet"
            >
              {(() => {
                const data = exercise.weeklyData
                const maxWeight = Math.max(...data.map(d => d.maxWeight))
                const minWeight = Math.min(...data.map(d => d.maxWeight))
                const weightRange = maxWeight - minWeight
                const padding = 20
                const width = 400 - (padding * 2)
                const height = 100 - (padding * 2)
                
                // Calcular puntos de la línea
                const points = data.map((point, index) => {
                  const x = padding + (index / (data.length - 1)) * width
                  const y = weightRange > 0 
                    ? padding + height - ((point.maxWeight - minWeight) / weightRange) * height
                    : padding + height / 2
                  return { x, y, weight: point.maxWeight, trend: point.trend }
                })
                
                // Crear path de línea
                const pathData = points.map((point, index) => 
                  `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                ).join(' ')
                
                return (
                  <>
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
                      </pattern>
                    </defs>
                    <rect width="400" height="100" fill="url(#grid)" className="text-gray-400"/>
                    
                    {/* Línea principal */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-primary-500"
                    />
                    
                    {/* Puntos de datos */}
                    {points.map((point, index) => (
                      <g key={index}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="currentColor"
                          className={`
                            ${point.trend === 'up' ? 'text-green-500' : 
                              point.trend === 'down' ? 'text-red-500' : 
                              'text-primary-500'}
                          `}
                          stroke="white"
                          strokeWidth="2"
                        />
                        <title>{`Sesión ${index + 1}: ${point.weight}kg`}</title>
                      </g>
                    ))}
                  </>
                )
              })()}
            </svg>
          </div>
        ) : (
          <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
            <span className="text-sm">Necesitas más sesiones para ver la progresión</span>
          </div>
        )}
        
        {/* Fechas de cada sesión */}
        <div className="relative text-xs text-gray-500 dark:text-gray-400 mt-2 h-6">
          {exercise.weeklyData.map((session, index) => {
            const data = exercise.weeklyData
            const padding = 20
            const width = 400 - (padding * 2)
            
            // Calcular posición (manejar caso de una sola sesión)
            const leftPosition = data.length > 1 
              ? padding + (index / (data.length - 1)) * width
              : padding + width / 2  // Centrar si solo hay una sesión
            const leftPercentage = (leftPosition / 400) * 100
            
            // Mostrar fechas inteligentemente para evitar solapamiento
            const shouldShowDate = data.length <= 4 || // Si hay pocas sesiones, mostrar todas
              index === 0 || // Siempre mostrar primera
              index === data.length - 1 || // Siempre mostrar última
              index % Math.ceil(data.length / 4) === 0 // Mostrar cada N sesiones
            
            if (!shouldShowDate) return null
            
            return (
              <div 
                key={index}
                className="absolute text-center transform -translate-x-1/2"
                style={{ left: `${leftPercentage}%` }}
              >
                <div className="text-xs whitespace-nowrap bg-white dark:bg-gray-900 px-1 rounded shadow-sm">
                  {session.date}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Estadísticas del ejercicio */}
      <div className="grid grid-cols-2 gap-4 mt-4 text-center">
        <div>
          <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {exercise.weeklyData[0]?.maxWeight || 0}kg
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Peso Inicial</div>
        </div>
        <div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {exercise.weeklyData[exercise.weeklyData.length - 1]?.maxWeight || 0}kg
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Peso Actual</div>
        </div>
      </div>
    </div>
  )
}