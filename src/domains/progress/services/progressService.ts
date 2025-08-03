import { supabase } from '@/domains/auth/services/authService'
import { WeightEntry, Measurement, ProgressPhoto, Milestone, PerformanceMetric, WeeklyProgress } from '../types'

export class ProgressService {
  // Weight tracking
  static async addWeightEntry(userId: string, entry: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('weight_entries')
      .insert({
        user_id: userId,
        ...entry,
      })
      .select()
      .single()

    if (error) throw error
    return data as WeightEntry
  }

  static async getWeightHistory(userId: string): Promise<WeightEntry[]> {
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data as WeightEntry[]
  }

  static async updateWeightEntry(entryId: string, updateData: Partial<WeightEntry>) {
    const { data, error } = await supabase
      .from('weight_entries')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single()

    if (error) throw error
    return data as WeightEntry
  }

  static async deleteWeightEntry(entryId: string) {
    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error
  }

  // Measurements
  static async addMeasurement(userId: string, measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('measurements')
      .insert({
        user_id: userId,
        ...measurement,
      })
      .select()
      .single()

    if (error) throw error
    return data as Measurement
  }

  static async getMeasurements(userId: string): Promise<Measurement[]> {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data as Measurement[]
  }

  // Milestones
  static async addMilestone(userId: string, milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .from('milestones')
      .insert({
        user_id: userId,
        ...milestone,
      })
      .select()
      .single()

    if (error) throw error
    return data as Milestone
  }

  static async getMilestones(userId: string): Promise<Milestone[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Milestone[]
  }

  static async updateMilestone(milestoneId: string, updateData: Partial<Milestone>) {
    const { data, error } = await supabase
      .from('milestones')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', milestoneId)
      .select()
      .single()

    if (error) throw error
    return data as Milestone
  }

  static async completeMilestone(milestoneId: string) {
    return this.updateMilestone(milestoneId, {
      completed: true,
      completedDate: new Date().toISOString(),
    })
  }

  // Performance metrics
  static async savePerformanceMetric(userId: string, metric: Omit<PerformanceMetric, 'id'>) {
    const { data, error } = await supabase
      .from('performance_metrics')
      .upsert({
        user_id: userId,
        exercise_name: metric.exerciseName,
        metric: metric.metric,
        values: metric.values,
        improvement: metric.improvement,
        improvement_percentage: metric.improvementPercentage,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getPerformanceMetrics(userId: string): Promise<PerformanceMetric[]> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error
    return data?.map(item => ({
      exerciseName: item.exercise_name,
      metric: item.metric,
      values: item.values,
      improvement: item.improvement,
      improvementPercentage: item.improvement_percentage,
    })) as PerformanceMetric[]
  }

  // Weekly progress
  static async saveWeeklyProgress(userId: string, progress: Omit<WeeklyProgress, 'id'>) {
    const { data, error } = await supabase
      .from('weekly_progress')
      .upsert({
        user_id: userId,
        week_start: progress.weekStart,
        week_end: progress.weekEnd,
        average_weight: progress.averageWeight,
        total_workouts: progress.totalWorkouts,
        total_volume: progress.totalVolume,
        calories_consumed: progress.caloriesConsumed,
        protein_consumed: progress.proteinConsumed,
        notes: progress.notes,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getWeeklyProgress(userId: string): Promise<WeeklyProgress[]> {
    const { data, error } = await supabase
      .from('weekly_progress')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      weekStart: item.week_start,
      weekEnd: item.week_end,
      averageWeight: item.average_weight,
      totalWorkouts: item.total_workouts,
      totalVolume: item.total_volume,
      caloriesConsumed: item.calories_consumed,
      proteinConsumed: item.protein_consumed,
      notes: item.notes,
    })) as WeeklyProgress[]
  }
}