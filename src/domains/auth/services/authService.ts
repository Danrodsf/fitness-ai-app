import { createClient } from '@supabase/supabase-js'
import { AuthUser, UserProfile, LoginCredentials, RegisterCredentials, ProfileUpdateData } from '../types/auth.types'

// Configuración de Supabase - estas variables deben venir del .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Verificar si Supabase está configurado
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== ''

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

export class AuthService {
  // Verificar configuración
  private static checkConfiguration() {
    if (!supabase) {
      throw new Error(
        'Supabase no está configurado. Por favor:\n' +
        '1. Crea un archivo .env en la raíz del proyecto\n' +
        '2. Añade VITE_SUPABASE_URL=tu_url\n' +
        '3. Añade VITE_SUPABASE_ANON_KEY=tu_clave\n' +
        '4. Reinicia el servidor con npm run dev\n\n' +
        'Consulta SUPABASE_MIGRATION.md para más detalles.'
      )
    }
  }

  // Registro de usuario
  static async register(credentials: RegisterCredentials) {
    console.log('🔄 AuthService.register iniciado')
    this.checkConfiguration()
    const { email, password } = credentials
    
    console.log('📡 Llamando a supabase.auth.signUp...')
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: email.split('@')[0], // Usar parte del email como nombre inicial
        }
      }
    })

    if (error) {
      console.error('❌ Error en signUp:', error)
      throw error
    }
    
    console.log('✅ signUp exitoso:', data)
    // NO crear perfil automáticamente - se creará en el onboarding
    return data
  }

  // Login de usuario
  static async login(credentials: LoginCredentials) {
    this.checkConfiguration()
    const { email, password } = credentials
    
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  // Logout
  static async logout() {
    this.checkConfiguration()
    const { error } = await supabase!.auth.signOut()
    if (error) throw error
  }

  // Reenviar email de confirmación
  static async resendConfirmationEmail(email: string) {
    this.checkConfiguration()
    const { error } = await supabase!.auth.resend({
      type: 'signup',
      email: email,
    })
    if (error) throw error
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<AuthUser | null> {
    if (!supabase) return null
    const { data: { user } } = await supabase.auth.getUser()
    return user as AuthUser | null
  }

  // Crear perfil de usuario
  static async createProfile(userId: string, profileData: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    this.checkConfiguration()
    const { data, error } = await supabase!
      .from('user_profiles')
      .insert({
        user_id: userId,
        ...profileData,
      })
      .select()
      .single()

    if (error) throw error
    return data as UserProfile
  }

  // Obtener perfil de usuario
  static async getProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) {
      console.log('⚠️ Supabase no configurado, retornando null')
      return null
    }
    
    try {
      console.log(`🔍 Consultando perfil para usuario: ${userId}`)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`📋 No existe perfil para usuario ${userId} (esperado en usuarios nuevos)`)
          return null
        }
        console.error('❌ Error inesperado consultando perfil:', error)
        throw error
      }

      console.log(`✅ Perfil encontrado para usuario ${userId}`)
      return data as UserProfile
    } catch (err) {
      console.error('❌ Error en getProfile:', err)
      throw err
    }
  }

  // Actualizar perfil de usuario (o crear si no existe)
  static async updateProfile(userId: string, updateData: ProfileUpdateData) {
    this.checkConfiguration()
    
    // Limpiar y validar datos antes de enviar
    const cleanData: any = {}
    
    if (updateData.name) cleanData.name = updateData.name
    if (updateData.age) cleanData.age = Number(updateData.age)
    if (updateData.weight) cleanData.weight = Number(updateData.weight)
    if (updateData.height) cleanData.height = Number(updateData.height)
    if (updateData.goals && Array.isArray(updateData.goals)) cleanData.goals = updateData.goals
    if (updateData.preferences) cleanData.preferences = updateData.preferences
    
    cleanData.updated_at = new Date().toISOString()

    console.log('📤 Enviando datos a Supabase para usuario:', userId)
    console.log('📤 Datos a enviar:', JSON.stringify(cleanData, null, 2))
    
    // Intentar actualizar primero
    const { data: updateData_result, error: updateError } = await supabase!
      .from('user_profiles')
      .update(cleanData)
      .eq('user_id', userId)
      .select()
      .single()

    // Si el perfil no existe (error PGRST116), crearlo
    if (updateError && updateError.code === 'PGRST116') {
      console.log('🔄 Perfil no existe, creando nuevo...')
      const insertData = {
        user_id: userId,
        ...cleanData,
      }
      delete insertData.updated_at // No necesario en insert, se auto-genera
      
      console.log('📤 Datos para crear perfil:', JSON.stringify(insertData, null, 2))
      
      const { data: newProfile, error: insertError } = await supabase!
        .from('user_profiles')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error insertando perfil:', insertError)
        console.error('❌ Detalles del error:', JSON.stringify(insertError, null, 2))
        throw insertError
      }
      
      console.log('✅ Perfil creado exitosamente:', newProfile)
      return newProfile as UserProfile
    }

    // Si hay otro tipo de error en la actualización, lanzarlo
    if (updateError) {
      console.error('❌ Error actualizando perfil:', updateError)
      console.error('❌ Detalles del error:', JSON.stringify(updateError, null, 2))
      throw updateError
    }
    
    console.log('✅ Perfil actualizado exitosamente:', updateData_result)
    return updateData_result as UserProfile
  }

  // Escuchar cambios de autenticación
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!supabase) {
      // Si Supabase no está configurado, simular que no hay usuario
      callback(null)
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user as AuthUser | null)
    })
  }
}