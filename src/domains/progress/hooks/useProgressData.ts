import { useEffect, useRef } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { ProgressService } from '../services/progressService'

// Custom hook to load progress data once per user session
export const useProgressData = () => {
  const { dispatch } = useAppContext()
  const { user } = useAuth()
  const loadingState = useRef({
    weightHistory: false,
    milestones: false,
    hasLoadedForUser: null as string | null
  })

  useEffect(() => {
    const loadAllProgressData = async () => {
      if (!user?.id) return

      // Skip if data already loaded for this user
      if (loadingState.current.hasLoadedForUser === user.id) return

      // Mark user as processed immediately to prevent duplicate calls
      loadingState.current.hasLoadedForUser = user.id

      try {
        // Load weight history
        if (!loadingState.current.weightHistory) {
          loadingState.current.weightHistory = true
          const weightHistory = await ProgressService.getWeightHistory(user.id)
          dispatch({
            type: 'WEIGHT_HISTORY_LOAD',
            payload: weightHistory
          })
          dispatch({ type: 'STATS_CALCULATE' })
        }

        // Load milestones
        if (!loadingState.current.milestones) {
          loadingState.current.milestones = true
          const milestones = await ProgressService.getMilestones(user.id)
          dispatch({
            type: 'MILESTONE_HISTORY_LOAD',
            payload: milestones
          })
        }


      } catch {
        // Reset state to allow retry
        loadingState.current.hasLoadedForUser = null
        loadingState.current.weightHistory = false
        loadingState.current.milestones = false
        
        dispatch({
          type: 'NOTIFICATION_ADD',
          payload: {
            type: 'error',
            title: 'Error cargando datos',
            message: 'No se pudieron cargar los datos de progreso'
          }
        })
      }
    }

    loadAllProgressData()
  }, [user?.id, dispatch])

  return {
    isLoading: user?.id && loadingState.current.hasLoadedForUser !== user.id
  }
}