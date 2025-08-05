import { useState } from 'react'
import { useAppContext } from '@/store'
import { useAuth } from '@/domains/auth/hooks/useAuth'
import { ProgressService } from '../services/progressService'
import { useProgressData } from '../hooks/useProgressData'
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/shared/components/ui'
import { Plus, Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const WeightTracker = () => {
  const { state, dispatch } = useAppContext()
  const { user } = useAuth()
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 🔥 SOLUCIÓN DEFINITIVA: Usar custom hook que maneja toda la carga
  useProgressData()

  const handleAddWeight = async () => {
    if (!newWeight || !newDate || parseFloat(newWeight) <= 0) {
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Datos incompletos',
          message: 'Por favor ingresa un peso válido y la fecha'
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
          message: 'Debes estar logueado para registrar peso'
        }
      })
      return
    }

    setIsLoading(true)

    try {
      
      // 🔥 CORREGIDO: Guardar en BD primero
      const savedEntry = await ProgressService.addWeightEntry(user.id, {
        weight: parseFloat(newWeight),
        date: newDate,
        notes: notes || undefined,
      })


      // Actualizar estado local con el dato guardado en BD
      dispatch({
        type: 'WEIGHT_ENTRY_ADD',
        payload: savedEntry,
      })

      dispatch({
        type: 'STATS_CALCULATE'
      })

      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'success',
          title: 'Peso registrado',
          message: `${newWeight}kg guardado en base de datos`
        }
      })

      // Reset form
      setNewWeight('')
      setNewDate(new Date().toISOString().split('T')[0])
      setNotes('')

    } catch (error) {
      console.error('❌ Error guardando peso:', error)
      dispatch({
        type: 'NOTIFICATION_ADD',
        payload: {
          type: 'error',
          title: 'Error guardando peso',
          message: 'No se pudo guardar en la base de datos'
        }
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEntry = (id: string) => {
    dispatch({
      type: 'WEIGHT_ENTRY_DELETE',
      payload: { id }
    })

    dispatch({
      type: 'STATS_CALCULATE'
    })

    dispatch({
      type: 'NOTIFICATION_ADD',
      payload: {
        type: 'info',
        title: 'Registro eliminado',
      }
    })
  }

  const { weightHistory } = state.progress
  const latestWeight = weightHistory[0]
  const previousWeight = weightHistory[1]
  const weightChange = latestWeight && previousWeight 
    ? latestWeight.weight - previousWeight.weight 
    : 0

  return (
    <Card>
      <CardHeader className="p-2 xs:p-3 sm:p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-sm xs:text-base sm:text-lg">
          <Scale className="text-blue-600" size={16} />
          <span className="break-words">Registro de Peso</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 xs:p-3 sm:p-4 md:p-6">
        <div className="space-y-4 xs:space-y-6">
          {/* Add new weight form */}
          <div className="p-2 xs:p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 xs:space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm xs:text-base">
              Nuevo registro
            </h4>
            
            <div className="grid xs:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
              <Input
                type="number"
                step="0.1"
                placeholder="Peso (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                leftIcon={<Scale size={14} />}
                className="text-sm xs:text-base"
              />
              
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="text-sm xs:text-base"
              />
            </div>

            <Input
              placeholder="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm xs:text-base"
            />

            <Button 
              onClick={handleAddWeight}
              disabled={!newWeight || !newDate || parseFloat(newWeight) <= 0 || isLoading}
              leftIcon={!isLoading ? <Plus size={14} /> : undefined}
              className="w-full min-h-[36px] text-xs xs:text-sm"
            >
              {isLoading ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>

          {/* Current status */}
          {latestWeight && (
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0 p-2 xs:p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <div className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {latestWeight.weight}kg
                </div>
                <div className="text-xs xs:text-sm text-blue-500 dark:text-blue-400">
                  Último registro
                </div>
              </div>
              
              {weightChange !== 0 && (
                <div className="flex items-center gap-2">
                  {weightChange > 0 ? (
                    <TrendingUp className="text-red-500" size={16} />
                  ) : (
                    <TrendingDown className="text-green-500" size={16} />
                  )}
                  <span className={`font-semibold text-sm xs:text-base ${
                    weightChange > 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Weight history */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 xs:mb-4 text-sm xs:text-base">
              Historial ({weightHistory.length})
            </h4>
            
            {weightHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No hay registros de peso aún.
                <br />
                ¡Añade tu primer registro arriba!
              </p>
            ) : (
              <div className="space-y-2 xs:space-y-3 max-h-64 overflow-y-auto">
                {weightHistory.slice(0, 10).map((entry, index) => {
                  const prevEntry = weightHistory[index + 1]
                  const change = prevEntry ? entry.weight - prevEntry.weight : 0

                  return (
                    <div key={entry.id} className="flex items-center justify-between gap-2 p-2 xs:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm xs:text-base">
                            {entry.weight}kg
                          </span>
                          {change !== 0 && (
                            <span className={`text-xs xs:text-sm font-medium ${
                              change > 0 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {change > 0 ? '+' : ''}{change.toFixed(1)}kg
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs xs:text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(entry.date), 'dd MMM yyyy', { locale: es })}
                        </div>
                        
                        {entry.notes && (
                          <div className="text-xs xs:text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
                            {entry.notes}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0 h-8 w-8 p-0"
                      >
                        <Minus size={12} />
                      </Button>
                    </div>
                  )
                })}
                
                {weightHistory.length > 10 && (
                  <div className="text-center text-xs xs:text-sm text-gray-500 dark:text-gray-400 py-2">
                    ... y {weightHistory.length - 10} más
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}