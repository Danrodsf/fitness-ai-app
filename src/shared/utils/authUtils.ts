/**
 * Utilidades de autenticación para limpiar estados
 */

export const clearAllAuthState = () => {
  console.log('🧹 Limpiando todo el estado de autenticación...')
  
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
      console.log('🗑️ Removiendo key:', key)
      localStorage.removeItem(key)
    }
  })
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      console.log('🗑️ Removiendo sessionStorage key:', key)
      sessionStorage.removeItem(key)
    }
  })
  
  console.log('✅ Estado de auth limpiado')
}

export const forceLogout = async () => {
  console.log('🚪 Forzando logout completo...')
  
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
      console.log('✅ Logout de Supabase completado')
    }
  } catch (error) {
    console.warn('⚠️ Error en logout de Supabase:', error)
  }
  
  // Recargar la página para asegurar estado limpio
  window.location.reload()
}