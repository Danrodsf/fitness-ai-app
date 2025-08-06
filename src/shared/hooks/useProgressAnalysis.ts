import { useEffect, useCallback } from 'react'
import { useAppContext } from '@/store'
import { ProgressAnalysisService, ProgressAnalysisResult } from '@/shared/services/ProgressAnalysisService'
import { useAICoach } from './useAICoach'

export const useProgressAnalysis = () => {
  const { state, dispatch } = useAppContext()
  const { openChat } = useAICoach()

  // Check for automatic analysis triggers on app state changes
  useEffect(() => {
    if (!state.user.profile) return

    const shouldAnalyze = ProgressAnalysisService.scheduleAutomaticAnalysis(state)
    
    if (shouldAnalyze) {
    }
  }, [
    state.user.stats.totalWorkouts,
    state.progress.weightHistory.length,
    state.training.workoutHistory.length
  ])

  // Manual analysis trigger
  const triggerManualAnalysis = useCallback(async (): Promise<ProgressAnalysisResult | null> => {
    try {
      dispatch({ 
        type: 'NOTIFICATION_ADD', 
        payload: { 
          type: 'info', 
          title: 'Analizando progreso...', 
          message: 'Tu entrenador AI está revisando tu progreso' 
        } 
      })

      const result = await ProgressAnalysisService.performManualAnalysis(state)
      
      if (result) {
        dispatch({ 
          type: 'NOTIFICATION_ADD', 
          payload: { 
            type: 'success', 
            title: 'Análisis completado', 
            message: 'Revisa los insights de tu progreso en el chat' 
          } 
        })

        // Open chat to show analysis
        openChat()
      } else {
        dispatch({ 
          type: 'NOTIFICATION_ADD', 
          payload: { 
            type: 'error', 
            title: 'Error en análisis', 
            message: 'No se pudo completar el análisis de progreso' 
          } 
        })
      }

      return result
    } catch (error) {
      dispatch({ 
        type: 'NOTIFICATION_ADD', 
        payload: { 
          type: 'error', 
          title: 'Error', 
          message: 'Error al analizar el progreso' 
        } 
      })
      return null
    }
  }, [state, dispatch, openChat])

  // Get analysis data
  const getLatestAnalysis = useCallback((): ProgressAnalysisResult | null => {
    return ProgressAnalysisService.getLatestAnalysis()
  }, [])

  const hasRecentAnalysis = useCallback((): boolean => {
    return ProgressAnalysisService.hasRecentAnalysis()
  }, [])

  const getAnalysisInsights = useCallback((): string[] => {
    return ProgressAnalysisService.getAnalysisInsights()
  }, [])

  const getAllAnalyses = useCallback((): ProgressAnalysisResult[] => {
    return ProgressAnalysisService.getStoredAnalyses()
  }, [])

  // Weekly progress summary component data
  const getWeeklyProgressSummary = useCallback(() => {
    const latestAnalysis = getLatestAnalysis()
    const insights = getAnalysisInsights()
    
    return {
      hasData: !!latestAnalysis,
      status: latestAnalysis?.progressStatus || 'good',
      lastAnalysisDate: latestAnalysis?.timestamp,
      keyInsights: insights.slice(0, 3),
      recommendations: latestAnalysis?.recommendations.filter(r => r.priority === 'high').slice(0, 2) || [],
      shouldTriggerNewAnalysis: !hasRecentAnalysis() && state.user.stats.totalWorkouts > 0
    }
  }, [getLatestAnalysis, getAnalysisInsights, hasRecentAnalysis, state.user.stats.totalWorkouts])

  return {
    triggerManualAnalysis,
    getLatestAnalysis,
    hasRecentAnalysis,
    getAnalysisInsights,
    getAllAnalyses,
    getWeeklyProgressSummary,
    isAnalysisAvailable: !!state.user.profile && !!import.meta.env.VITE_AI_ENDPOINT
  }
}