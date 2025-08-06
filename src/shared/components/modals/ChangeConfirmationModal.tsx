import React from 'react'
import { CheckCircle, XCircle, ArrowRight, Zap, Clock, Target, AlertTriangle } from 'lucide-react'
import { ProposedChange } from '@/shared/services/AICoachService'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'

interface ChangeConfirmationModalProps {
  proposal: ProposedChange
  onConfirm: (proposalId: string) => void
  onReject: () => void
  isOpen: boolean
}

const ChangeConfirmationModal: React.FC<ChangeConfirmationModalProps> = ({
  proposal,
  onConfirm,
  onReject,
  isOpen
}) => {
  if (!isOpen) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'exercise_replacement': return <Target className="w-5 h-5" />
      case 'workout_modification': return <Zap className="w-5 h-5" />
      case 'nutrition_adjustment': return <Clock className="w-5 h-5" />
      case 'progress_analysis': return <AlertTriangle className="w-5 h-5" />
      default: return <Zap className="w-5 h-5" />
    }
  }

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'exercise_replacement': return 'Cambio de Ejercicio'
      case 'workout_modification': return 'Modificación de Rutina'
      case 'nutrition_adjustment': return 'Ajuste Nutricional'
      case 'progress_analysis': return 'Análisis de Progreso'
      default: return 'Cambio Propuesto'
    }
  }

  const renderPreview = () => {
    switch (proposal.type) {
      case 'exercise_replacement':
        return <ExerciseReplacementPreview changes={proposal.changes} />
      case 'workout_modification':
        return <WorkoutModificationPreview changes={proposal.changes} />
      case 'nutrition_adjustment':
        return <NutritionAdjustmentPreview changes={proposal.changes} />
      default:
        return (
          <div className="text-center py-4 text-gray-500">
            Vista previa no disponible para este tipo de cambio
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onReject}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 shadow-2xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              {getChangeTypeIcon(proposal.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {proposal.title}
                </h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(proposal.priority)}`}>
                  {proposal.priority.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {getChangeTypeLabel(proposal.type)}
              </p>
              
              <p className="text-gray-700 dark:text-gray-300">
                {proposal.description}
              </p>
            </div>
          </div>

          {/* Reasoning */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              🎯 ¿Por qué este cambio?
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              {proposal.reasoning}
            </p>
          </div>

          {/* Preview */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              📋 Vista Previa del Cambio
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {renderPreview()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => onConfirm(proposal.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              ✅ Aplicar Cambios
            </Button>
            
            <Button
              onClick={onReject}
              variant="outline"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              ❌ Mantener Actual
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Los cambios se aplicarán inmediatamente y se guardarán en tu plan
          </div>
        </div>
      </Card>
    </div>
  )
}

// Preview Components
const ExerciseReplacementPreview: React.FC<{ changes: any }> = ({ changes }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Current Exercise */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
          📍 Ejercicio Actual
        </h4>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <div className="font-medium text-red-900 dark:text-red-100">
            {changes.current?.name || 'Ejercicio seleccionado'}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">
            {changes.current?.sets || 3} series • {changes.current?.reps || '8-12'} reps
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center">
        <ArrowRight className="w-6 h-6 text-gray-400" />
      </div>

      {/* New Exercise */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
          ✨ Nuevo Ejercicio
        </h4>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="font-medium text-green-900 dark:text-green-100">
            {changes.newExercise?.name || 'Ejercicio de reemplazo'}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            {changes.newExercise?.sets || 3} series • {changes.newExercise?.reps || '8-12'} reps
          </div>
          {changes.newExercise?.benefits && (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              💪 {changes.newExercise.benefits}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)

const WorkoutModificationPreview: React.FC<{ changes: any }> = ({ changes }) => (
  <div className="space-y-4">
    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
      <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
        🔄 Modificaciones a la Rutina
      </h4>
      <div className="space-y-2">
        {changes.modifications?.map((mod: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-800 dark:text-yellow-200">{mod}</span>
          </div>
        )) || (
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            Se aplicarán modificaciones específicas a tu rutina actual
          </div>
        )}
      </div>
    </div>
  </div>
)

const NutritionAdjustmentPreview: React.FC<{ changes: any }> = ({ changes }) => (
  <div className="space-y-4">
    {changes.calories && (
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="text-sm text-red-700 dark:text-red-300">Calorías Actuales</div>
          <div className="font-bold text-red-900 dark:text-red-100">
            {changes.calories.current || 'N/A'} kcal
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-sm text-green-700 dark:text-green-300">Nuevas Calorías</div>
          <div className="font-bold text-green-900 dark:text-green-100">
            {changes.calories.new || 'N/A'} kcal
          </div>
        </div>
      </div>
    )}
    
    {changes.macros && (
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          📊 Ajustes de Macronutrientes
        </h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300">Proteína:</span>
            <br />
            <span className="font-medium">{changes.macros.protein || 'N/A'}g</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Carbos:</span>
            <br />
            <span className="font-medium">{changes.macros.carbs || 'N/A'}g</span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Grasas:</span>
            <br />
            <span className="font-medium">{changes.macros.fats || 'N/A'}g</span>
          </div>
        </div>
      </div>
    )}
  </div>
)

export default ChangeConfirmationModal