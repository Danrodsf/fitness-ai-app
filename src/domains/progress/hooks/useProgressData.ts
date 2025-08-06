import { useEffect, useRef } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { ProgressService } from '../services/progressService'

// Custom hook para cargar datos de progreso UNA SOLA VEZ
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
      console.log('🔄 useProgressData: Starting data load for user:', user?.id)
      
      if (!user?.id) {
        console.log('❌ useProgressData: No user ID, skipping data load')
        return
      }

      // Si ya cargamos datos para este usuario, no hacer nada
      if (loadingState.current.hasLoadedForUser === user.id) {
        console.log('✅ useProgressData: Data already loaded for user:', user.id)
        return
      }

      console.log('📊 useProgressData: Loading fresh data for user:', user.id)
      // Marcar usuario como procesado INMEDIATAMENTE
      loadingState.current.hasLoadedForUser = user.id

      try {
        // Cargar weight history
        if (!loadingState.current.weightHistory) {
          console.log('⚖️ useProgressData: Loading weight history...')
          loadingState.current.weightHistory = true
          
          const weightHistory = await ProgressService.getWeightHistory(user.id)
          console.log('⚖️ useProgressData: Weight history loaded:', weightHistory?.length || 0, 'entries')
          
          dispatch({
            type: 'WEIGHT_HISTORY_LOAD',
            payload: weightHistory
          })

          // Recalcular estadísticas con los nuevos datos
          dispatch({
            type: 'STATS_CALCULATE'
          })
        }

        // Cargar milestones
        if (!loadingState.current.milestones) {
          console.log('🎯 useProgressData: Loading milestones...')
          loadingState.current.milestones = true
          
          const milestones = await ProgressService.getMilestones(user.id)
          console.log('🎯 useProgressData: Milestones loaded:', milestones?.length || 0, 'milestones')
          
          dispatch({
            type: 'MILESTONE_HISTORY_LOAD',
            payload: milestones
          })
        }


      } catch (error) {
        console.error('❌ useProgressData: Error cargando datos:', error)
        
        // Reset en caso de error para permitir retry
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