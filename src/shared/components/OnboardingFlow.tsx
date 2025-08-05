import { useState } from 'react'
import { Button, Input, Card } from '@/shared/components/ui'
import { ChevronRight, ChevronLeft, Sparkles, Target, Activity, Apple } from 'lucide-react'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { AIService } from '@/shared/services/AIService'
import { TrainingService } from '@/domains/training/services/trainingService'
import { NutritionService } from '@/domains/nutrition/services/nutritionService'

interface OnboardingData {
  // Datos personales
  name: string
  age: number
  weight: number
  height: number
  gender: 'male' | 'female' | 'other'
  
  // Objetivos
  primaryGoal: 'lose_weight' | 'gain_muscle' | 'improve_endurance' | 'general_health'
  targetWeight?: number
  timeframe: '1-3' | '3-6' | '6-12' | '12+' // meses
  
  // Experiencia
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  currentActivity: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  workoutFrequency: number // días por semana
  
  // Preferencias de entrenamiento
  preferredWorkouts: string[]
  availableEquipment: string[]
  timePerWorkout: number // minutos
  
  // Restricciones
  injuries: string[]
  healthConditions: string[]
  dietaryRestrictions: string[]
  
  // Alimentación
  mealsPerDay: number
  cookingTime: 'minimal' | 'moderate' | 'extensive'
  budget: 'low' | 'medium' | 'high'
  
  // 🔥 NUEVO: Campo libre prioritario
  additionalInfo: string
}

export const OnboardingFlow = () => {
  const { updateProfile, user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    age: 25,
    weight: 70,
    height: 170,
    gender: 'male',
    primaryGoal: 'general_health',
    timeframe: '3-6',
    experienceLevel: 'beginner',
    currentActivity: 'moderate',
    workoutFrequency: 3,
    preferredWorkouts: [],
    availableEquipment: [],
    timePerWorkout: 45,
    injuries: [],
    healthConditions: [],
    dietaryRestrictions: [],
    mealsPerDay: 3,
    cookingTime: 'moderate',
    budget: 'medium',
    additionalInfo: ''
  })

  const updateFormData = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const generateAIPlans = async () => {
    setIsLoading(true)
    
    try {
      
      // 1. GENERAR PLANES CON IA PRIMERO
      const aiResponse = await AIService.generatePlans(formData)

      if (!user) throw new Error('Usuario no autenticado')

      // 2. GUARDAR PLANES EN BASE DE DATOS INMEDIATAMENTE
      
      // Guardar programa de entrenamiento
      if (aiResponse.trainingPlan) {
        await TrainingService.saveTrainingProgram(user.id, aiResponse.trainingPlan)
      }
      
      // Guardar objetivos nutricionales
      if (aiResponse.nutritionPlan?.goals) {
        await NutritionService.saveNutritionGoals(user.id, aiResponse.nutritionPlan.goals)
      }
      
      // Guardar plan de comidas semanal
      if (aiResponse.nutritionPlan?.weeklyPlan) {
        await NutritionService.saveWeeklyMealPlan(user.id, aiResponse.nutritionPlan.weeklyPlan)
      }

      // 3. ACTUALIZAR PERFIL CON DATOS DEL ONBOARDING
      
      // Simplificar onboardingData para evitar problemas de serialización
      const simplifiedOnboardingData = {
        primaryGoal: formData.primaryGoal,
        experienceLevel: formData.experienceLevel,
        workoutFrequency: formData.workoutFrequency,
        timePerWorkout: formData.timePerWorkout,
        mealsPerDay: formData.mealsPerDay,
        cookingTime: formData.cookingTime,
        budget: formData.budget,
        dietaryRestrictions: formData.dietaryRestrictions,
        gender: formData.gender,
        timeframe: formData.timeframe,
        currentActivity: formData.currentActivity
      }
      
      await updateProfile({
        name: formData.name,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        goals: [formData.primaryGoal],
        preferences: {
          theme: 'system',
          notifications: true,
          autoBackup: true,
          language: 'es',
          onboardingCompleted: true,
          onboardingData: simplifiedOnboardingData,
          aiPlansGeneratedAt: new Date().toISOString()
        }
      })
      
      
    } catch (error) {
      console.error('Error generating AI plans:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Funciones auxiliares para cálculos
  // const calculateCalories = (data: OnboardingData) => {
  //   // Fórmula Harris-Benedict simplificada
  //   let bmr = data.gender === 'male' 
  //     ? 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
  //     : 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age)
  //   
  //   const activityMultipliers = {
  //     sedentary: 1.2,
  //     light: 1.375,
  //     moderate: 1.55,
  //     active: 1.725,
  //     very_active: 1.9
  //   }
  //   
  //   return Math.round(bmr * activityMultipliers[data.currentActivity])
  // }

  // const calculateMacros = (data: OnboardingData) => {
  //   const calories = calculateCalories(data)
  //   return {
  //     protein: Math.round(data.weight * 2), // 2g por kg
  //     carbs: Math.round(calories * 0.4 / 4), // 40% de calorías
  //     fats: Math.round(calories * 0.3 / 9) // 30% de calorías
  //   }
  // }

  const steps = [
    {
      title: 'Información Personal',
      icon: <Target className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ¿Cómo te llamas?
            </label>
            <Input
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              placeholder="Tu nombre"
              className="text-lg"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edad
              </label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                min={16}
                max={80}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Género
              </label>
              <select 
                value={formData.gender}
                onChange={(e) => updateFormData('gender', e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                disabled={isLoading}
              >
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Peso (kg)
              </label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => updateFormData('weight', parseFloat(e.target.value))}
                min={30}
                max={200}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Altura (cm)
              </label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => updateFormData('height', parseInt(e.target.value))}
                min={140}
                max={220}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Objetivos',
      icon: <Target className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              ¿Cuál es tu objetivo principal?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'lose_weight', label: 'Perder peso', icon: '⚖️' },
                { value: 'gain_muscle', label: 'Ganar músculo', icon: '💪' },
                { value: 'improve_endurance', label: 'Mejorar resistencia', icon: '🏃' },
                { value: 'general_health', label: 'Salud general', icon: '❤️' }
              ].map(goal => (
                <button
                  key={goal.value}
                  onClick={() => updateFormData('primaryGoal', goal.value)}
                  disabled={isLoading}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.primaryGoal === goal.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="text-2xl mb-2">{goal.icon}</div>
                  <div className="text-sm font-medium">{goal.label}</div>
                </button>
              ))}
            </div>
          </div>
          
          {formData.primaryGoal === 'lose_weight' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Peso objetivo (kg)
              </label>
              <Input
                type="number"
                value={formData.targetWeight || ''}
                onChange={(e) => updateFormData('targetWeight', parseFloat(e.target.value))}
                placeholder="Peso que quieres alcanzar"
                disabled={isLoading}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              ¿En cuánto tiempo quieres ver resultados?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '1-3', label: '1-3 meses' },
                { value: '3-6', label: '3-6 meses' },
                { value: '6-12', label: '6-12 meses' },
                { value: '12+', label: 'Más de 1 año' }
              ].map(time => (
                <button
                  key={time.value}
                  onClick={() => updateFormData('timeframe', time.value)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.timeframe === time.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Experiencia',
      icon: <Activity className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              ¿Cuál es tu nivel de experiencia?
            </label>
            <div className="space-y-3">
              {[
                { value: 'beginner', label: 'Principiante', desc: 'Poco o ningún ejercicio regular' },
                { value: 'intermediate', label: 'Intermedio', desc: 'Ejercicio regular por algunos meses' },
                { value: 'advanced', label: 'Avanzado', desc: 'Años de experiencia consistente' }
              ].map(level => (
                <button
                  key={level.value}
                  onClick={() => updateFormData('experienceLevel', level.value)}
                  disabled={isLoading}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.experienceLevel === level.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              ¿Cuántos días por semana quieres entrenar?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map(days => (
                <button
                  key={days}
                  onClick={() => updateFormData('workoutFrequency', days)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.workoutFrequency === days
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {days} días
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ¿Cuánto tiempo tienes por sesión? (minutos)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[30, 45, 60].map(time => (
                <button
                  key={time}
                  onClick={() => updateFormData('timePerWorkout', time)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.timePerWorkout === time
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {time} min
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Alimentación',
      icon: <Apple className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              ¿Cuántas comidas prefieres por día?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[3, 4, 5].map(meals => (
                <button
                  key={meals}
                  onClick={() => updateFormData('mealsPerDay', meals)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.mealsPerDay === meals
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {meals} comidas
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              ¿Cuánto tiempo dedicas a cocinar?
            </label>
            <div className="space-y-3">
              {[
                { value: 'minimal', label: 'Mínimo', desc: 'Comidas rápidas y sencillas' },
                { value: 'moderate', label: 'Moderado', desc: 'Algo de preparación' },
                { value: 'extensive', label: 'Mucho', desc: 'Me gusta cocinar elaborado' }
              ].map(cooking => (
                <button
                  key={cooking.value}
                  onClick={() => updateFormData('cookingTime', cooking.value)}
                  disabled={isLoading}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    formData.cookingTime === cooking.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-medium">{cooking.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{cooking.desc}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              ¿Restricciones alimentarias? (opcional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Vegetariano', 'Vegano', 'Sin gluten', 'Sin lactosa',
                'Keto', 'Diabético', 'Hipertensión', 'Sin restricciones'
              ].map(restriction => (
                <button
                  key={restriction}
                  onClick={() => handleArrayToggle('dietaryRestrictions', restriction)}
                  disabled={isLoading}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.dietaryRestrictions.includes(restriction)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-primary-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {restriction}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Información Adicional',
      icon: <Sparkles className="w-6 h-6" />,
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              🎯 ¿Hay algo más que deba saber para crear tu plan perfecto?
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Este campo es <strong>prioritario</strong>. Cualquier información aquí tendrá máxima prioridad al crear tu plan.
            </p>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => updateFormData('additionalInfo', e.target.value)}
              disabled={isLoading}
              placeholder="Ejemplo: Soy asmático y no puedo hacer cardio intenso. Prefiero proteína marca X. No me gusta el pescado. Tengo dolor en la rodilla izquierda. Solo entreno en casa..."
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 Incluye: condiciones médicas, alergias, preferencias específicas, limitaciones, marcas favoritas, etc.
            </p>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full relative">
        {/* 🔥 NUEVO: Overlay de loading que bloquea todo el formulario */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🤖 Creando tu plan personalizado
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Analizando tus objetivos y preferencias</p>
                <p>• Generando rutinas adaptadas a tu nivel</p>
                <p>• Calculando tu plan nutricional personalizado</p>
                <p>• Guardando todo en tu perfil</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                Esto puede tomar unos segundos...
              </p>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mx-auto mb-4">
              {currentStepData.icon}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentStepData.title}
            </h1>
            <div className="flex items-center justify-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Paso {currentStep + 1} de {steps.length}
            </p>
          </div>

          {/* Content */}
          <div className="mb-8">
            {currentStepData.component}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isLoading}
              className="flex items-center gap-2 min-h-[48px] order-2 sm:order-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {isLastStep ? (
              <Button
                onClick={generateAIPlans}
                disabled={isLoading || !formData.name}
                className="flex items-center gap-2 min-h-[48px] order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Crear mi plan personalizado
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={isLoading}
                className="flex items-center gap-2 min-h-[48px] order-1 sm:order-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}