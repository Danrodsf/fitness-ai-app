import { useState } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { ProgressService } from '../services/progressService'
import { useProgressData } from '../hooks/useProgressData'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input } from '@/shared/components/ui'
import { Target, Plus, CheckCircle, Calendar, Trophy, Dumbbell, Heart, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const MilestonesCard = () => {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'weight' as 'weight' | 'strength' | 'endurance' | 'habit',
    targetValue: '',
    unit: 'kg'
  })

  // 🔥 SOLUCIÓN DEFINITIVA: Usar custom hook que maneja toda la carga
  useProgressData()

  const handleCompleteMilestone = async (id: string) => {
    if (!user?.id) return

    try {
      console.log('🎯 Completando milestone en BD:', id)
      
      // Completar en BD primero
      await ProgressService.completeMilestone(id)
      
      console.log('✅ Milestone completado en BD')

      // Actualizar estado local
      dispatch({
        type: 'MILESTONE_COMPLETE',
        payload: { id }
      })

      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: '🎉 ¡Logro alcanzado!',
          message: 'Objetivo completado y guardado'
        }
      })
      
    } catch (error) {
      console.error('❌ Error completando milestone:', error)
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error',
          message: 'No se pudo completar el objetivo'
        }
      })
    }
  }

  const handleAddMilestone = async () => {
    if (!newMilestone.title || !newMilestone.targetDate) {
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Datos incompletos',
          message: 'Por favor completa título y fecha objetivo'
        }
      })
      return
    }

    if (!user?.id) {
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error de autenticación',
          message: 'Debes estar logueado para crear objetivos'
        }
      })
      return
    }

    setIsLoading(true)

    try {
      console.log('💾 Guardando milestone en BD:', newMilestone)
      
      // 🔥 CORREGIDO: Guardar en BD primero
      const savedMilestone = await ProgressService.addMilestone(user.id, {
        title: newMilestone.title,
        description: newMilestone.description,
        targetDate: newMilestone.targetDate,
        category: newMilestone.category,
        targetValue: parseFloat(newMilestone.targetValue) || undefined,
        currentValue: 0,
        unit: newMilestone.unit,
        completed: false,
      })

      console.log('✅ Milestone guardado en BD:', savedMilestone)

      // Actualizar estado local con el dato guardado en BD
      dispatch({
        type: 'MILESTONE_ADD',
        payload: savedMilestone
      })

      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: 'Objetivo añadido',
          message: `${newMilestone.title} guardado en base de datos`
        }
      })

      // Reset form
      setNewMilestone({
        title: '',
        description: '',
        targetDate: '',
        category: 'weight',
        targetValue: '',
        unit: 'kg'
      })
      setShowAddForm(false)

    } catch (error) {
      console.error('❌ Error guardando milestone:', error)
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error guardando objetivo',
          message: 'No se pudo guardar en la base de datos'
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weight': return <Target className="text-blue-500" size={16} />
      case 'strength': return <Dumbbell className="text-red-500" size={16} />
      case 'endurance': return <Heart className="text-green-500" size={16} />
      case 'habit': return <Repeat className="text-purple-500" size={16} />
      default: return <Target className="text-gray-500" size={16} />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weight': return 'primary'
      case 'strength': return 'danger'
      case 'endurance': return 'success'
      case 'habit': return 'secondary'
      default: return 'default'
    }
  }

  const { milestones } = state.progress
  const completedMilestones = milestones.filter(m => m.completed)
  const activeMilestones = milestones.filter(m => !m.completed)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="text-yellow-600" />
            Objetivos y Logros
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            leftIcon={<Plus size={16} />}
          >
            Nuevo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedMilestones.length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                Completados
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activeMilestones.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                En progreso
              </div>
            </div>
          </div>

          {/* Add milestone form */}
          {showAddForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Nuevo objetivo
              </h4>
              
              <Input
                placeholder="Título del objetivo"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
              />
              
              <Input
                placeholder="Descripción (opcional)"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: e.target.value }))}
                />
                
                <select
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={newMilestone.category}
                  onChange={(e) => setNewMilestone(prev => ({ 
                    ...prev, 
                    category: e.target.value as any,
                    unit: e.target.value === 'weight' ? 'kg' : 
                          e.target.value === 'strength' ? 'kg' :
                          e.target.value === 'endurance' ? 'min' : 'días'
                  }))}
                >
                  <option value="weight">Peso</option>
                  <option value="strength">Fuerza</option>
                  <option value="endurance">Resistencia</option>
                  <option value="habit">Hábito</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  placeholder="Valor objetivo"
                  value={newMilestone.targetValue}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, targetValue: e.target.value }))}
                />
                
                <Input
                  placeholder="Unidad"
                  value={newMilestone.unit}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleAddMilestone} 
                  disabled={!newMilestone.title || !newMilestone.targetDate || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Guardando...' : 'Añadir objetivo'}
                </Button>
                <Button variant="ghost" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Active milestones */}
          {activeMilestones.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                En progreso ({activeMilestones.length})
              </h4>
              
              <div className="space-y-3">
                {activeMilestones.map((milestone) => {
                  const progress = milestone.targetValue && milestone.currentValue !== undefined
                    ? (milestone.currentValue / milestone.targetValue) * 100
                    : 0
                  
                  const isOverdue = new Date(milestone.targetDate) < new Date()

                  return (
                    <div key={milestone.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryIcon(milestone.category)}
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                              {milestone.title}
                            </h5>
                            <Badge variant={getCategoryColor(milestone.category)} size="sm">
                              {milestone.category}
                            </Badge>
                          </div>
                          
                          {milestone.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {milestone.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {format(new Date(milestone.targetDate), 'dd MMM yyyy', { locale: es })}
                              {isOverdue && <span className="text-red-500 ml-1">(Vencido)</span>}
                            </div>
                            
                            {milestone.targetValue && (
                              <div>
                                {milestone.currentValue}/{milestone.targetValue} {milestone.unit}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteMilestone(milestone.id)}
                          leftIcon={<CheckCircle size={16} />}
                        >
                          Completar
                        </Button>
                      </div>

                      {milestone.targetValue && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progreso</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-primary-500 to-success-500"
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Completed milestones */}
          {completedMilestones.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                🎉 Completados ({completedMilestones.length})
              </h4>
              
              <div className="space-y-2">
                {completedMilestones.slice(0, 3).map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200">
                          {milestone.title}
                        </div>
                        {milestone.completedDate && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            {format(new Date(milestone.completedDate), 'dd MMM yyyy', { locale: es })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge variant="success" size="sm">
                      ✓ Logrado
                    </Badge>
                  </div>
                ))}
                
                {completedMilestones.length > 3 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                    ... y {completedMilestones.length - 3} logros más
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {milestones.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Trophy size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Sin objetivos aún</h3>
              <p>¡Añade tu primer objetivo para comenzar a hacer seguimiento!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}