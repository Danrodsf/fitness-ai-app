import { supabase } from '@/domains/auth/services/authService'
import { WorkoutSession, TrainingProgram } from '../types'

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
    console.log('📊 TrainingService.getTrainingStats called for user:', userId)
    
    const client = this.ensureSupabase()
    
    try {
      const { data, error } = await client
        .rpc('get_training_summary', { user_id_param: userId })

      if (error) {
        console.error('❌ TrainingService.getTrainingStats RPC error:', error)
        
        // Fallback: try to get data directly from workout_sessions
        console.log('🔄 Trying fallback method: direct query to workout_sessions')
        const { data: fallbackData, error: fallbackError } = await client
          .from('workout_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('completed', true)
          .order('start_time', { ascending: false })
          .limit(10)
        
        if (fallbackError) {
          console.error('❌ Fallback query also failed:', fallbackError)
          throw fallbackError
        }
        
        console.log('✅ Fallback data retrieved:', fallbackData?.length || 0, 'sessions')
        return fallbackData
      }

      console.log('✅ TrainingService.getTrainingStats success:', data?.length || 0, 'sessions')
      console.log('🔍 TrainingService raw data:', data)
      
      // La función RPC devuelve solo estadísticas agregadas, no sesiones individuales
      // Vamos a usar el fallback para conseguir sesiones reales
      console.log('🔄 Using fallback to get individual sessions instead of aggregated stats')
      const { data: fallbackData, error: fallbackError } = await client
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('start_time', { ascending: false })
      
      if (fallbackError) {
        console.error('❌ Fallback query failed:', fallbackError)
        return data // Return original RPC data if fallback fails
      }
      
      console.log('✅ Fallback found individual sessions:', fallbackData?.length || 0)
      console.log('🔍 Individual sessions data:', fallbackData)
      
      return fallbackData && fallbackData.length > 0 ? fallbackData : data
    } catch (error) {
      console.error('❌ TrainingService.getTrainingStats failed:', error)
      throw error
    }
  }

  // Guardar sesión completa de entrenamiento (OPTIMIZADO CON JSON)
  static async saveCompleteWorkoutSession(userId: string, sessionData: WorkoutSession) {
    const client = this.ensureSupabase()
    
    try {

      // 🔥 NUEVO: Preparar datos en formato JSON optimizado
      const exercisesJson = sessionData.exercises.map(exercise => ({
        exercise_id: exercise.exercise.id,
        exercise_name: exercise.exercise.name,
        planned_sets: exercise.plannedSets || 3,
        planned_reps: exercise.plannedReps || '8-12',
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
        session.session_data.exercises.forEach((exercise: { exercise_id: string, sets?: Array<{ weight?: number, reps: number }> }) => {
          week.exercisesCompleted.add(exercise.exercise_id)
          
          exercise.sets?.forEach((set: { weight?: number, reps: number }) => {
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

      // Si no hay sets en la sesión más reciente, usar búsqueda inteligente
      if (sets.length === 0) {
        return await this.getLastExercisePerformanceManual(userId, exerciseId)
      }

      // Calcular estadísticas con validación para arrays vacíos
      const weights = sets.map((s: any) => s.weight || 0).filter((w: number) => w > 0)
      const maxWeight = weights.length > 0 ? Math.max(...weights) : 0
      const totalReps = sets.reduce((sum: number, s: any) => sum + (s.reps || 0), 0)
      
      // Intentar encontrar mejor historial en sesiones anteriores
      try {
        const manualResult = await this.getLastExercisePerformanceManual(userId, exerciseId)
        if (manualResult && manualResult.maxWeight > maxWeight) {
          return manualResult
        }
      } catch (error) {
        // Continuar con datos actuales si falla la búsqueda manual
      }
      
      // Progresión inteligente: +2.5kg para pesos >20kg, +1kg para <20kg
      const recommendedWeight = maxWeight > 20 ? maxWeight + 2.5 : maxWeight > 0 ? maxWeight + 1 : 0

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

      // Extraer nombre base del ejercicio para búsqueda inteligente
      const baseName = this.extractExerciseBaseName(exerciseId)

      for (const session of sessions || []) {
        if (!session.session_data?.exercises) continue
        
        // Buscar por ID exacto primero, luego por nombre similar
        let exercise = session.session_data.exercises.find((ex: any) => ex.exercise_id === exerciseId)
        
        if (!exercise && baseName) {
          // Búsqueda por nombre similar si no encuentra por ID
          exercise = session.session_data.exercises.find((ex: any) => {
            if (!ex.exercise_id && !ex.exercise_name) return false
            
            const candidateName = this.extractExerciseBaseName(ex.exercise_id || ex.exercise_name || '')
            const similarity = this.calculateExerciseNameSimilarity(baseName, candidateName)
            
            return similarity > 0.7
          })
        }
        
        if (exercise?.sets?.length > 0) {
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

      if (!lastSession) {
        return {
          lastSession: null,
          maxWeight: 0,
          totalReps: 0,
          recommendedWeight: 0
        }
      }

      // Calcular estadísticas con validación para arrays vacíos
      const weights = allSets.map(s => s.weight || 0).filter(w => w > 0)
      const maxWeight = weights.length > 0 ? Math.max(...weights) : 0
      const totalReps = allSets.reduce((sum, s) => sum + (s.reps || 0), 0)
      const recommendedWeight = maxWeight > 20 ? maxWeight + 2.5 : maxWeight > 0 ? maxWeight + 1 : 0


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

  // 🔥 NUEVO: Función para debuggear qué ejercicios existen en la BD
  static async getAvailableExercises(userId: string) {
    try {
      
      const supabaseClient = this.ensureSupabase()
      const { data: sessions, error } = await supabaseClient
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('start_time', { ascending: false })

      if (error) {
        console.error('❌ Error obteniendo sesiones:', error)
        return []
      }

      const exerciseIds = new Set<string>()
      const exerciseNames = new Set<string>()

      sessions?.forEach(session => {
        try {
          const sessionData = session.session_data
          if (sessionData && sessionData.exercises) {
            sessionData.exercises.forEach((ex: any) => {
              if (ex.exercise_id) exerciseIds.add(ex.exercise_id)
              if (ex.exercise?.id) exerciseIds.add(ex.exercise.id)
              if (ex.exercise?.name) {
                exerciseNames.add(ex.exercise.name)
                exerciseIds.add(this.normalizeExerciseName(ex.exercise.name))
              }
            })
          }
        } catch (e) {
          console.warn('⚠️ Error procesando sesión:', e)
        }
      })

      
      return {
        ids: Array.from(exerciseIds),
        names: Array.from(exerciseNames),
        totalSessions: sessions?.length || 0
      }
    } catch (error) {
      console.error('❌ Error obteniendo ejercicios disponibles:', error)
      return { ids: [], names: [], totalSessions: 0 }
    }
  }

  // 🔥 NUEVO: Función para obtener progreso de fuerza por ejercicio
  static async getExerciseProgressChart(userId: string, exerciseId: string, weeksBack: number = 8) {
    if (!userId || !exerciseId) {
      console.warn('❌ getExerciseProgressChart: faltan parámetros')
      return []
    }

    try {
      
      // 1. Obtener todas las sesiones del usuario de las últimas semanas
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - (weeksBack * 7))
      
      const supabaseClient = this.ensureSupabase()
      const { data: sessions, error } = await supabaseClient
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('start_time', cutoffDate.toISOString())
        .order('start_time', { ascending: true })

      if (error) {
        console.error('❌ Error obteniendo sesiones:', error)
        return []
      }

      if (!sessions || sessions.length === 0) {
        return []
      }


      // 2. Extraer datos del ejercicio específico de cada sesión
      const exerciseData: Array<{
        date: string
        maxWeight: number
        totalReps: number
        sets: Array<{ reps: number; weight: number }>
      }> = []

      for (const session of sessions) {
        try {
          const sessionData = session.session_data
          if (!sessionData || !sessionData.exercises) {
            continue
          }


          // Buscar el ejercicio específico en la sesión
          const exerciseInSession = sessionData.exercises.find((ex: any) => 
            ex.exercise_id === exerciseId || 
            ex.exercise?.id === exerciseId ||
            (ex.exercise?.name && this.normalizeExerciseName(ex.exercise.name) === exerciseId)
          )
          
          if (!exerciseInSession) {
            continue
          }

          // Buscar sets en diferentes campos posibles
          let sets = exerciseInSession.actualSets || 
                    exerciseInSession.sets || 
                    exerciseInSession.completedSets || 
                    exerciseInSession.recorded_sets || []

          if (!sets || sets.length === 0) {
            continue
          }


          const weights = sets.map((s: any) => s.weight || 0).filter((w: number) => w > 0)
          const maxWeight = weights.length > 0 ? Math.max(...weights) : 0
          const totalReps = sets.reduce((sum: number, s: any) => sum + (s.reps || 0), 0)

          exerciseData.push({
            date: session.start_time.split('T')[0],
            maxWeight,
            totalReps,
            sets: sets.map((s: any) => ({ reps: s.reps || 0, weight: s.weight || 0 }))
          })

        } catch (sessionError) {
          console.warn('⚠️ Error procesando sesión:', sessionError)
          continue
        }
      }

      if (exerciseData.length === 0) {
        return []
      }


      // 3. Ordenar por fecha y generar datos para gráfico de líneas
      const chartData = exerciseData
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((data, index) => {
          const sessionDate = new Date(data.date)
          const dateLabel = `${sessionDate.getDate()}/${sessionDate.getMonth() + 1}`
          
          // Calcular tendencia comparando con sesión anterior
          let trend = 'stable'
          if (index > 0) {
            const prevWeight = exerciseData[index - 1].maxWeight
            if (data.maxWeight > prevWeight) trend = 'up'
            else if (data.maxWeight < prevWeight) trend = 'down'
          }

          return {
            date: dateLabel,
            fullDate: data.date,
            maxWeight: data.maxWeight,
            totalReps: data.totalReps,
            trend,
            sets: data.sets
          }
        })

      return chartData

    } catch (error) {
      console.error(`❌ Error obteniendo progreso de ${exerciseId}:`, error)
      return []
    }
  }

  // Helper function para normalizar nombres de ejercicios
  static normalizeExerciseName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/--+/g, '-')
  }

  /**
   * Extrae el nombre base de un ejercicio eliminando timestamp y ID único
   * @param exerciseId - ID del ejercicio (ej: "press_de_pecho_en_mquina_1754465778281_ywhy")
   * @returns Nombre base normalizado (ej: "press_de_pecho_en_mquina")
   */
  private static extractExerciseBaseName(exerciseId: string): string {
    return exerciseId
      .toLowerCase()
      .replace(/_\d{13}_[a-z0-9]{4}$/i, '') // Remover timestamp + random ID
      .replace(/[-_]/g, '_') // Normalizar separadores
      .trim()
  }

  /**
   * Calcula la similitud entre dos nombres de ejercicios
   * @param name1 - Primer nombre
   * @param name2 - Segundo nombre
   * @returns Valor de similitud entre 0 y 1
   */
  private static calculateExerciseNameSimilarity(name1: string, name2: string): number {
    if (!name1 || !name2) return 0
    
    const normalize = (str: string) => str.toLowerCase().replace(/[-_]/g, '_')
    const normalized1 = normalize(name1)
    const normalized2 = normalize(name2)
    
    // Coincidencia exacta
    if (normalized1 === normalized2) return 1.0
    
    // Verificar si uno contiene al otro
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2
      const longer = normalized1.length >= normalized2.length ? normalized1 : normalized2
      return shorter.length / longer.length
    }
    
    // Similitud por palabras clave
    const words1 = normalized1.split('_').filter(w => w.length > 2)
    const words2 = normalized2.split('_').filter(w => w.length > 2)
    
    if (words1.length === 0 || words2.length === 0) return 0
    
    let matches = 0
    const totalWords = Math.max(words1.length, words2.length)
    
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
          matches++
          break
        }
      }
    }
    
    return matches / totalWords
  }
}