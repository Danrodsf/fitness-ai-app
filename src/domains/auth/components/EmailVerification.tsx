import { useState, useEffect } from 'react'
import { Button, Card, CardContent } from '@/shared/components/ui'
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface EmailVerificationProps {
  email: string
  onBackToLogin: () => void
}

export const EmailVerification = ({ email, onBackToLogin }: EmailVerificationProps) => {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const { resendConfirmationEmail } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleResendEmail = async () => {
    if (!canResend || isResending) return

    setIsResending(true)
    try {
      await resendConfirmationEmail(email)
      setResendSuccess(true)
      setCanResend(false)
      setCountdown(60)
      
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (error) {
      console.error('Error reenviando email:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          {/* Icono de email */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verifica tu email
          </h1>

          {/* Descripción */}
          <p className="text-gray-600 mb-6">
            Hemos enviado un enlace de verificación a{' '}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          {/* Instrucciones */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Revisa tu bandeja de entrada
                </p>
                <p className="text-xs text-blue-700">
                  Haz clic en el enlace del email para activar tu cuenta. 
                  Si no lo ves, revisa la carpeta de spam.
                </p>
              </div>
            </div>
          </div>

          {/* Botón de reenvío */}
          <div className="space-y-4">
            {resendSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✅ Email reenviado correctamente
                </p>
              </div>
            )}

            <Button
              onClick={handleResendEmail}
              disabled={!canResend || isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : canResend ? (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar email
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar en {countdown}s
                </>
              )}
            </Button>

            {/* Volver al login */}
            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </div>

          {/* Ayuda */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              ¿Problemas con la verificación?{' '}
              <button className="text-blue-600 hover:text-blue-800 underline">
                Contacta soporte
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}