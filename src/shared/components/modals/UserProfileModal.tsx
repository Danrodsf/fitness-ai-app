import { useState } from 'react'
import { Button, Input, Badge } from '@/shared/components/ui'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { AIService } from '@/shared/services/AIService'
import { useAppContext } from '@/store'
import { X, User, LogOut, RefreshCw, Sparkles } from 'lucide-react'

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export const UserProfileModal = ({ isOpen, onClose }: UserProfileModalProps) => {
  const { user, profile, updateProfile, createProfile, logout, loading, error } = useAuth()
  const { dispatch } = useAppContext()
  
  const [isEditing, setIsEditing] = useState(!profile) // Auto-edit si no hay perfil
  const [isRegeneratingPlan, setIsRegeneratingPlan] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.name || 'Usuario',
    age: profile?.age || 39,
    weight: profile?.weight || 81,
    height: profile?.height || 181,
    goals: profile?.goals || ['ganar_musculatura', 'reducir_grasa_abdominal'],
    fitness_goals: profile?.goals || ['ganar_musculatura', 'reducir_grasa_abdominal'],
    medical_conditions: [] as string[],
    experience_level: 'beginner' as string,
    workout_frequency: 3 as number,
    preferences: {
      theme: profile?.preferences?.theme || 'system' as const,
      notifications: profile?.preferences?.notifications || true,
      autoBackup: profile?.preferences?.autoBackup || true,
      language: profile?.preferences?.language || 'es',
    }
  })

  if (!isOpen) return null

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      if (profile) {
        await updateProfile(formData)
      } else {
        await createProfile(formData)
      }
      setIsEditing(false)
    } catch (err) {
      // Error manejado por el hook
    }
  }

  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await logout()
      onClose()
    }
  }

  // 🔥 NUEVO: Función para regenerar plan con nuevos objetivos
  const handleRegeneratePlan = async () => {
    if (!user?.id || !profile?.preferences?.onboardingData) {
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pueden regenerar los datos. Completa el onboarding primero.'
        }
      })
      return
    }

    setIsRegeneratingPlan(true)
    try {
      // Crear nuevos datos de onboarding con objetivos actualizados
      const updatedOnboardingData = {
        ...profile.preferences.onboardingData,
        primaryGoal: formData.goals[0] || 'ganar_musculatura', // Usar primer objetivo como principal
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        // Mantener otros datos del onboarding original
      }

      // Regenerar plan con IA usando datos actualizados (forzar nueva llamada)
      // Agregar timestamp único para evitar caché
      const updatedOnboardingDataWithTimestamp = {
        ...updatedOnboardingData,
        timestamp: Date.now() // Forzar nueva generación
      }
      const aiResponse = await AIService.generatePlans(updatedOnboardingDataWithTimestamp, true)
      
      // Actualizar perfil con nuevo plan y datos actualizados
      await updateProfile({
        ...profile,
        weight: formData.weight,
        height: formData.height,
        age: formData.age,
        goals: formData.goals,
        preferences: {
          ...profile.preferences,
          onboardingData: updatedOnboardingData,
          aiPlans: aiResponse
        }
      })

      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: '¡Plan actualizado!',
          message: 'Tu plan ha sido regenerado con tus nuevos objetivos'
        }
      })

      // Cerrar modal después de regenerar
      onClose()
    } catch (error) {
      console.error('Error regenerando plan:', error)
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pudo regenerar el plan. Inténtalo de nuevo.'
        }
      })
    } finally {
      setIsRegeneratingPlan(false)
    }
  }

  const fitnessGoalsOptions = [
    { value: 'ganar_musculatura', label: 'Ganar musculatura' },
    { value: 'reducir_grasa', label: 'Reducir grasa corporal' },
    { value: 'fuerza', label: 'Aumentar fuerza' },
    { value: 'resistencia', label: 'Mejorar resistencia' },
    { value: 'salud_general', label: 'Salud general' },
  ]

  const medicalConditionsOptions = [
    { value: 'asma', label: 'Asma' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'hipertension', label: 'Hipertensión' },
    { value: 'problemas_cardiacos', label: 'Problemas cardíacos' },
    { value: 'lesiones_previas', label: 'Lesiones previas' },
  ]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6 relative z-10 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mi Perfil
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

        {/* User Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
            <User size={24} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user?.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'hoy'}
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Información Básica
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Edad
                </label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  disabled={!isEditing}
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Peso (kg)
                </label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                  disabled={!isEditing}
                  min="40"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Altura (cm)
                </label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                  disabled={!isEditing}
                  min="140"
                  max="220"
                />
              </div>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nivel de Experiencia
            </label>
            <select
              value={formData.experience_level}
              onChange={(e) => handleInputChange('experience_level', e.target.value)}
              disabled={!isEditing}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>

          {/* Workout Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frecuencia de Entrenamiento (días/semana)
            </label>
            <Input
              type="number"
              value={formData.workout_frequency}
              onChange={(e) => handleInputChange('workout_frequency', parseInt(e.target.value))}
              disabled={!isEditing}
              min="1"
              max="7"
            />
          </div>

          {/* Fitness Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Objetivos de Fitness
            </label>
            <div className="space-y-2">
              {fitnessGoalsOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.fitness_goals.includes(option.value)}
                    onChange={(e) => {
                      const newGoals = e.target.checked
                        ? [...formData.fitness_goals, option.value]
                        : formData.fitness_goals.filter((g: string) => g !== option.value)
                      handleInputChange('fitness_goals', newGoals)
                    }}
                    disabled={!isEditing}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Condiciones Médicas
            </label>
            <div className="space-y-2">
              {medicalConditionsOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.medical_conditions?.includes(option.value) || false}
                    onChange={(e) => {
                      const newConditions = e.target.checked
                        ? [...(formData.medical_conditions || []), option.value]
                        : (formData.medical_conditions || []).filter((c: string) => c !== option.value)
                      handleInputChange('medical_conditions', newConditions)
                    }}
                    disabled={!isEditing}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 🔥 NUEVO: Sección de Plan IA */}
        {profile?.preferences?.aiPlans && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                Plan de IA
              </h3>
              <Badge variant="outline" size="sm" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                Personalizado
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Objetivo actual:</span>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {profile.preferences.onboardingData?.primaryGoal?.replace('_', ' ') || 'No definido'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">Plan generado:</span>
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {profile.preferences.aiPlans?.trainingPlan?.name || 'Plan de entrenamiento'}
                </span>
              </div>

              {/* Botón para regenerar plan */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegeneratePlan}
                disabled={isRegeneratingPlan}
                leftIcon={isRegeneratingPlan ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                className="w-full mt-3 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                {isRegeneratingPlan ? 'Regenerando Plan...' : '🔄 Regenerar Plan con Nuevos Objetivos'}
              </Button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Cambia tus objetivos arriba y luego regenera el plan para obtener un programa completamente nuevo
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="danger"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </Button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    // Resetear form data si hay perfil
                    if (profile) {
                      setFormData({
                        name: profile.name,
                        age: profile.age,
                        weight: profile.weight,
                        height: profile.height,
                        goals: profile.goals,
                        fitness_goals: profile.goals,
                        medical_conditions: [],
                        experience_level: 'beginner',
                        workout_frequency: 3,
                        preferences: {
                          theme: profile.preferences?.theme || 'system' as const,
                          notifications: profile.preferences?.notifications || true,
                          autoBackup: profile.preferences?.autoBackup || true,
                          language: profile.preferences?.language || 'es',
                        }
                      })
                    }
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}