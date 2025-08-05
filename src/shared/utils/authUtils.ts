/**
 * Utilidades de autenticación para limpiar estados
 */

export const clearAllAuthState = () => {
  
  // Limpiar localStorage relacionado con auth
  const authKeys = [
    'pending_email_verification',
    'pending_email_address',
    'supabase.auth.token', // Supabase token
    'sb-auth-token', // Posible token de Supabase
  ]
  
  authKeys.forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
  
  // También limpiar cualquier key que contenga 'supabase' o 'auth'
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      localStorage.removeItem(key)
    }
  })
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      sessionStorage.removeItem(key)
    }
  })
  
}

export const forceLogout = async () => {
  
  // Limpiar estado local
  clearAllAuthState()
  
  // Intentar hacer logout de Supabase también
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    
    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      await supabase.auth.signOut()
    }
  } catch (error) {
    console.warn('⚠️ Error en logout de Supabase:', error)
  }
  
  // Recargar la página para asegurar estado limpio
  window.location.reload()
}