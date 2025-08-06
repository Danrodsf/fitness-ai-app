import { AICoachService, UserContext } from './AICoachService'
import { AppState } from '@/store'

export interface ProgressAnalysisResult {
  id: string
  timestamp: Date
  analysisType: 'weekly' | 'milestone' | 'manual'
  progressStatus: 'excellent' | 'good' | 'stagnant' | 'declining'
  keyFindings: string[]
  concerns: string[]
  achievements: string[]
  recommendations: {
    type: 'workout_adjustment' | 'nutrition_change' | 'rest_modification'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
  }[]
  shouldNotifyUser: boolean
}

export class ProgressAnalysisService {
  private static readonly ANALYSIS_STORAGE_KEY = 'fitness_progress_analysis'
  private static readonly LAST_ANALYSIS_KEY = 'last_progress_analysis'
  
  // Triggers for automatic analysis
  static readonly ANALYSIS_TRIGGERS = {
    WEEKLY: 7 * 24 * 60 * 60 * 1000, // 7 days
    WORKOUT_MILESTONE: 5, // Every 5 completed workouts
    WEIGHT_PLATEAU: 14 * 24 * 60 * 60 * 1000, // 2 weeks without weight change
    STAGNANT_PERFORMANCE: 10 // 10 workouts without progress
  }

  // Schedule automatic analysis
  static scheduleAutomaticAnalysis(state: AppState): boolean {
    if (!this.shouldTriggerAnalysis(state)) {
      return false
    }

    // Trigger analysis in background
    setTimeout(() => {
      this.performAutomaticAnalysis(state)
    }, 1000)

    return true
  }

  private static shouldTriggerAnalysis(state: AppState): boolean {
    const lastAnalysis = this.getLastAnalysisTimestamp()
    const now = Date.now()
    
    // Check weekly trigger
    if (now - lastAnalysis >= this.ANALYSIS_TRIGGERS.WEEKLY) {
      return true
    }

    // Check workout milestone trigger
    const totalWorkouts = state.user.stats.totalWorkouts
    const lastAnalysisWorkouts = this.getLastAnalysisWorkoutCount()
    if (totalWorkouts - lastAnalysisWorkouts >= this.ANALYSIS_TRIGGERS.WORKOUT_MILESTONE) {
      return true
    }

    // Check for weight plateau
    if (this.detectWeightPlateau(state.progress.weightHistory)) {
      return true
    }

    // Check for performance stagnation
    if (this.detectPerformanceStagnation(state.training.workoutHistory)) {
      return true
    }

    return false
  }

  private static async performAutomaticAnalysis(state: AppState) {
    if (!state.user.profile) return

    try {
      const userContext: UserContext = {
        profile: state.user.profile,
        currentTrainingPlan: state.training.currentProgram || undefined,
        currentNutritionPlan: state.nutrition.goals && state.nutrition.weeklyPlan 
          ? { goals: state.nutrition.goals, weeklyPlan: state.nutrition.weeklyPlan }
          : undefined,
        recentProgress: {
          weightHistory: state.progress.weightHistory.slice(-10),
          recentWorkouts: state.training.workoutHistory.slice(-5)
        },
        chatHistory: []
      }

      const response = await AICoachService.analyzeUserProgress(userContext)
      
      if (response.functionName === 'analyze_progress') {
        // Store analysis result
        const analysis: ProgressAnalysisResult = {
          id: `analysis-${Date.now()}`,
          timestamp: new Date(),
          analysisType: 'weekly',
          progressStatus: 'good', // This would come from AI response
          keyFindings: ['Análisis automático completado'],
          concerns: [],
          achievements: [],
          recommendations: [],
          shouldNotifyUser: true
        }

        this.storeAnalysisResult(analysis)
        this.updateLastAnalysisTimestamp(state.user.stats.totalWorkouts)

        // Trigger notification to user
        this.notifyUserOfAnalysis(analysis)
      }
    } catch (error) {
      // Analysis failed silently
    }
  }

  // Manual analysis triggered by user
  static async performManualAnalysis(state: AppState): Promise<ProgressAnalysisResult | null> {
    if (!state.user.profile) return null

    try {
      const userContext: UserContext = {
        profile: state.user.profile,
        currentTrainingPlan: state.training.currentProgram || undefined,
        currentNutritionPlan: state.nutrition.goals && state.nutrition.weeklyPlan 
          ? { goals: state.nutrition.goals, weeklyPlan: state.nutrition.weeklyPlan }
          : undefined,
        recentProgress: {
          weightHistory: state.progress.weightHistory.slice(-10),
          recentWorkouts: state.training.workoutHistory.slice(-5)
        },
        chatHistory: []
      }

      await AICoachService.analyzeUserProgress(userContext)
      
      const analysis: ProgressAnalysisResult = {
        id: `manual-analysis-${Date.now()}`,
        timestamp: new Date(),
        analysisType: 'manual',
        progressStatus: 'good',
        keyFindings: ['Análisis manual solicitado'],
        concerns: [],
        achievements: [],
        recommendations: [],
        shouldNotifyUser: false
      }

      this.storeAnalysisResult(analysis)
      return analysis
    } catch (error) {
      return null
    }
  }

  // Detection methods
  private static detectWeightPlateau(weightHistory: any[]): boolean {
    if (weightHistory.length < 5) return false
    
    const recentWeights = weightHistory.slice(-5).map(entry => entry.weight)
    const variance = this.calculateVariance(recentWeights)
    
    // If variance is very low, might be a plateau
    return variance < 0.5 // 0.5kg variance threshold
  }

  private static detectPerformanceStagnation(workoutHistory: any[]): boolean {
    if (workoutHistory.length < 5) return false
    
    // Simple check: if no improvement in recent workouts
    const recentWorkouts = workoutHistory.slice(-5)
    let hasImprovement = false
    
    recentWorkouts.forEach(workout => {
      // Check if any exercise shows improvement
      workout.exercises?.forEach((exercise: any) => {
        if (exercise.actualSets && exercise.actualSets.length > 0) {
          // Simple improvement check - could be more sophisticated
          const totalVolume = exercise.actualSets.reduce((sum: number, set: any) => 
            sum + (set.reps * set.weight), 0)
          if (totalVolume > 0) hasImprovement = true
        }
      })
    })
    
    return !hasImprovement
  }

  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length
  }

  // Storage methods
  private static getLastAnalysisTimestamp(): number {
    try {
      const stored = localStorage.getItem(this.LAST_ANALYSIS_KEY)
      return stored ? parseInt(stored) : 0
    } catch {
      return 0
    }
  }

  private static getLastAnalysisWorkoutCount(): number {
    try {
      const stored = localStorage.getItem(`${this.LAST_ANALYSIS_KEY}_workouts`)
      return stored ? parseInt(stored) : 0
    } catch {
      return 0
    }
  }

  private static updateLastAnalysisTimestamp(workoutCount: number): void {
    try {
      localStorage.setItem(this.LAST_ANALYSIS_KEY, Date.now().toString())
      localStorage.setItem(`${this.LAST_ANALYSIS_KEY}_workouts`, workoutCount.toString())
    } catch (error) {
      // Failed to store timestamp
    }
  }

  private static storeAnalysisResult(analysis: ProgressAnalysisResult): void {
    try {
      const existing = this.getStoredAnalyses()
      const updated = [analysis, ...existing].slice(0, 10) // Keep last 10 analyses
      localStorage.setItem(this.ANALYSIS_STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      // Failed to store analysis
    }
  }

  static getStoredAnalyses(): ProgressAnalysisResult[] {
    try {
      const stored = localStorage.getItem(this.ANALYSIS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private static notifyUserOfAnalysis(analysis: ProgressAnalysisResult): void {
    // This would trigger a notification in the app
    // Could dispatch a notification action here
    // dispatch({ type: 'NOTIFICATION_ADD', payload: { ... } })
  }

  // Utility methods for components
  static getLatestAnalysis(): ProgressAnalysisResult | null {
    const analyses = this.getStoredAnalyses()
    return analyses.length > 0 ? analyses[0] : null
  }

  static hasRecentAnalysis(): boolean {
    const latest = this.getLatestAnalysis()
    if (!latest) return false
    
    const hoursSinceAnalysis = (Date.now() - new Date(latest.timestamp).getTime()) / (1000 * 60 * 60)
    return hoursSinceAnalysis < 24 // Within last 24 hours
  }

  static getAnalysisInsights(): string[] {
    const analyses = this.getStoredAnalyses().slice(0, 3)
    const insights: string[] = []
    
    analyses.forEach(analysis => {
      insights.push(...analysis.keyFindings)
      insights.push(...analysis.achievements)
    })
    
    return [...new Set(insights)] // Remove duplicates
  }
}