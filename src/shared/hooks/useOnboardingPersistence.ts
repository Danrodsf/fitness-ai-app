import { useState, useEffect, useCallback } from 'react'
import { OnboardingData } from '@/shared/types/onboarding.types'

const ONBOARDING_STORAGE_KEY = 'fitness-ai-onboarding-progress'
const AUTO_SAVE_DELAY = 2000 // 2 segundos después del último cambio

interface OnboardingProgress {
  currentStep: number
  formData: OnboardingData
  lastUpdated: string
  version: string // Para manejar cambios en el schema
}

export const useOnboardingPersistence = (initialData: OnboardingData) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<OnboardingData>(initialData)
  const [isRestoring, setIsRestoring] = useState(true)
  const [hasStoredProgress, setHasStoredProgress] = useState(false)

  // Cargar progreso guardado al inicializar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY)
      if (stored) {
        const progress: OnboardingProgress = JSON.parse(stored)
        
        // Verificar que los datos no sean muy antiguos (7 días)
        const lastUpdated = new Date(progress.lastUpdated)
        const now = new Date()
        const daysDiff = Math.abs((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= 7 && progress.version === '1.0') {
          setCurrentStep(progress.currentStep)
          setFormData(progress.formData)
          setHasStoredProgress(true)
        } else {
          // Limpiar datos antiguos o incompatibles
          localStorage.removeItem(ONBOARDING_STORAGE_KEY)
        }
      }
    } catch (error) {
      console.warn('Error al cargar progreso del onboarding:', error)
      localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    }
    
    setIsRestoring(false)
  }, [])

  // Auto-guardar con debounce
  useEffect(() => {
    if (isRestoring) return
    
    const saveProgress = () => {
      try {
        const progress: OnboardingProgress = {
          currentStep,
          formData,
          lastUpdated: new Date().toISOString(),
          version: '1.0'
        }
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress))
      } catch (error) {
        console.warn('Error al guardar progreso del onboarding:', error)
      }
    }

    const timeoutId = setTimeout(saveProgress, AUTO_SAVE_DELAY)
    return () => clearTimeout(timeoutId)
  }, [currentStep, formData, isRestoring])

  const updateFormData = useCallback((field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleArrayToggle = useCallback((field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }))
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1)
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => prev - 1)
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const clearProgress = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY)
    setHasStoredProgress(false)
  }, [])

  const restartOnboarding = useCallback(() => {
    setCurrentStep(0)
    setFormData(initialData)
    clearProgress()
  }, [initialData, clearProgress])

  return {
    currentStep,
    formData,
    isRestoring,
    hasStoredProgress,
    updateFormData,
    handleArrayToggle,
    nextStep,
    prevStep,
    goToStep,
    clearProgress,
    restartOnboarding
  }
}