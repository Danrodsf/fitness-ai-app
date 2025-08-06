import React from 'react'
import { Brain, TrendingUp, TrendingDown, Minus, Zap, Calendar, ChevronRight } from 'lucide-react'
import { useProgressAnalysis } from '@/shared/hooks/useProgressAnalysis'
import { useAICoach } from '@/shared/hooks/useAICoach'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

export const ProgressInsightsCard: React.FC = () => {
  const { 
    triggerManualAnalysis, 
    getWeeklyProgressSummary, 
    isAnalysisAvailable 
  } = useProgressAnalysis()
  
  const { openChat } = useAICoach()
  
  if (!isAnalysisAvailable) {
    return null
  }

  const summary = getWeeklyProgressSummary()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'good': return <TrendingUp className="w-5 h-5 text-blue-600" />
      case 'stagnant': return <Minus className="w-5 h-5 text-yellow-600" />
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-600" />
      default: return <Brain className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'good': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'stagnant': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'declining': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excelente progreso'
      case 'good': return 'Buen progreso'
      case 'stagnant': return 'Progreso estancado'
      case 'declining': return 'Progreso en declive'
      default: return 'Sin análisis'
    }
  }

  const handleAnalysisClick = async () => {
    if (summary.hasData) {
      // Open chat to see analysis
      openChat()
    } else {
      // Trigger new analysis
      await triggerManualAnalysis()
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Análisis de Progreso AI
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Insights personalizados de tu entrenador AI
            </p>
          </div>
        </div>
        
        {summary.lastAnalysisDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {new Date(summary.lastAnalysisDate).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short'
            })}
          </div>
        )}
      </div>

      {summary.hasData ? (
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon(summary.status)}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(summary.status)}`}>
              {getStatusText(summary.status)}
            </span>
          </div>

          {/* Key Insights */}
          {summary.keyInsights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🎯 Insights Clave
              </h4>
              <div className="space-y-1">
                {summary.keyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {summary.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                💡 Recomendaciones Prioritarias
              </h4>
              <div className="space-y-2">
                {summary.recommendations.map((rec, index) => (
                  <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border-l-2 border-yellow-400">
                    <div className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                      {rec.title}
                    </div>
                    <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      {rec.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="text-gray-500 mb-3">
            {summary.shouldTriggerNewAnalysis ? (
              <>
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm">¡Es hora de analizar tu progreso!</p>
                <p className="text-xs">Tu entrenador AI revisará tus datos</p>
              </>
            ) : (
              <>
                <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Completa algunos entrenamientos primero</p>
                <p className="text-xs">Necesitas datos para el análisis</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
        <Button
          onClick={handleAnalysisClick}
          variant="outline"
          size="sm"
          className="w-full text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
        >
          <div className="flex items-center justify-center gap-2">
            {summary.hasData ? (
              <>
                <Brain className="w-4 h-4" />
                Ver análisis completo
                <ChevronRight className="w-3 h-3" />
              </>
            ) : summary.shouldTriggerNewAnalysis ? (
              <>
                <Zap className="w-4 h-4" />
                Analizar mi progreso
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Análisis no disponible
              </>
            )}
          </div>
        </Button>
      </div>

      {/* Tip */}
      <div className="mt-3 text-xs text-center text-gray-500">
        💡 El análisis se actualiza automáticamente cada semana
      </div>
    </Card>
  )
}