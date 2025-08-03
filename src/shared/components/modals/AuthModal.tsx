import React, { useState } from 'react'
import { Button, Input } from '@/shared/components/ui'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { EmailVerificationScreen } from '@/domains/auth/components/EmailVerificationScreen'
import { X, Eye, EyeOff, Mail, Lock } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  // 🔥 ESTADO PERSISTENTE: Usar localStorage para que sobreviva re-renders
  const [showEmailVerification, setShowEmailVerification] = useState(() => {
    return localStorage.getItem('pending_email_verification') === 'true'
  })
  const [registeredEmail, setRegisteredEmail] = useState(() => {
    return localStorage.getItem('pending_email_address') || ''
  })
  const [isRegistrationInProgress, setIsRegistrationInProgress] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })

  const { login, register, loading, error, clearError, user } = useAuth()

  // 🔥 FUNCIONES HELPER para localStorage
  const setEmailVerificationPending = (email: string) => {
    console.log('💾 Guardando verificación pendiente:', email)
    localStorage.setItem('pending_email_verification', 'true')
    localStorage.setItem('pending_email_address', email)
    setShowEmailVerification(true)
    setRegisteredEmail(email)
  }

  const clearEmailVerificationPending = () => {
    console.log('🧹 Limpiando verificación pendiente')
    localStorage.removeItem('pending_email_verification')
    localStorage.removeItem('pending_email_address')
    setShowEmailVerification(false)
    setRegisteredEmail('')
  }

  // 🔥 LIMPIAR verificación pendiente cuando el usuario se verifica
  React.useEffect(() => {
    if (user && user.email_confirmed_at && showEmailVerification) {
      console.log('✅ Usuario verificado, limpiando estado pendiente')
      clearEmailVerificationPending()
    }
  }, [user, showEmailVerification])

  // 🔥 DEBUG: Logs del estado
  React.useEffect(() => {
    console.log('👀 AuthModal state:', { 
      user: !!user, 
      showEmailVerification, 
      registeredEmail,
      isLogin,
      isRegistrationInProgress
    })
  }, [user, showEmailVerification, registeredEmail, isLogin, isRegistrationInProgress])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (isLogin) {
        console.log('🔑 Intentando login...')
        await login({ email: formData.email, password: formData.password })
        console.log('✅ Login exitoso')
        onClose()
      } else {
        console.log('📝 Intentando registro...', { email: formData.email })
        setIsRegistrationInProgress(true)
        
        await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        })
        console.log('✅ Registro exitoso, configurando verificación pendiente')
        
        // 🔥 USAR FUNCIÓN PERSISTENTE
        setEmailVerificationPending(formData.email)
        setIsRegistrationInProgress(false)
      }
    } catch (err) {
      console.error('❌ Error en handleSubmit:', err)
      // Error ya manejado en el hook
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const switchMode = () => {
    console.log('🔄 switchMode called', { 
      isRegistrationInProgress, 
      showEmailVerification,
      registeredEmail 
    })
    
    // 🔥 NO permitir cambio de modo durante registro o cuando se muestra verificación
    if (isRegistrationInProgress || showEmailVerification) {
      console.log('🚫 switchMode bloqueado: registro en progreso o verificación activa')
      return
    }
    
    setIsLogin(!isLogin)
    setFormData({ email: '', password: '', confirmPassword: '' })
    clearEmailVerificationPending()
    clearError()
  }

  const handleBackToLogin = () => {
    console.log('🔙 handleBackToLogin called')
    clearEmailVerificationPending()
    setIsLogin(true)
    setFormData({ email: '', password: '', confirmPassword: '' })
    clearError()
  }

  // Mostrar pantalla de verificación de email si corresponde
  if (showEmailVerification && registeredEmail) {
    console.log('📧 Renderizando EmailVerificationScreen', { registeredEmail })
    return (
      <EmailVerificationScreen 
        email={registeredEmail}
        onBackToLogin={handleBackToLogin}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 min-h-screen">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
                className="pl-10"
              />
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Tu contraseña"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="pl-10 pr-10"
              />
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only for register) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirma tu contraseña"
                  autoComplete="new-password"
                  required
                  className="pl-10"
                />
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              onClick={switchMode}
              className="ml-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}