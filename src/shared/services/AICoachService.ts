import { TrainingProgram } from '@/domains/training/types'
import { NutritionGoals, WeeklyMealPlan } from '@/domains/nutrition/types'
import { UserProfile } from '@/domains/user/types'

// Types for AI Coach
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    functionCall?: string
    proposal?: ProposedChange
  }
}

export interface ProposedChange {
  id: string
  type: 'exercise_replacement' | 'workout_modification' | 'nutrition_adjustment' | 'progress_analysis'
  title: string
  description: string
  preview: any
  changes: any
  reasoning: string
  timestamp: Date
  priority: 'high' | 'medium' | 'low'
}

export interface UserContext {
  profile: UserProfile
  currentTrainingPlan?: TrainingProgram
  currentNutritionPlan?: { goals: NutritionGoals; weeklyPlan: WeeklyMealPlan }
  recentProgress?: any
  chatHistory: ChatMessage[]
}

export interface OptimizedContext {
  userBasics: {
    goals: string[]
    experience: string
    restrictions: string[]
  }
  currentPlanSummary: {
    workout: string
    nutrition: string
  }
  chatHistory: ChatMessage[]
  recentProgress: string
  progressDetails?: string
}

interface AICoachResponse {
  message: string
  functionName?: string
  proposal?: ProposedChange
  hasProposal: boolean
}

// AI Function Definitions para OpenAI
const aiCoachFunctions = [
  {
    name: "propose_changes",
    description: "Proponer cambios al plan de entrenamiento o nutrición del usuario",
    parameters: {
      type: "object",
      properties: {
        message: { 
          type: "string", 
          description: "Respuesta conversacional amigable para el usuario explicando la propuesta" 
        },
        changeType: { 
          type: "string", 
          enum: ["exercise_replacement", "workout_modification", "nutrition_adjustment", "progress_analysis"],
          description: "Tipo de cambio propuesto"
        },
        priority: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "Prioridad del cambio propuesto"
        },
        proposal: {
          type: "object",
          properties: {
            title: { 
              type: "string",
              description: "Título conciso del cambio propuesto"
            },
            description: { 
              type: "string",
              description: "Descripción detallada de lo que va a cambiar"
            },
            reasoning: { 
              type: "string",
              description: "Explicación profesional de por qué este cambio beneficia al usuario"
            },
            changes: { 
              type: "object",
              description: "Datos específicos del cambio a aplicar. Para exercise_replacement debe incluir: exerciseId (string) y newExercise (objeto con name, description, sets, reps). Para nutrition_adjustment debe incluir goals o weeklyPlan.",
              properties: {
                exerciseId: {
                  type: "string",
                  description: "ID del ejercicio a reemplazar (solo para exercise_replacement)"
                },
                newExercise: {
                  type: "object",
                  description: "Nuevo ejercicio con propiedades name, description, sets, reps (solo para exercise_replacement)",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    sets: { type: "number" },
                    reps: { type: "number" },
                    videoUrl: { type: "string" },
                    tips: { type: "array", items: { type: "string" } }
                  }
                },
                goals: {
                  type: "object",
                  description: "Objetivos nutricionales actualizados (solo para nutrition_adjustment)"
                },
                weeklyPlan: {
                  type: "object", 
                  description: "Plan semanal actualizado (solo para nutrition_adjustment)"
                }
              }
            }
          },
          required: ["title", "description", "reasoning", "changes"]
        }
      },
      required: ["message", "changeType", "priority", "proposal"]
    }
  },
  {
    name: "chat_only",
    description: "Solo conversación sin proponer cambios específicos a los planes",
    parameters: {
      type: "object", 
      properties: {
        message: { 
          type: "string",
          description: "Respuesta conversacional como entrenador personal experto"
        }
      },
      required: ["message"]
    }
  },
  {
    name: "analyze_progress",
    description: "Analizar el progreso del usuario y dar recomendaciones personalizadas",
    parameters: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Mensaje conversacional sobre el análisis"
        },
        analysis: {
          type: "object",
          properties: {
            progressStatus: { 
              type: "string", 
              enum: ["excellent", "good", "stagnant", "declining"],
              description: "Estado general del progreso"
            },
            keyFindings: { 
              type: "array", 
              items: { type: "string" },
              description: "Hallazgos importantes sobre el progreso"
            },
            concerns: { 
              type: "array", 
              items: { type: "string" },
              description: "Preocupaciones o áreas de mejora"
            },
            achievements: { 
              type: "array", 
              items: { type: "string" },
              description: "Logros y aspectos positivos"
            }
          },
          required: ["progressStatus", "keyFindings", "achievements"]
        },
        recommendations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { 
                type: "string", 
                enum: ["workout_adjustment", "nutrition_change", "rest_modification"],
                description: "Tipo de recomendación"
              },
              priority: { 
                type: "string", 
                enum: ["high", "medium", "low"],
                description: "Prioridad de la recomendación"
              },
              title: { type: "string" },
              description: { type: "string" }
            },
            required: ["type", "priority", "title", "description"]
          }
        }
      },
      required: ["message", "analysis", "recommendations"]
    }
  }
]

// Context Management for Cost Optimization
class ContextManager {
  private static readonly MAX_HISTORY_MESSAGES = 8

  static buildOptimizedContext(userContext: UserContext): OptimizedContext {
    // Safe access to profile data with fallbacks
    const profile = userContext.profile || {}
    
    return {
      userBasics: {
        goals: profile.goals || ['general_health'],
        experience: 'beginner',
        restrictions: []
      },
      currentPlanSummary: {
        workout: this.summarizeWorkoutPlan(userContext.currentTrainingPlan),
        nutrition: this.summarizeNutritionPlan(userContext.currentNutritionPlan)
      },
      chatHistory: this.compressHistoryIntelligently(userContext.chatHistory),
      recentProgress: this.summarizeProgress(userContext.recentProgress),
      progressDetails: this.buildDetailedProgressSummary(userContext.recentProgress)
    }
  }

  private static summarizeWorkoutPlan(plan?: TrainingProgram): string {
    if (!plan || !plan.workoutDays) return 'Sin plan de entrenamiento'
    
    // 🔥 NUEVO: Información detallada de cada día con ejercicios específicos
    const detailedDays = plan.workoutDays.map(day => {
      const exerciseDetails = (day.exercises || []).map(ex => {
        const muscles = ex.exercise.targetMuscles?.join(', ') || 'No especificado'
        return `  • ${ex.exercise.name} (ID: ${ex.exercise.id}) - Músculos: ${muscles}`
      }).join('\n')
      
      return `📅 ${day.name.toUpperCase()} (${day.day}):
${exerciseDetails || '  Sin ejercicios'}`
    }).join('\n\n')
    
    // Lista completa de ejercicios disponibles para referencia
    const allExercises = plan.workoutDays.flatMap(day => 
      (day.exercises || []).map(ex => `${ex.exercise.name} (ID: ${ex.exercise.id})`)
    )
    
    return `PLAN DE ENTRENAMIENTO: ${plan.name}

${detailedDays}

🏋️ EJERCICIOS DISPONIBLES (${allExercises.length} total): ${allExercises.join(', ')}`
  }

  private static summarizeNutritionPlan(plan?: { goals: NutritionGoals; weeklyPlan: WeeklyMealPlan }): string {
    if (!plan) return 'Sin plan nutricional'
    
    let summary = `Calorías: ${plan.goals.dailyCalories}kcal, Proteína: ${plan.goals.dailyProtein}g, Carbohidratos: ${plan.goals.dailyCarbs}g, Grasas: ${plan.goals.dailyFats}g`
    
    if (plan.weeklyPlan && plan.weeklyPlan.days) {
      const dayCount = Object.keys(plan.weeklyPlan.days).length
      summary += `. Plan semanal: ${dayCount} días configurados`
    }
    
    return summary
  }

  private static compressHistoryIntelligently(history: ChatMessage[]): ChatMessage[] {
    if (history.length <= this.MAX_HISTORY_MESSAGES) {
      return history
    }

    // Mantener últimos 5 mensajes + resumen de anteriores
    const recent = history.slice(-5)
    const older = history.slice(0, -5)
    
    const summary = this.createConversationSummary(older)
    
    return [
      { 
        id: 'summary',
        role: 'system', 
        content: `Resumen conversación anterior: ${summary}`,
        timestamp: new Date()
      },
      ...recent
    ]
  }

  private static createConversationSummary(messages: ChatMessage[]): string {
    if (messages.length === 0) return 'Sin historial previo'
    
    const topics = messages
      .filter(m => m.role === 'user')
      .map(m => m.content.substring(0, 50))
      .slice(-3)
    
    return `Temas recientes: ${topics.join(', ')}`
  }

  private static summarizeProgress(progress?: any): string {
    if (!progress) return 'Sin datos de progreso recientes'
    
    return 'Progreso disponible para análisis'
  }

  private static buildDetailedProgressSummary(progress?: any): string {
    if (!progress) return 'No hay datos de progreso específicos disponibles'
    
    let summary = []
    
    const hasRealData = (progress.weightHistory && progress.weightHistory.length > 0) ||
                       (progress.recentWorkouts && progress.recentWorkouts.length > 0) ||
                       (progress.milestones && progress.milestones.length > 0) ||
                       (progress.stats && Object.keys(progress.stats).length > 0)
    
    if (!hasRealData) {
      return 'Sin datos de progreso específicos registrados aún'
    }
    
    if (progress.weightHistory && progress.weightHistory.length > 0) {
      const allWeights = progress.weightHistory
      
      const sortedWeights = [...allWeights].sort((a, b) => {
        const dateA = new Date(a.date || a.timestamp || a.createdAt)
        const dateB = new Date(b.date || b.timestamp || b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      
      const initialWeight = sortedWeights[sortedWeights.length - 1]
      const recentWeights = sortedWeights.slice(0, 5)
      
      const initialDate = initialWeight.date || initialWeight.timestamp || initialWeight.createdAt || 'Inicio'
      const initialValue = initialWeight.weight || initialWeight.value || 'N/A'
      summary.push(`PESO INICIAL: ${initialDate}: ${initialValue}kg`)
      
      const recentSummary = recentWeights.map((entry: any) => {
        const date = entry.date || entry.timestamp || entry.createdAt || 'Fecha desconocida'
        const weight = entry.weight || entry.value || 'N/A'
        return `${date}: ${weight}kg`
      }).join(', ')
      
      summary.push(`PESOS RECIENTES: ${recentSummary}`)
      summary.push(`TOTAL REGISTROS: ${allWeights.length} mediciones`)
    }
    
    if (progress.recentWorkouts && progress.recentWorkouts.length > 0) {
      const allWorkouts = progress.recentWorkouts
      
      const sortedWorkouts = [...allWorkouts].sort((a, b) => {
        const dateA = new Date(a.date || a.start_time || a.timestamp || a.createdAt)
        const dateB = new Date(b.date || b.start_time || a.timestamp || b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      
      const recentWorkouts = sortedWorkouts.slice(0, 3)
      summary.push(`ENTRENAMIENTOS (${allWorkouts.length} totales):`)
      
      recentWorkouts.forEach((workout: any, index: number) => {
        const date = workout.date || workout.start_time?.split('T')[0] || workout.timestamp || workout.createdAt || `Sesión ${index + 1}`
        const completed = workout.completed ? 'COMPLETADO' : 'INCOMPLETO'
        
        summary.push(`\nSESIÓN ${index + 1} (${date}) - ${completed}`)
        
        let exercises = []
        if (workout.session_data?.exercises) {
          exercises = workout.session_data.exercises
        } else if (workout.exercises) {
          exercises = workout.exercises
        }
        
        if (exercises?.length > 0) {
          const exercisesWithData = exercises.filter((exercise: any) => {
            const sets = exercise.sets || exercise.actualSets || []
            return sets?.length > 0 && sets.some((set: any) => (set.weight || 0) > 0)
          })
          
          if (exercisesWithData.length > 0) {
            summary.push(`   ${exercisesWithData.length} ejercicios con datos`)
            
            exercisesWithData.forEach((exercise: any) => {
              const exerciseName = exercise.exercise_name || exercise.exercise?.name || 'Ejercicio'
              const sets = exercise.sets || exercise.actualSets || []
              
              const weightsUsed = sets.map((set: any) => set.weight || 0).filter((w: number) => w > 0)
              const maxWeight = Math.max(...weightsUsed)
              
              const setDetails = sets.map((set: any) => {
                const weight = set.weight || 0
                const reps = set.reps || 0
                return weight > 0 ? `${weight}kg x ${reps}` : `${reps} reps`
              }).join(', ')
              
              summary.push(`   • ${exerciseName}: ${setDetails} (Max: ${maxWeight}kg)`)
            })
          } else {
            summary.push(`   Sin pesos registrados`)
          }
        } else {
          summary.push(`   Sin ejercicios registrados`)
        }
      })
      
      if (allWorkouts.length > 3) {
        summary.push(`\n... y ${allWorkouts.length - 3} entrenamientos anteriores más`)
      }
      
      if (recentWorkouts.length >= 2) {
        summary.push(`\nPROGRESIÓN EJERCICIOS:`)
        
        const exerciseProgression = new Map()
        
        recentWorkouts.forEach((workout: any, sessionIndex: number) => {
          const exercises = workout.session_data?.exercises || workout.exercises || []
          
          exercises.forEach((exercise: any) => {
            const exerciseName = exercise.exercise_name || exercise.exercise?.name
            if (!exerciseName) return
            
            const sets = exercise.sets || exercise.actualSets || []
            const weightsUsed = sets.map((set: any) => set.weight || 0).filter((w: number) => w > 0)
            
            if (weightsUsed.length > 0) {
              const maxWeight = Math.max(...weightsUsed)
              
              if (!exerciseProgression.has(exerciseName)) {
                exerciseProgression.set(exerciseName, [])
              }
              
              exerciseProgression.get(exerciseName).push({
                session: sessionIndex + 1,
                maxWeight
              })
            }
          })
        })
        
        let hasProgression = false
        exerciseProgression.forEach((sessions: any[], exerciseName: string) => {
          if (sessions.length >= 2) {
            hasProgression = true
            sessions.sort((a, b) => b.session - a.session)
            
            const latest = sessions[0]
            const previous = sessions[1]
            
            const change = latest.maxWeight - previous.maxWeight
            const icon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️'
            const changeText = change > 0 ? `+${change}kg` : change < 0 ? `${change}kg` : 'igual'
            
            summary.push(`   ${icon} ${exerciseName}: ${previous.maxWeight}kg → ${latest.maxWeight}kg (${changeText})`)
          }
        })
        
        if (!hasProgression) {
          summary.push(`   Sin ejercicios para comparar`)
        }
      }
    } else {
      summary.push('ENTRENAMIENTOS: Sin sesiones registradas')
    }
    
    if (progress.stats) {
      const stats = progress.stats
      const statsItems = []
      
      if (stats.totalWorkouts) statsItems.push(`${stats.totalWorkouts} entrenamientos`)
      if (stats.currentStreak) statsItems.push(`${stats.currentStreak} días racha`)
      if (stats.totalVolume) statsItems.push(`${stats.totalVolume.toFixed(1)}kg volumen`)
      if (stats.averageWorkoutDuration) statsItems.push(`${stats.averageWorkoutDuration}min promedio`)
      
      if (statsItems.length > 0) {
        summary.push(`ESTADÍSTICAS: ${statsItems.join(', ')}`)
      }
    }
    
    if (progress.milestones?.length > 0) {
      const completed = progress.milestones.filter((m: any) => m.completed).length
      summary.push(`OBJETIVOS: ${completed}/${progress.milestones.length} completados`)
      
      const recentCompleted = progress.milestones
        .filter((m: any) => m.completed)
        .slice(-2)
        .map((m: any) => m.title || m.name)
      
      if (recentCompleted.length > 0) {
        summary.push(`LOGROS: ${recentCompleted.join(', ')}`)
      }
    }
    
    if (progress.performanceMetrics?.length > 0) {
      summary.push(`MÉTRICAS: ${progress.performanceMetrics.length} registradas`)
    }
    
    return summary.length > 0 ? summary.join('\n') : 'Datos de progreso limitados disponibles'
  }
}

// Response Cache System
export class ResponseCache {
  private static cache = new Map<string, {
    response: AICoachResponse
    timestamp: number
  }>()
  
  private static readonly CACHE_DURATION = 2 * 60 * 1000 // 2 minutos - más agresivo para conversaciones dinámicas

  static async getOrCreateResponse(
    requestHash: string, 
    createFn: () => Promise<AICoachResponse>
  ): Promise<AICoachResponse> {
    const cached = this.cache.get(requestHash)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response
    }
    
    const response = await createFn()
    this.cache.set(requestHash, {
      response,
      timestamp: Date.now()
    })
    
    return response
  }
  
  static createRequestHash(message: string, context: OptimizedContext): string {
    // Include the actual message content to avoid cache collisions
    const messageHash = this.simpleHash(message.toLowerCase().trim())
    
    // Include recent chat history to differentiate conversations
    const recentMessages = context.chatHistory.slice(-2).map(m => m.content).join('|')
    const historyHash = this.simpleHash(recentMessages)
    
    const contextKey = JSON.stringify({
      goals: context.userBasics.goals,
      workout: context.currentPlanSummary.workout.substring(0, 50)
    })
    
    return `${messageHash}-${historyHash}-${this.simpleHash(contextKey)}`
  }


  private static simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }

  static clearCache(): void {
    this.cache.clear()
  }

  static getCacheSize(): number {
    return this.cache.size
  }
}

// Cost Monitor
class CostMonitor {
  private static dailyCost = 0
  private static readonly DAILY_LIMIT = 5.0 // $5 USD
  
  static trackAPICall(inputTokens: number, outputTokens: number, model: string = 'gpt-4o-mini') {
    const rates = {
      'gpt-4o-mini': {
        input: 0.00015 / 1000,  // $0.15 per 1K input tokens  
        output: 0.0006 / 1000   // $0.60 per 1K output tokens
      }
    }
    
    const rate = rates[model as keyof typeof rates] || rates['gpt-4o-mini']
    const cost = (inputTokens * rate.input) + (outputTokens * rate.output)
    
    this.dailyCost += cost
    
    if (this.dailyCost > this.DAILY_LIMIT) {
      return false
    }
    
    return true
  }
  
  static getDailyCost(): number {
    return this.dailyCost
  }
  
  static resetDailyCost(): void {
    this.dailyCost = 0
  }
}

// Main AI Coach Service
export class AICoachService {
  private static readonly AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || ''
  private static readonly AI_API_KEY = import.meta.env.VITE_AI_API_KEY || ''

  static async sendMessage(
    message: string, 
    userContext: UserContext
  ): Promise<AICoachResponse> {
    if (!this.AI_ENDPOINT || !this.AI_API_KEY) {
      return this.createFallbackResponse(message)
    }

    // Optimizar contexto para reducir tokens
    const optimizedContext = ContextManager.buildOptimizedContext(userContext)
    
    // Intentar cache primero
    const requestHash = ResponseCache.createRequestHash(message, optimizedContext)
    
    return ResponseCache.getOrCreateResponse(requestHash, async () => {
      return this.makeAICall(message, optimizedContext)
    })
  }

  private static async makeAICall(
    message: string, 
    context: OptimizedContext
  ): Promise<AICoachResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(context)
      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...context.chatHistory.slice(-3).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: "user" as const, content: message }
      ]

      const requestBody = {
        model: 'gpt-4o-mini',
        messages,
        functions: aiCoachFunctions,
        function_call: "auto",
        max_tokens: 1500,
        temperature: 0.3
      }
      
      const response = await fetch(this.AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.AI_API_KEY}`,
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const result = await response.json()
      
      // Track costs
      const inputTokens = result.usage?.prompt_tokens || 0
      const outputTokens = result.usage?.completion_tokens || 0
      CostMonitor.trackAPICall(inputTokens, outputTokens)

      return this.parseAIResponse(result)
    } catch (error) {
      return this.createFallbackResponse(message)
    }
  }

  private static buildSystemPrompt(context: OptimizedContext): string {
    return `Eres un ENTRENADOR PERSONAL CERTIFICADO y NUTRICIONISTA DEPORTIVO experto.

CONTEXTO DEL USUARIO:
- Objetivos: ${context.userBasics.goals.join(', ')}
- Nivel: ${context.userBasics.experience}
- Restricciones: ${context.userBasics.restrictions.join(', ') || 'Ninguna'}

PLAN DE ENTRENAMIENTO ACTUAL:
${context.currentPlanSummary.workout}

PLAN NUTRICIONAL ACTUAL:
${context.currentPlanSummary.nutrition}

DATOS REALES DEL USUARIO:
${context.progressDetails || 'No hay datos de progreso específicos disponibles'}

INSTRUCCIONES DE ANÁLISIS:
1. Responde como un entrenador personal amigable y profesional
2. ANALIZA los datos reales proporcionados - peso inicial vs recientes, entrenamientos detallados
3. CALCULA tú mismo las tendencias y progreso basándte en los datos mostrados
4. Usa los ejercicios específicos, pesos y repeticiones en tu análisis
5. Considera el plan nutricional (${context.currentPlanSummary.nutrition.split(',')[0]}) en tus recomendaciones
6. Si recomiendas cambios, basa las sugerencias en los datos reales observados
7. Sé específico y usa los números exactos de los datos proporcionados

🚨 REGLAS CRÍTICAS PARA CAMBIOS DE EJERCICIOS:

1. **ANALIZAR EL DÍA DE ENTRENAMIENTO**:
   - Arriba tienes el plan completo con ejercicios por día
   - Identifica QUÉ DÍA corresponde el ejercicio a cambiar
   - Mira TODOS los ejercicios de ESE DÍA específico

2. **NO DUPLICAR EJERCICIOS EN EL MISMO DÍA**:
   - NUNCA sugieras un ejercicio que ya esté en la lista del mismo día
   - Ejemplo: Si el LUNES ya tiene "Press de Pecho", NO sugieras otro "Press de Pecho"
   - Verifica la lista ANTES de hacer tu recomendación

3. **RESPETAR GRUPOS MUSCULARES**:
   - Al cambiar ejercicio de PECHO → sugiere SOLO ejercicios de pecho
   - Al cambiar ejercicio de ESPALDA → sugiere SOLO ejercicios de espalda
   - Usa la información "Músculos: ..." para verificar compatibilidad
   - NUNCA cambies pecho por espalda o viceversa

4. **USAR IDs CORRECTOS**:
   - SOLO usa IDs que aparecen en "EJERCICIOS DISPONIBLES"
   - NO inventes IDs nuevos
   - Si no hay opciones compatibles, crea nuevo ejercicio con targetMuscles apropiados

FLUJO DE DECISIÓN:
1. ¿Qué día tiene el ejercicio a cambiar?
2. ¿Qué ejercicios YA están en ese día?
3. ¿Qué músculos trabaja el ejercicio original?
4. ¿Hay ejercicios disponibles del mismo músculo QUE NO estén en ese día?
5. Si SÍ → usar ese ejercicio | Si NO → crear nuevo

IMPORTANTE: Los datos mostrados son REALES del usuario. Analízalos directamente y da recomendaciones basadas en lo que observes.`
  }

  private static parseAIResponse(result: any): AICoachResponse {
    const choice = result.choices[0]
    const functionCall = choice.function_call || choice.message?.function_call
    
    if (functionCall) {
      const functionName = functionCall.name
      
      try {
        const args = JSON.parse(functionCall.arguments)
        
        if (functionName === 'propose_changes') {
          const proposal: ProposedChange = {
            id: `proposal-${Date.now()}`,
            type: args.changeType,
            title: args.proposal.title,
            description: args.proposal.description,
            preview: args.proposal.changes,
            changes: args.proposal.changes,
            reasoning: args.proposal.reasoning,
            priority: args.priority,
            timestamp: new Date()
          }
          
          return {
            message: args.message,
            functionName,
            proposal,
            hasProposal: true
          }
        }
        
        if (functionName === 'analyze_progress') {
          let analysisMessage = args.message || 'Análisis de progreso completado.'
          
          if (args.analysis) {
            const analysis = args.analysis
            
            // Add key findings
            if (analysis.keyFindings && analysis.keyFindings.length > 0) {
              analysisMessage += '\n\n🎯 **Hallazgos clave:**\n'
              analysis.keyFindings.forEach((finding: string, index: number) => {
                analysisMessage += `${index + 1}. ${finding}\n`
              })
            }
            
            // Add achievements
            if (analysis.achievements && analysis.achievements.length > 0) {
              analysisMessage += '\n🏆 **Logros alcanzados:**\n'
              analysis.achievements.forEach((achievement: string) => {
                analysisMessage += `• ${achievement}\n`
              })
            }
            
            // Add concerns if any
            if (analysis.concerns && analysis.concerns.length > 0) {
              analysisMessage += '\n⚠️ **Puntos de atención:**\n'
              analysis.concerns.forEach((concern: string) => {
                analysisMessage += `• ${concern}\n`
              })
            }
          }
          
          // Add recommendations
          if (args.recommendations && args.recommendations.length > 0) {
            analysisMessage += '\n💡 **Recomendaciones:**\n'
            args.recommendations.forEach((rec: any) => {
              const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'
              analysisMessage += `${priority} **${rec.title}**\n   ${rec.description}\n\n`
            })
          }
          
          return {
            message: analysisMessage,
            functionName,
            hasProposal: false
          }
        }
        
        if (functionName === 'chat_only') {
          return {
            message: args.message,
            functionName,
            hasProposal: false
          }
        }
        
        return {
          message: args.message || 'Respuesta de función sin mensaje específico',
          functionName,
          hasProposal: false
        }
      } catch (parseError) {
        const truncatedArgs = functionCall.arguments
        if (truncatedArgs && truncatedArgs.includes('"message":"')) {
          try {
            const messageMatch = truncatedArgs.match(/"message":"([^"]*(?:\\.[^"]*)*)"/s)
            if (messageMatch && messageMatch[1]) {
              const extractedMessage = messageMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
              
              return {
                message: extractedMessage + '\n\n*Nota: Respuesta completa truncada por límite de tokens*',
                functionName,
                hasProposal: false
              }
            }
          } catch (extractError) {
            // Silent fail
          }
        }
        
        return {
          message: 'Error procesando respuesta de la IA. La respuesta fue muy larga y se truncó. Inténtalo de nuevo con una pregunta más específica.',
          functionName,
          hasProposal: false
        }
      }
    }
    
    return {
      message: choice.message?.content || 'Respuesta vacía de la IA',
      hasProposal: false
    }
  }

  private static createFallbackResponse(_message: string): AICoachResponse {
    const responses = [
      "Como tu entrenador personal, te recomiendo que sigas con tu plan actual. ¿Hay algo específico en lo que te pueda ayudar?",
      "Entiendo tu consulta. Para darte la mejor respuesta, necesito que configures la conexión con la IA en los ajustes.",
      "Estoy aquí para ayudarte con tu entrenamiento y nutrición. ¿Podrías ser más específico sobre lo que necesitas?",
      "Como entrenador personal, siempre es importante mantener la constancia. ¿En qué aspecto específico te puedo guiar?"
    ]
    
    return {
      message: responses[Math.floor(Math.random() * responses.length)],
      hasProposal: false
    }
  }

  static async analyzeUserProgress(userContext: UserContext): Promise<AICoachResponse> {
    const analysisPrompt = `Analiza mi progreso como entrenador personal experto:
    
DATOS RECIENTES:
- Plan actual: ${userContext.currentTrainingPlan?.name || 'Sin plan'}
- Objetivos: ${userContext.profile.goals?.join(', ') || 'No definidos'}

Proporciona un análisis completo de mi progreso y recomendaciones específicas.`

    return this.sendMessage(analysisPrompt, userContext)
  }
}