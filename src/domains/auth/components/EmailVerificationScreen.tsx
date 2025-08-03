import { useState } from 'react'
import { Card, CardContent, Button } from '@/shared/components/ui'
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface EmailVerificationScreenProps {
  email: string
  onBackToLogin: () => void
}

export const EmailVerificationScreen = ({ email, onBackToLogin }: EmailVerificationScreenProps) => {
  const { resendConfirmationEmail } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState('')

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendStatus('idle')
    setResendMessage('')

    try {
      await resendConfirmationEmail(email)
      setResendStatus('success')
      setResendMessage('Email de verificación reenviado correctamente')
    } catch (error) {
      setResendStatus('error')
      setResendMessage(error instanceof Error ? error.message : 'Error reenviando email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {/* Header */}
          <div className="flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verifica tu email
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Te hemos enviado un email de verificación a:
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-900 dark:text-white break-all">
              {email}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Revisa tu bandeja de entrada</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Revisa la carpeta de spam o correo no deseado</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Haz clic en el enlace del email para verificar tu cuenta</span>
            </div>
          </div>

          {/* Resend Status */}
          {resendStatus !== 'idle' && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              resendStatus === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}>
              {resendStatus === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{resendMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar email de verificación
                </>
              )}
            </Button>

            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al login
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Si sigues teniendo problemas, puedes contactar con soporte
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}