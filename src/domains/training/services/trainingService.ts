import { supabase } from '@/domains/auth/services/authService'
import { WorkoutSession, TrainingProgram, Exercise, ExerciseSet, WorkoutExercise } from '../types'

export class TrainingService {
  // Helper para verificar Supabase
  private static ensureSupabase() {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    return supabase
  }

  // Guardar programa de entrenamiento generado por IA (CORREGIDO)
  static async saveTrainingProgram(userId: string, program: TrainingProgram) {
    const client = this.ensureSupabase()
    
    try {
      // Primero obtener las preferencias existentes
      const { data: currentProfile, error: fetchError } = await client
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', userId)
        .single()
      
      if (fetchError) {
        console.warn('⚠️ Error obteniendo perfil actual:', fetchError)
        return
      }

      // Mantener preferencias existentes y solo actualizar el plan de entrenamiento
      const updatedPreferences = {
        ...currentProfile?.preferences,
        aiPlans: {
          ...currentProfile?.preferences?.aiPlans,
          trainingPlan: program, // 🔥 CORREGIDO: usar trainingPlan, no trainingProgram
          lastUpdated: new Date().toISOString()
        }
      }
      
      const { error: updateError } = await client
        .from('user_profiles')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (updateError) {
        console.warn('⚠️ Error actualizando perfil:', updateError)
        return
      }
      
      console.log('✅ Programa de entrenamiento guardado en perfil de usuario')
    } catch (error) {
      console.warn('⚠️ Error guardando programa de entrenamiento:', error)
      // No fallar, solo log el error
    }
  }

  // Cargar programa de entrenamiento del usuario
  static async getTrainingProgram(userId: string): Promise<TrainingProgram | null> {
    const client = this.ensureSupabase()
    
    try {
      const { data, error } = await client
        .from('user_profiles')
        .select('preferences')
        .eq('user_id', userId)
        .single()
      
      if (error || !data?.preferences?.aiPlans?.trainingPlan) {
        console.log('📊 No hay programa de entrenamiento guardado')
        return null
      }
      
      return data.preferences.aiPlans.trainingPlan
    } catch (error) {
      console.error('❌ Error cargando programa de entrenamiento:', error)
      return null
    }
  }

  // Training statistics
  static async getTrainingStats(userId: string) {
    const client = this.ensureSupabase()
    const { data, error } = await client
      .rpc('get_training_summary', { user_id_param: userId })

    if (error) throw error
    return data
  }

  // Guardar sesión completa de entrenamiento (OPTIMIZADO CON JSON)
  static async saveCompleteWorkoutSession(userId: string, sessionData: WorkoutSession) {
    const client = this.ensureSupabase()
    
    try {
      console.log('💾 Guardando sesión completa en BD (OPTIMIZADO):', {
        userId,
        sessionId: sessionData.id,
        exercises: sessionData.exercises.length,
        totalSets: sessionData.exercises.reduce((total, ex) => total + ex.actualSets.length, 0)
      })

      // 🔥 NUEVO: Preparar datos en formato JSON optimizado
      const exercisesJson = sessionData.exercises.map(exercise => ({
        exercise_id: exercise.exercise.id,
        exercise_name: exercise.exercise.name,
        planned_sets: exercise.plannedSets || exercise.sets || 3,
        planned_reps: exercise.plannedReps || exercise.reps || '8-12',
        completed: exercise.completed || false,
        sets: exercise.actualSets.map(set => ({
          reps: set.reps,
          weight: set.weight || 0,
          rest_time: set.restTime || 90,
          completed: set.completed || true,
          notes: set.notes || null,
          duration: set.duration || null
        }))
      }))

      const totalSets = sessionData.exercises.reduce((total, ex) => total + ex.actualSets.length, 0)
      const totalVolume = sessionData.exercises.reduce((total, ex) => 
        total + ex.actualSets.reduce((exTotal, set) => exTotal + (set.weight || 0) * set.reps, 0), 0
      )

      const sessionJsonData = {
        exercises: exercisesJson,
        notes: sessionData.notes || null,
        metrics: {
          total_exercises: sessionData.exercises.length,
          total_sets: totalSets,
          total_volume: totalVolume,
          avg_rest_time: 90
        }
      }

      console.log('📊 Datos JSON preparados:', {
        exercises: exercisesJson.length,
        totalSets,
        totalVolume
      })

      // 1. Crear la sesión principal con datos JSON
      const { data: workoutSession, error: sessionError } = await client
        .from('workout_sessions')
        .insert({
          user_id: userId,
          workout_day_id: sessionData.workoutDayId,
          start_time: sessionData.startTime,
          end_time: sessionData.endTime || new Date().toISOString(),
          completed: true,
          total_volume: totalVolume,
          actual_duration: sessionData.actualDuration || 0,
          notes: sessionData.notes || null,
          session_data: sessionJsonData, // 🔥 NUEVO: Guardar todo en JSON
          created_at: sessionData.createdAt,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (sessionError) {
        console.error('❌ Error creando workout_session optimizado:', sessionError)
        console.error('🔥 El schema optimizado requiere session_data. Asegúrate de usar schema_nuevo_optimizado.sql')
        throw sessionError
      }

      console.log('✅ Workout session optimizada creada:', workoutSession.id)
      console.log('📊 JSON guardado correctamente con', exercisesJson.length, 'ejercicios')

      return {
        success: true,
        sessionId: workoutSession.id,
        totalSets,
        totalVolume,
        method: 'optimized_json'
      }

    } catch (error) {
      console.error('❌ Error guardando sesión optimizada:', error)
      throw error
    }
  }

  // 🔥 NUEVO: Obtener progreso semanal para Progress Dashboard - Basado en JSON optimizado
  static async getWeeklyProgressSummary(userId: string) {
    const client = this.ensureSupabase()
    const { data, error } = await client
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('start_time', { ascending: true })

    if (error) throw error

    // Agrupar por semana usando fechas
    const weeklyStats = new Map<string, {
      weekNumber: number
      totalSets: number
      totalVolume: number
      maxWeightLifted: number
      exercisesCompleted: Set<string>
      averageReps: number
    }>()

    data?.forEach(session => {
      const date = new Date(session.start_time)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Lunes de esa semana
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!weeklyStats.has(weekKey)) {
        weeklyStats.set(weekKey, {
          weekNumber: weeklyStats.size + 1,
          totalSets: 0,
          totalVolume: 0,
          maxWeightLifted: 0,
          exercisesCompleted: new Set(),
          averageReps: 0
        })
      }

      const week = weeklyStats.get(weekKey)!
      
      // Procesar datos del JSON de la sesión
      if (session.session_data?.exercises) {
        session.session_data.exercises.forEach((exercise: any) => {
          week.exercisesCompleted.add(exercise.exercise_id)
          
          exercise.sets?.forEach((set: any) => {
            week.totalSets += 1
            week.totalVolume += (set.weight || 0) * set.reps
            week.maxWeightLifted = Math.max(week.maxWeightLifted, set.weight || 0)
          })
        })
      }
    })

    // Convertir a array y calcular promedios
    return Array.from(weeklyStats.values()).map(week => ({
      ...week,
      exercisesCount: week.exercisesCompleted.size,
      exercisesCompleted: undefined // Remover Set para serialización
    }))
  }

  // 🔥 NUEVO: Obtener último rendimiento de ejercicio desde JSON optimizado
  static async getLastExercisePerformance(userId: string, exerciseId: string) {
    const client = this.ensureSupabase()
    
    console.log(`🔍 Buscando historial para ejercicio: ${exerciseId} (user: ${userId})`)
    
    try {
      // 🔥 NUEVO: Usar función SQL optimizada para JSON
      const { data: jsonData, error: jsonError } = await client
        .rpc('get_last_exercise_performance', {
          user_id_param: userId,
          exercise_id_param: exerciseId
        })

      if (jsonError) {
        console.warn('⚠️ Función optimizada no disponible:', jsonError)
        // Intentar método manual con JSON
        return await this.getLastExercisePerformanceManual(userId, exerciseId)
      }

      if (!jsonData || jsonData.length === 0) {
        console.log('📊 No hay historial previo para este ejercicio (JSON)')
        return {
          lastSession: null,
          maxWeight: 0,
          totalReps: 0,
          recommendedWeight: 0
        }
      }

      const lastSession = jsonData[0]
      const exerciseData = lastSession.exercise_data
      const sets = exerciseData.sets || []

      console.log('📊 Historial encontrado:', {
        fecha: lastSession.session_date,
        sets: sets.length,
        ejercicio: exerciseData.exercise_name
      })

      // Calcular estadísticas
      const maxWeight = Math.max(...sets.map((s: any) => s.weight || 0))
      const totalReps = sets.reduce((sum: number, s: any) => sum + s.reps, 0)
      const avgWeight = sets.length > 0 ? sets.reduce((sum: number, s: any) => sum + (s.weight || 0), 0) / sets.length : 0
      
      // Progresión inteligente: +2.5kg para pesos >20kg, +1kg para <20kg
      const recommendedWeight = maxWeight > 20 ? maxWeight + 2.5 : maxWeight + 1

      return {
        lastSession: {
          date: lastSession.session_date,
          sets: sets.map((s: any) => ({
            reps: s.reps,
            weight: s.weight || 0,
            notes: s.notes || null
          }))
        },
        maxWeight,
        totalReps,
        recommendedWeight: Math.max(recommendedWeight, maxWeight) // No retroceder en peso
      }

    } catch (error) {
      console.error('❌ Error obteniendo historial del ejercicio:', error)
      return {
        lastSession: null,
        maxWeight: 0,
        totalReps: 0,
        recommendedWeight: 0
      }
    }
  }

  // 🔥 MÉTODO MANUAL: Buscar historial directamente en JSON cuando la función SQL no existe
  private static async getLastExercisePerformanceManual(userId: string, exerciseId: string) {
    const client = this.ensureSupabase()
    
    console.log(`🔍 Búsqueda manual de historial para: ${exerciseId}`)
    
    try {
      const { data: sessions, error } = await client
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('start_time', { ascending: false })

      if (error) throw error

      // Buscar la última sesión que contenga este ejercicio
      let lastSession = null
      let allSets: any[] = []

      for (const session of sessions || []) {
        if (session.session_data?.exercises) {
          const exercise = session.session_data.exercises.find((ex: any) => ex.exercise_id === exerciseId)
          if (exercise && exercise.sets && exercise.sets.length > 0) {
            if (!lastSession) {
              lastSession = {
                date: session.start_time.split('T')[0],
                sets: exercise.sets.map((s: any) => ({
                  reps: s.reps,
                  weight: s.weight || 0,
                  notes: s.notes || null
                }))
              }
            }
            
            // Acumular todos los sets para estadísticas generales
            allSets.push(...exercise.sets)
          }
        }
      }

      if (!lastSession) {
        console.log('📊 No hay historial previo para este ejercicio (manual)')
        return {
          lastSession: null,
          maxWeight: 0,
          totalReps: 0,
          recommendedWeight: 0
        }
      }

      // Calcular estadísticas
      const maxWeight = Math.max(...allSets.map(s => s.weight || 0))
      const totalReps = allSets.reduce((sum, s) => sum + s.reps, 0)
      const recommendedWeight = maxWeight > 20 ? maxWeight + 2.5 : maxWeight + 1

      console.log('📊 Historial encontrado (manual):', {
        fecha: lastSession.date,
        sets: lastSession.sets.length,
        maxWeight,
        totalReps
      })

      return {
        lastSession,
        maxWeight,
        totalReps,
        recommendedWeight: Math.max(recommendedWeight, maxWeight)
      }

    } catch (error) {
      console.error('❌ Error en búsqueda manual:', error)
      return {
        lastSession: null,
        maxWeight: 0,
        totalReps: 0,
        recommendedWeight: 0
      }
    }
  }
}