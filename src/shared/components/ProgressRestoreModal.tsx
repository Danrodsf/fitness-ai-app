import { Button } from '@/shared/components/ui'
import { RefreshCw, Trash2, Clock } from 'lucide-react'

interface ProgressRestoreModalProps {
  isOpen: boolean
  onContinue: () => void
  onRestart: () => void
  lastUpdated: string
  currentStep: number
  totalSteps: number
}

export const ProgressRestoreModal = ({ 
  isOpen, 
  onContinue, 
  onRestart, 
  lastUpdated, 
  currentStep, 
  totalSteps 
}: ProgressRestoreModalProps) => {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Progreso Guardado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Encontramos un onboarding en progreso
          </p>
        </div>

        {/* Progress Info */}
        <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progreso:</span>
            <span className="font-semibold text-primary-700 dark:text-primary-400">
              Paso {currentStep + 1} de {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            Guardado: {formatDate(lastUpdated)}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <RefreshCw className="w-4 h-4" />
            Continuar donde me quedé
          </Button>
          
          <Button
            variant="outline"
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Empezar desde el inicio
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
          Tu progreso se guarda automáticamente cada pocos segundos
        </p>
      </div>
    </div>
  )
}