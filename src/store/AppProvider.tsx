import { useReducer, useEffect, ReactNode, useState } from 'react'
import { AppContext, createInitialState } from '@/store'
import { appReducer } from '@/store/reducers'
import { StorageService } from '@/shared/services/StorageService'
import { defaultUserProfile } from '@/domains/user/data/userData'
import { defaultTrainingProgram } from '@/domains/training/data/trainingData'
import { useAuth } from '@/domains/auth/hooks/useAuth'

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, createInitialState())
  const { user, profile, loading: authLoading } = useAuth()
  const [lastUserId, setLastUserId] = useState<string | null>(null)

  // Initialize app data when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (authLoading) return // Wait for auth to finish loading
      
      // Solo evitar recargas si es el mismo usuario
      if (user?.id === lastUserId) return

      try {
        if (user) {
          // 🔥 CAMBIO IMPORTANTE: Solo cargar datos de BD si el onboarding está completado
          if (profile?.preferences?.onboardingCompleted) {
            const userData = await StorageService.loadUserData(user.id)
            if (userData) {
              dispatch({ type: 'APP_HYDRATE', payload: userData })
              dispatch({
                type: 'NOTIFICATION_ADD',
                payload: {
                  type: 'success',
                  title: 'Datos sincronizados',
                  message: 'Tus datos se han cargado desde la nube.',
                }
              })
            } else {
              // No data in Supabase, initialize with defaults
              initializeDefaultData()
            }
          } else {
            // Solo inicializar datos por defecto, sin llamadas a BD
            initializeDefaultData()
          }
        } else {
          // User not logged in, try to load from localStorage
          const storedData = await StorageService.loadData()
          if (storedData) {
            dispatch({ type: 'APP_HYDRATE', payload: storedData })
          } else {
            initializeDefaultData()
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        dispatch({
          type: 'NOTIFICATION_ADD',
          payload: {
            type: 'warning',
            title: 'Error cargando datos',
            message: 'No se pudieron cargar los datos. Usando datos por defecto.',
          }
        })
        initializeDefaultData()
      } finally {
        setLastUserId(user?.id || null) // Recordar el último usuario procesado
      }
    }

    const initializeDefaultData = () => {
      // Initialize with default user profile and training program
      dispatch({
        type: 'USER_PROFILE_UPDATE',
        payload: defaultUserProfile
      })
      dispatch({
        type: 'TRAINING_PROGRAM_LOAD',
        payload: defaultTrainingProgram
      })
    }

    loadUserData()
  }, [user, profile, authLoading, lastUserId])

  // 🔥 DESHABILITADO: Auto-sync que causaba loops infinitos de POSTs
  // El auto-sync sincronizaba TODO el estado en cada cambio, causando cientos de POSTs
  // Los datos ahora se guardan individualmente en cada componente cuando es necesario
  
  // useEffect(() => {
  //   const saveData = async () => {
  //     try {
  //       if (user) {
  //         // User is logged in, sync to Supabase
  //         await StorageService.syncUserData(user.id, state)
  //       } else {
  //         // User not logged in, save to localStorage
  //         await StorageService.saveData(state)
  //       }
  //     } catch (error) {
  //       console.error('Error saving data:', error)
  //       // Fallback to localStorage if Supabase fails
  //       try {
  //         await StorageService.saveData(state)
  //       } catch (localError) {
  //         console.error('Error saving to localStorage:', localError)
  //       }
  //     }
  //   }

  //   // 🔥 CAMBIO: No guardar datos si onboarding no está completado
  //   const shouldSave = !authLoading && 
  //                      profile?.preferences?.onboardingCompleted && 
  //                      (state.user.profile || state.progress.weightHistory.length > 0)

  //   if (shouldSave) {
  //     // Debounce the save operation
  //     const timeoutId = setTimeout(saveData, 2000)
  //     return () => clearTimeout(timeoutId)
  //   }
  // }, [state, user, profile, authLoading])

  // Handle system theme changes
  useEffect(() => {
    if (state.theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      
      const handleChange = () => {
        dispatch({
          type: 'THEME_SET',
          payload: 'system'
        })
      }

      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [state.theme.mode])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme.isDark)
  }, [state.theme.isDark])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}