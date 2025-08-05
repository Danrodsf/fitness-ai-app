import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { AuthService } from '../services/authService'
import { AuthUser, UserProfile, LoginCredentials, RegisterCredentials, ProfileUpdateData } from '../types/auth.types'

interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: ProfileUpdateData) => Promise<void>
  createProfile: (data: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  resendConfirmationEmail: (email: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let currentUserId: string | null = null
    let profileCache: UserProfile | null = null
    let profileLoaded = false
    let pendingCalls = new Set<string>() // Evitar llamadas duplicadas
    

    // 🔥 SOLUCIÓN DEFINITIVA: Cache de perfil + control de llamadas duplicadas
    const loadUserProfile = async (userId: string, source: string) => {
      // Si ya tenemos el perfil de este usuario en cache, no hacer nada
      if (profileLoaded && currentUserId === userId) {
        return profileCache
      }
      
      // Si ya hay una llamada pendiente para este usuario, no hacer otra
      if (pendingCalls.has(userId)) {
        return
      }
      
      pendingCalls.add(userId)
      
      try {
        
        const userProfile = await AuthService.getProfile(userId)
        if (!isMounted) return
        
        // Actualizar cache
        currentUserId = userId
        profileCache = userProfile
        profileLoaded = true
        
        setProfile(userProfile)
        
        // 🔥 FIX: Solo quitar loading DESPUÉS de que el perfil esté completamente procesado
        if (isMounted) {
          // Pequeño delay para asegurar que el estado se ha propagado
          setTimeout(() => {
            if (isMounted) {
              setLoading(false)
            }
          }, 50)
        }
        
        return userProfile
      } catch (err) {
        if (!isMounted) return
        console.error(`❌ [${source}] Error cargando perfil:`, err)
        
        // Actualizar cache incluso en error
        currentUserId = userId
        profileCache = null
        profileLoaded = true
        
        setProfile(null)
        
        // 🔥 FIX: Quitar loading incluso en error
        if (isMounted) {
          setTimeout(() => {
            if (isMounted) {
              setLoading(false)
            }
          }, 50)
        }
        
        return null
      } finally {
        pendingCalls.delete(userId)
      }
    }

    // Inicializar usuario actual
    const initializeAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        if (!isMounted) return
        
        setUser(currentUser)
        
        if (currentUser) {
          await loadUserProfile(currentUser.id, 'INIT')
        } else {
          // 🔥 FIX: Si no hay usuario, sí quitar loading
          if (isMounted) {
            setLoading(false)
          }
        }
      } catch (err) {
        if (!isMounted) return
        console.error('❌ Error initializing auth:', err)
        setError(err instanceof Error ? err.message : 'Error de autenticación')
      } finally {
        // 🔥 FIX: No setear loading(false) aquí, se setea en loadUserProfile
      }
    }

    // Escuchar cambios de autenticación
    const { data: { subscription } } = AuthService.onAuthStateChange(async (authUser) => {
      if (!isMounted) return
      
      const authUserId = authUser?.id || null
      const prevUserId = user?.id || null
      
      
      // 🔥 SOLUCIÓN: Solo cargar perfil si no está ya en cache para este usuario
      if (authUserId && currentUserId !== authUserId) {
        setUser(authUser)
        await loadUserProfile(authUserId, 'AUTH_CHANGE')
      } 
      // Caso 2: Logout
      else if (!authUserId && prevUserId) {
        setUser(null)
        setProfile(null)
        currentUserId = null
        profileCache = null
        profileLoaded = false
        // 🔥 FIX: En logout, quitar loading inmediatamente
        if (isMounted) {
          setLoading(false)
        }
      }
      // Caso 3: Usuario ya en cache (ignorar completamente)
      else if (authUserId === currentUserId) {
        // Solo actualizar user state si es necesario
        if (user?.id !== authUserId) {
          setUser(authUser)
        }
      }
      
      // 🔥 FIX: No setear loading(false) aquí, se maneja en loadUserProfile
    })

    // 🔥 SOLUCIÓN: Delay para permitir que auth se estabilice antes de init
    setTimeout(() => {
      if (isMounted) {
        initializeAuth()
      }
    }, 100)

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.login(credentials)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el login')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true)
      setError(null)
      
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }
      
      await AuthService.register(credentials)
    } catch (err) {
      console.error('❌ Error en useAuth.register:', err)
      setError(err instanceof Error ? err.message : 'Error en el registro')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.logout()
      setUser(null)
      setProfile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el logout')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('Usuario no autenticado')
    
    try {
      setLoading(true)
      setError(null)
      const newProfile = await AuthService.createProfile(user.id, profileData)
      setProfile(newProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando perfil')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updateData: ProfileUpdateData) => {
    if (!user) throw new Error('Usuario no autenticado')
    
    try {
      setLoading(true)
      setError(null)
      const updatedProfile = await AuthService.updateProfile(user.id, updateData)
      setProfile(updatedProfile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando perfil')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resendConfirmationEmail = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      await AuthService.resendConfirmationEmail(email)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error reenviando email')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const contextValue: AuthContextType = {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    createProfile,
    resendConfirmationEmail,
    clearError,
  }

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  )
}