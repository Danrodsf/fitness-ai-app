import { useAppContext } from '@/store'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const WeightProgressChart = () => {
  const { state } = useAppContext()
  const { weightHistory } = state.progress

  // Ordenar por fecha y tomar últimos 30 días máximo
  const sortedData = [...weightHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30)

  if (sortedData.length < 2) {
    return (
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
          📊 Seguimiento de Peso
        </h4>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
          <p>Registra al menos 2 pesos para ver tu gráfico de progreso</p>
        </div>
      </div>
    )
  }

  // Calcular dimensiones del gráfico
  const weights = sortedData.map(entry => entry.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const weightRange = maxWeight - minWeight || 1 // Evitar división por 0
  const padding = weightRange * 0.1 // 10% padding arriba y abajo

  // Calcular tendencia general
  const firstWeight = weights[0]
  const lastWeight = weights[weights.length - 1]
  const totalChange = lastWeight - firstWeight
  const trend = totalChange > 0.5 ? 'up' : totalChange < -0.5 ? 'down' : 'stable'

  // Generar puntos del gráfico SVG
  const chartWidth = 400
  const chartHeight = 120
  const points = sortedData.map((entry, index) => {
    const x = (index / (sortedData.length - 1)) * chartWidth
    const y = chartHeight - ((entry.weight - minWeight + padding) / (weightRange + 2 * padding)) * chartHeight
    return { x, y, weight: entry.weight, date: entry.date }
  })

  // Crear path para la línea
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  // Crear área bajo la curva para efecto visual
  const areaData = `M 0 ${chartHeight} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${chartWidth} ${chartHeight} Z`

  // Determinar colores según tendencia
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-red-500'
      case 'down': return 'text-green-500'
      default: return 'text-blue-500'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp size={20} className="text-red-500" />
      case 'down': return <TrendingDown size={20} className="text-green-500" />
      default: return <Minus size={20} className="text-blue-500" />
    }
  }

  const getTrendMessage = () => {
    switch (trend) {
      case 'up': return `+${totalChange.toFixed(1)}kg desde el primer registro`
      case 'down': return `${totalChange.toFixed(1)}kg desde el primer registro`
      default: return 'Peso estable'
    }
  }

  return (
    <div>
      <h4 className="font-medium text-gray-900 dark:text-white mb-4">
        📊 Seguimiento de Peso
      </h4>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {/* Header with trend indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getTrendIcon()}
            <div>
              <div className={`font-semibold ${getTrendColor()}`}>
                {getTrendMessage()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Últimos {sortedData.length} registros
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {lastWeight}kg
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Actual
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-24 overflow-visible">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-200 dark:text-gray-600" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />
            
            {/* Area under curve */}
            <path 
              d={areaData} 
              fill="currentColor" 
              className={`${getTrendColor()} opacity-10`}
            />
            
            {/* Main line */}
            <path 
              d={pathData} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
              strokeLinejoin="round"
              className={getTrendColor()}
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle 
                  cx={point.x} 
                  cy={point.y} 
                  r="4" 
                  fill="currentColor"
                  className={`${getTrendColor()} drop-shadow-sm`}
                />
                
                {/* Tooltip on hover */}
                <circle 
                  cx={point.x} 
                  cy={point.y} 
                  r="8" 
                  fill="transparent"
                  className="cursor-pointer"
                >
                  <title>
                    {point.weight}kg - {format(new Date(point.date), 'dd MMM yyyy', { locale: es })}
                  </title>
                </circle>
              </g>
            ))}
          </svg>
        </div>

        {/* Chart footer with date range */}
        <div className="flex justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>
            {format(new Date(sortedData[0].date), 'dd MMM', { locale: es })}
          </span>
          <span>
            {format(new Date(sortedData[sortedData.length - 1].date), 'dd MMM', { locale: es })}
          </span>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {minWeight}kg
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Mínimo
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {maxWeight}kg
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Máximo
            </div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-semibold ${getTrendColor()}`}>
              {Math.abs(totalChange).toFixed(1)}kg
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Variación
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}