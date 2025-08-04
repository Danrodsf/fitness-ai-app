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
      if (!user?.id) return

      // Si ya cargamos datos para este usuario, no hacer nada
      if (loadingState.current.hasLoadedForUser === user.id) {
        console.log('📊 useProgressData: Datos ya cargados para usuario', user.id)
        return
      }

      // Marcar usuario como procesado INMEDIATAMENTE
      loadingState.current.hasLoadedForUser = user.id
      console.log('🚀 useProgressData: Iniciando carga completa para usuario', user.id)

      try {
        // Cargar weight history
        if (!loadingState.current.weightHistory) {
          loadingState.current.weightHistory = true
          console.log('📊 useProgressData: Cargando weight history...')
          
          const weightHistory = await ProgressService.getWeightHistory(user.id)
          console.log(`✅ useProgressData: Weight history cargado (${weightHistory.length} registros)`)
          
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
          loadingState.current.milestones = true
          console.log('🎯 useProgressData: Cargando milestones...')
          
          const milestones = await ProgressService.getMilestones(user.id)
          console.log(`✅ useProgressData: Milestones cargados (${milestones.length} registros)`)
          
          dispatch({
            type: 'MILESTONE_HISTORY_LOAD',
            payload: milestones
          })
        }

        console.log('🎉 useProgressData: Carga completa finalizada para usuario', user.id)

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