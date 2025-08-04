import { AppState } from '@/store'
import { ProgressService } from '@/domains/progress/services/progressService'
import { NutritionService } from '@/domains/nutrition/services/nutritionService'

export class StorageService {
  private static readonly STORAGE_KEY = 'fitness-app-data'
  private static readonly BACKUP_PREFIX = 'fitness-backup-'

  // Legacy localStorage methods for fallback
  static async saveData(data: AppState): Promise<void> {
    try {
      const dataToSave = {
        ...data,
        // Don't save loading states or temporary data
        user: { ...data.user, isLoading: false },
        training: { ...data.training, isLoading: false },
        nutrition: { ...data.nutrition, isLoading: false },
        progress: { ...data.progress, isLoading: false },
        notifications: [], // Don't persist notifications
        timestamp: new Date().toISOString(),
      }

      // Save to localStorage as backup
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave))

      // Create backup every hour
      this.createPeriodicBackup(dataToSave)
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
      throw new Error('Failed to save data')
    }
  }

  // New Supabase-based methods
  static async syncUserData(userId: string, data: AppState): Promise<void> {
    try {
      // Sync progress data
      if (data.progress.weightHistory.length > 0) {
        for (const entry of data.progress.weightHistory) {
          await ProgressService.addWeightEntry(userId, entry)
        }
      }

      if (data.progress.milestones.length > 0) {
        for (const milestone of data.progress.milestones) {
          await ProgressService.addMilestone(userId, milestone)
        }
      }

      // Sync training data
      if (data.training.workoutHistory.length > 0) {
        for (const session of data.training.workoutHistory) {
          // This would require more complex logic to properly sync workout sessions
          console.log('Syncing workout session:', session.id)
        }
      }

      // Sync nutrition data
      if (data.nutrition.goals) {
        await NutritionService.saveNutritionGoals(userId, data.nutrition.goals)
      }

      if (data.nutrition.dailyEntries.length > 0) {
        for (const entry of data.nutrition.dailyEntries) {
          await NutritionService.addDailyEntry(userId, entry)
        }
      }

    } catch (error) {
      console.error('Error syncing data to Supabase:', error)
      throw new Error('Failed to sync data')
    }
  }

  static async loadUserData(userId: string): Promise<Partial<AppState> | null> {
    try {
      // 🔥 TEMPORAL: Deshabilitar carga automática que causa errores 400
      console.log('⏸️ Carga automática de datos de progreso deshabilitada para evitar errores 400')
      
      // Load progress data (DESHABILITADO TEMPORALMENTE)
      // const [weightHistory, milestones, performanceMetrics, weeklyProgress] = await Promise.all([
      //   ProgressService.getWeightHistory(userId),
      //   ProgressService.getMilestones(userId),
      //   ProgressService.getPerformanceMetrics(userId),
      //   ProgressService.getWeeklyProgress(userId)
      // ])
      
      const weightHistory: any[] = []
      const milestones: any[] = []
      const performanceMetrics: any = null
      const weeklyProgress: any[] = []

      // Load training data (DESHABILITADO TEMPORALMENTE)
      // const workoutHistory = await TrainingService.getWorkoutHistory(userId)
      const workoutHistory: any[] = []

      // Load nutrition data (HABILITADO - upsert arreglado)
      let nutritionGoals = null
      try {
        nutritionGoals = await NutritionService.getNutritionGoals(userId)
      } catch (error) {
        console.warn('⚠️ No se pudieron cargar nutrition goals:', error)
      }
      
      // Deshabilitar dailyEntries por ahora (tabla puede no existir)
      const dailyEntries: any[] = []

      return {
        progress: {
          weightHistory,
          milestones,
          performanceMetrics,
          weeklyProgress,
          measurements: [], // TODO: Load from Supabase
          photos: [], // TODO: Load from Supabase
          stats: null, // Will be calculated from data
          isLoading: false,
          error: null,
        },
        training: {
          currentProgram: null, // TODO: Load current program
          currentSession: null,
          workoutHistory,
          isLoading: false,
          error: null,
        },
        nutrition: {
          goals: nutritionGoals,
          weeklyPlan: null, // TODO: Load current week plan
          dailyEntries,
          currentDay: null,
          isLoading: false,
          error: null,
        }
      }
    } catch (error) {
      console.error('Error loading data from Supabase:', error)
      // Fallback to localStorage
      return this.loadData()
    }
  }

  static async loadData(): Promise<Partial<AppState> | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const data = JSON.parse(stored)
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        console.warn('Invalid stored data format')
        return null
      }

      return data
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
      return null
    }
  }

  static async exportData(): Promise<string> {
    const data = await this.loadData()
    if (!data) throw new Error('No data to export')

    return JSON.stringify(data, null, 2)
  }

  static async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString)
      
      // Basic validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON format')
      }

      // Create backup before importing
      const currentData = await this.loadData()
      if (currentData) {
        this.createManualBackup(currentData, 'pre-import')
      }

      // Import data
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
      
    } catch (error) {
      console.error('Error importing data:', error)
      throw new Error('Failed to import data: Invalid format')
    }
  }

  static async downloadBackup(): Promise<void> {
    try {
      const data = await this.loadData()
      if (!data) throw new Error('No data to backup')

      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fitness-backup-${new Date().toISOString().split('T')[0]}.json`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading backup:', error)
      throw new Error('Failed to download backup')
    }
  }

  static clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    
    // Clear old backups (keep only last 5)
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.BACKUP_PREFIX)
    )
    
    if (keys.length > 5) {
      keys.sort().slice(0, -5).forEach(key => {
        localStorage.removeItem(key)
      })
    }
  }

  private static createPeriodicBackup(data: any): void {
    const now = new Date()
    const lastBackup = localStorage.getItem('last-auto-backup')
    
    // Create backup every hour
    if (!lastBackup || (now.getTime() - parseInt(lastBackup)) > 3600000) {
      this.createManualBackup(data, 'auto')
      localStorage.setItem('last-auto-backup', now.getTime().toString())
    }
  }

  private static createManualBackup(data: any, type: string): void {
    const timestamp = new Date().toISOString()
    const backupKey = `${this.BACKUP_PREFIX}${type}-${timestamp}`
    
    try {
      localStorage.setItem(backupKey, JSON.stringify(data))
    } catch (error) {
      // If storage is full, remove oldest backup and try again
      this.cleanupOldBackups()
      try {
        localStorage.setItem(backupKey, JSON.stringify(data))
      } catch (retryError) {
        console.warn('Unable to create backup: storage full')
      }
    }
  }

  private static cleanupOldBackups(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.BACKUP_PREFIX)
    )
    
    // Remove oldest backups, keep only 3
    keys.sort().slice(0, -3).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  static getBackupList(): Array<{ key: string; date: string; type: string }> {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.BACKUP_PREFIX))
      .map(key => {
        const parts = key.replace(this.BACKUP_PREFIX, '').split('-')
        return {
          key,
          type: parts[0],
          date: parts.slice(1).join('-')
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}