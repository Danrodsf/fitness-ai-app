import { supabase } from '@/domains/auth/services/authService'
import { NutritionGoals, NutritionEntry, WeeklyMealPlan } from '../types'

export class NutritionService {
  // Helper to check if supabase is available
  private static ensureSupabase() {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please configure your Supabase credentials.')
    }
    return supabase
  }

  // Nutrition goals
  static async saveNutritionGoals(userId: string, goals: Omit<NutritionGoals, 'id' | 'createdAt' | 'updatedAt'>) {
    const client = this.ensureSupabase()
    
    // Mapear campos de TypeScript a campos de base de datos
    const dbGoals = {
      user_id: userId,
      daily_calories: goals.dailyCalories,
      daily_protein: goals.dailyProtein,
      daily_carbs: goals.dailyCarbs,
      daily_fats: goals.dailyFats,
      daily_fiber: null, // Campo opcional en BD
      daily_water: null, // Campo opcional en BD
      meal_frequency: 3, // Valor por defecto
      notes: null
    }
    
    
    // 🔥 ESTRATEGIA ALTERNATIVA: Verificar si existe primero
    const { data: existing } = await client
      .from('nutrition_goals')
      .select('id')
      .eq('user_id', userId)
      .single()

    let data, error
    if (existing) {
      // UPDATE si existe
      const result = await client
        .from('nutrition_goals')
        .update(dbGoals)
        .eq('user_id', userId)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // INSERT si no existe
      const result = await client
        .from('nutrition_goals')
        .insert(dbGoals)
        .select()
        .single()
      data = result.data
      error = result.error
    }

    if (error) {
      throw error
    }
    
    return data as NutritionGoals
  }

  static async getNutritionGoals(userId: string): Promise<NutritionGoals | null> {
    const client = this.ensureSupabase()
    const { data, error } = await client
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    
    if (!data) return null
    
    // Mapear campos de base de datos a TypeScript
    return {
      dailyCalories: data.daily_calories,
      dailyProtein: data.daily_protein,
      dailyCarbs: data.daily_carbs,
      dailyFats: data.daily_fats,
      calorieDeficit: data.calorie_deficit
    } as NutritionGoals
  }

  // Daily nutrition entries
  static async addDailyEntry(userId: string, entry: Omit<NutritionEntry, 'id' | 'createdAt' | 'updatedAt'>) {
    const client = this.ensureSupabase()
    const { data, error } = await client
      .from('daily_nutrition_entries')
      .insert({
        user_id: userId,
        ...entry,
      })
      .select()
      .single()

    if (error) throw error
    return data as NutritionEntry
  }

  static async getDailyEntries(userId: string, startDate?: string, endDate?: string): Promise<NutritionEntry[]> {
    const client = this.ensureSupabase()
    let query = client
      .from('daily_nutrition_entries')
      .select('*')
      .eq('user_id', userId)

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate)
    }

    const { data, error } = await query.order('date', { ascending: false })

    if (error) throw error
    return data as NutritionEntry[]
  }

  static async updateDailyEntry(entryId: string, updateData: Partial<NutritionEntry>) {
    const client = this.ensureSupabase()
    const { data, error } = await client
      .from('daily_nutrition_entries')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single()

    if (error) throw error
    return data as NutritionEntry
  }

  static async deleteDailyEntry(entryId: string) {
    const client = this.ensureSupabase()
    const { error } = await client
      .from('daily_nutrition_entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error
  }

  // Weekly meal plans
  static async saveWeeklyMealPlan(userId: string, plan: Omit<WeeklyMealPlan, 'id' | 'createdAt' | 'updatedAt'>) {
    const client = this.ensureSupabase()
    
    // Calcular el inicio de la semana actual
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const weekStart = startOfWeek.toISOString().split('T')[0] // YYYY-MM-DD
    
    const { data, error } = await client
      .from('weekly_meal_plans')
      .upsert({
        user_id: userId,
        week_start: weekStart,
        name: plan.name,
        description: plan.description,
        days: plan.days,
        shopping_list: plan.shoppingList,
        prep_tips: plan.prepTips,
      }, {
        onConflict: 'user_id,week_start',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      throw error
    }
    
    return data
  }

  static async getWeeklyMealPlans(userId: string): Promise<WeeklyMealPlan[]> {
    const client = this.ensureSupabase()
    const { data, error } = await client
      .from('weekly_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      days: item.days,
      shoppingList: item.shopping_list,
      prepTips: item.prep_tips,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) as WeeklyMealPlan[]
  }

  // Obtener el plan de comidas más reciente
  static async getCurrentWeeklyMealPlan(userId: string): Promise<WeeklyMealPlan | null> {
    const client = this.ensureSupabase()
    const { data, error } = await client
      .from('weekly_meal_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    if (!data) return null

    const result = {
      id: data.id,
      name: data.name,
      description: data.description,
      days: data.days,
      shoppingList: data.shopping_list,
      prepTips: data.prep_tips,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as WeeklyMealPlan

    // Solo log si hay problemas con la estructura
    if (!Array.isArray(result.days)) {
    }

    return result
  }

  // Nutrition analytics
  static async getNutritionAnalytics(userId: string, period: 'week' | 'month' | 'year' = 'week') {
    const client = this.ensureSupabase()
    const { data, error } = await client
      .rpc('get_nutrition_analytics', { 
        user_id_param: userId,
        period_param: period 
      })

    if (error) throw error
    return data
  }

  static async getCaloriesTrend(userId: string, days: number = 30) {
    const client = this.ensureSupabase()
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

    const { data, error } = await client
      .from('daily_nutrition_entries')
      .select('date, calories')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return data
  }

  static async getProteinTrend(userId: string, days: number = 30) {
    const client = this.ensureSupabase()
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000))

    const { data, error } = await client
      .from('daily_nutrition_entries')
      .select('date, protein')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (error) throw error
    return data
  }
}