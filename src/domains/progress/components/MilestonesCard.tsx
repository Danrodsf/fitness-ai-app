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
      
      // Completar en BD primero
      await ProgressService.completeMilestone(id)
      

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
      <CardHeader className="p-2 xs:p-3 sm:p-4 md:p-6">
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0">
          <CardTitle className="flex items-center gap-2 text-sm xs:text-base sm:text-lg">
            <Trophy className="text-yellow-600" size={16} />
            <span className="break-words">Objetivos y Logros</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            leftIcon={<Plus size={14} />}
            className="w-full xs:w-auto text-xs xs:text-sm px-2 xs:px-3"
          >
            Nuevo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 xs:p-3 sm:p-4 md:p-6">
        <div className="space-y-4 xs:space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2 xs:gap-4 text-center">
            <div className="p-2 xs:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                {completedMilestones.length}
              </div>
              <div className="text-xs xs:text-sm text-green-600 dark:text-green-400">
                Completados
              </div>
            </div>
            <div className="p-2 xs:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activeMilestones.length}
              </div>
              <div className="text-xs xs:text-sm text-blue-600 dark:text-blue-400">
                En progreso
              </div>
            </div>
          </div>

          {/* Add milestone form */}
          {showAddForm && (
            <div className="p-2 xs:p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 xs:space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white text-sm xs:text-base">
                Nuevo objetivo
              </h4>
              
              <Input
                placeholder="Título del objetivo"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                className="text-sm xs:text-base"
              />
              
              <Input
                placeholder="Descripción (opcional)"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                className="text-sm xs:text-base"
              />

              <div className="grid xs:grid-cols-2 gap-2 xs:gap-4">
                <Input
                  type="date"
                  value={newMilestone.targetDate}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="text-sm xs:text-base"
                />
                
                <select
                  className="block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm xs:text-base p-2"
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

              <div className="grid xs:grid-cols-2 gap-2 xs:gap-4">
                <Input
                  type="number"
                  placeholder="Valor objetivo"
                  value={newMilestone.targetValue}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, targetValue: e.target.value }))}
                  className="text-sm xs:text-base"
                />
                
                <Input
                  placeholder="Unidad"
                  value={newMilestone.unit}
                  onChange={(e) => setNewMilestone(prev => ({ ...prev, unit: e.target.value }))}
                  className="text-sm xs:text-base"
                />
              </div>

              <div className="flex flex-col xs:flex-row gap-2">
                <Button 
                  onClick={handleAddMilestone} 
                  disabled={!newMilestone.title || !newMilestone.targetDate || isLoading}
                  className="flex-1 text-xs xs:text-sm"
                >
                  {isLoading ? 'Guardando...' : 'Añadir'}
                </Button>
                <Button variant="ghost" onClick={() => setShowAddForm(false)} className="text-xs xs:text-sm">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Active milestones */}
          {activeMilestones.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 xs:mb-3 text-sm xs:text-base">
                En progreso ({activeMilestones.length})
              </h4>
              
              <div className="space-y-2 xs:space-y-3">
                {activeMilestones.map((milestone) => {
                  const progress = milestone.targetValue && milestone.currentValue !== undefined
                    ? (milestone.currentValue / milestone.targetValue) * 100
                    : 0
                  
                  const isOverdue = new Date(milestone.targetDate) < new Date()

                  return (
                    <div key={milestone.id} className="p-2 xs:p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 xs:gap-0 mb-2 xs:mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-1">
                            {getCategoryIcon(milestone.category)}
                            <h5 className="font-semibold text-gray-900 dark:text-white text-sm xs:text-base break-words">
                              {milestone.title}
                            </h5>
                            <Badge variant={getCategoryColor(milestone.category)} size="sm" className="text-xs">
                              {milestone.category}
                            </Badge>
                          </div>
                          
                          {milestone.description && (
                            <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-300 mb-2 break-words">
                              {milestone.description}
                            </p>
                          )}
                          
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs xs:text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{format(new Date(milestone.targetDate), 'dd MMM yyyy', { locale: es })}</span>
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
                          leftIcon={<CheckCircle size={14} />}
                          className="w-full xs:w-auto text-xs xs:text-sm px-2 xs:px-3 flex-shrink-0"
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
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 xs:mb-3 text-sm xs:text-base">
                🎉 Completados ({completedMilestones.length})
              </h4>
              
              <div className="space-y-2">
                {completedMilestones.slice(0, 3).map((milestone) => (
                  <div key={milestone.id} className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-2 xs:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                      <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={14} />
                      <div className="min-w-0">
                        <div className="font-medium text-green-800 dark:text-green-200 text-sm xs:text-base break-words">
                          {milestone.title}
                        </div>
                        {milestone.completedDate && (
                          <div className="text-xs xs:text-sm text-green-600 dark:text-green-400">
                            {format(new Date(milestone.completedDate), 'dd MMM yyyy', { locale: es })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Badge variant="success" size="sm" className="text-xs flex-shrink-0">
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
            <div className="text-center py-6 xs:py-8 text-gray-500 dark:text-gray-400">
              <Trophy size={32} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-base xs:text-lg font-semibold mb-2">Sin objetivos aún</h3>
              <p className="text-xs xs:text-sm break-words">¡Añade tu primer objetivo para comenzar!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}