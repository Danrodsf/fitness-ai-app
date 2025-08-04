import { supabase } from '@/domains/auth/services/authService'
import { WeightEntry, Measurement, ProgressPhoto, Milestone, PerformanceMetric, WeeklyProgress } from '../types'

export class ProgressService {
  // Helper para mapear de snake_case a camelCase
  private static mapWeightEntryFromDB(dbEntry: any): WeightEntry {
    return {
      id: dbEntry.id,
      weight: dbEntry.weight,
      date: dbEntry.date,
      notes: dbEntry.notes,
      bodyFat: dbEntry.body_fat,
      muscleMass: dbEntry.muscle_mass,
      createdAt: dbEntry.created_at,
      updatedAt: dbEntry.updated_at
    }
  }

  // Helper para mapear de camelCase a snake_case  
  private static mapWeightEntryToDB(entry: Partial<WeightEntry>): any {
    const mapped: any = {}
    if (entry.weight !== undefined) mapped.weight = entry.weight
    if (entry.date !== undefined) mapped.date = entry.date
    if (entry.notes !== undefined) mapped.notes = entry.notes
    if (entry.bodyFat !== undefined) mapped.body_fat = entry.bodyFat
    if (entry.muscleMass !== undefined) mapped.muscle_mass = entry.muscleMass
    return mapped
  }

  // Helper para mapear milestones de snake_case a camelCase
  private static mapMilestoneFromDB(dbMilestone: any): Milestone {
    return {
      id: dbMilestone.id,
      title: dbMilestone.title,
      description: dbMilestone.description,
      targetDate: dbMilestone.target_date,
      completedDate: dbMilestone.completed_date,
      category: dbMilestone.category,
      targetValue: dbMilestone.target_value,
      currentValue: dbMilestone.current_value,
      unit: dbMilestone.unit,
      completed: dbMilestone.completed,
      createdAt: dbMilestone.created_at,
      updatedAt: dbMilestone.updated_at
    }
  }

  // Helper para mapear milestones de camelCase a snake_case
  private static mapMilestoneToDB(milestone: Partial<Milestone>): any {
    const mapped: any = {}
    if (milestone.title !== undefined) mapped.title = milestone.title
    if (milestone.description !== undefined) mapped.description = milestone.description
    if (milestone.targetDate !== undefined) mapped.target_date = milestone.targetDate
    if (milestone.completedDate !== undefined) mapped.completed_date = milestone.completedDate
    if (milestone.category !== undefined) mapped.category = milestone.category
    if (milestone.targetValue !== undefined) mapped.target_value = milestone.targetValue
    if (milestone.currentValue !== undefined) mapped.current_value = milestone.currentValue
    if (milestone.unit !== undefined) mapped.unit = milestone.unit
    if (milestone.completed !== undefined) mapped.completed = milestone.completed
    return mapped
  }

  // Weight tracking
  static async addWeightEntry(userId: string, entry: Omit<WeightEntry, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!supabase) throw new Error('Supabase client no configurado')
    
    const mappedEntry = this.mapWeightEntryToDB(entry)
    
    const { data, error } = await supabase
      .from('weight_entries')
      .insert({
        user_id: userId,
        ...mappedEntry,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapWeightEntryFromDB(data)
  }

  static async getWeightHistory(userId: string): Promise<WeightEntry[]> {
    if (!supabase) throw new Error('Supabase client no configurado')
    
    const { data, error } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data?.map(entry => this.mapWeightEntryFromDB(entry)) || []
  }

  static async updateWeightEntry(entryId: string, updateData: Partial<WeightEntry>) {
    if (!supabase) throw new Error('Supabase client no configurado')
    
    const mappedUpdate = this.mapWeightEntryToDB(updateData)
    
    const { data, error } = await supabase
      .from('weight_entries')
      .update({
        ...mappedUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single()

    if (error) throw error
    return this.mapWeightEntryFromDB(data)
  }

  static async deleteWeightEntry(entryId: string) {
    if (!supabase) throw new Error('Supabase client no configurado')
    
    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error
  }

  // Measurements
  static async addMeasurement(userId: string, measurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!supabase) throw new Error('Supabase client no configurado')
    
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
    if (!supabase) throw new Error('Supabase client no configurado')
    
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
    if (!supabase) throw new Error('Supabase client no configurado')
    
    const mappedMilestone = this.mapMilestoneToDB(milestone)
    
    const { data, error } = await supabase
      .from('milestones')
      .insert({
        user_id: userId,
        ...mappedMilestone,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapMilestoneFromDB(data)
  }

  static async getMilestones(userId: string): Promise<Milestone[]> {
    if (!supabase) throw new Error('Supabase client no configurado')
    
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(milestone => this.mapMilestoneFromDB(milestone)) || []
  }

  static async updateMilestone(milestoneId: string, updateData: Partial<Milestone>) {
    if (!supabase) throw new Error('Supabase client no configurado')
    
    const mappedUpdate = this.mapMilestoneToDB(updateData)
    
    const { data, error } = await supabase
      .from('milestones')
      .update({
        ...mappedUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', milestoneId)
      .select()
      .single()

    if (error) throw error
    return this.mapMilestoneFromDB(data)
  }

  static async completeMilestone(milestoneId: string) {
    return this.updateMilestone(milestoneId, {
      completed: true,
      completedDate: new Date().toISOString(),
    })
  }

  // Performance metrics
  static async savePerformanceMetric(userId: string, metric: Omit<PerformanceMetric, 'id'>) {
    if (!supabase) throw new Error('Supabase client no configurado')
    
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
    if (!supabase) throw new Error('Supabase client no configurado')
    
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
    if (!supabase) throw new Error('Supabase client no configurado')
    
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
    if (!supabase) throw new Error('Supabase client no configurado')
    
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