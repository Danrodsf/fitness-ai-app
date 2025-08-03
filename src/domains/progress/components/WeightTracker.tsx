import { useState } from 'react'
import { useAppContext } from '@/store'
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/shared/components/ui'
import { Plus, Scale, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const WeightTracker = () => {
  const { state, dispatch } = useAppContext()
  const [newWeight, setNewWeight] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  const handleAddWeight = () => {
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

    const weightEntry = {
      id: `weight-${Date.now()}`,
      weight: parseFloat(newWeight),
      date: newDate,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }


    dispatch({
      type: 'WEIGHT_ENTRY_ADD',
      payload: weightEntry,
    })

    dispatch({
      type: 'STATS_CALCULATE'
    })

    dispatch({
      type: 'NOTIFICATION_ADD',
      payload: {
        type: 'success',
        title: 'Peso registrado',
        message: `${newWeight}kg guardado correctamente`
      }
    })

    // Reset form
    setNewWeight('')
    setNewDate(new Date().toISOString().split('T')[0])
    setNotes('')
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="text-blue-600" />
          Registro de Peso
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add new weight form */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-white">
              Nuevo registro
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.1"
                placeholder="Peso (kg)"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                leftIcon={<Scale size={16} />}
              />
              
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <Input
              placeholder="Notas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button 
              onClick={handleAddWeight}
              disabled={!newWeight || !newDate || parseFloat(newWeight) <= 0}
              leftIcon={<Plus size={16} />}
              className="w-full"
            >
              Registrar Peso
            </Button>
          </div>

          {/* Current status */}
          {latestWeight && (
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {latestWeight.weight}kg
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-400">
                  Último registro
                </div>
              </div>
              
              {weightChange !== 0 && (
                <div className="flex items-center gap-2">
                  {weightChange > 0 ? (
                    <TrendingUp className="text-red-500" size={20} />
                  ) : (
                    <TrendingDown className="text-green-500" size={20} />
                  )}
                  <span className={`font-semibold ${
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
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Historial ({weightHistory.length} registros)
            </h4>
            
            {weightHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No hay registros de peso aún.
                <br />
                ¡Añade tu primer registro arriba!
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {weightHistory.slice(0, 10).map((entry, index) => {
                  const prevEntry = weightHistory[index + 1]
                  const change = prevEntry ? entry.weight - prevEntry.weight : 0

                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {entry.weight}kg
                          </span>
                          {change !== 0 && (
                            <span className={`text-sm font-medium ${
                              change > 0 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {change > 0 ? '+' : ''}{change.toFixed(1)}kg
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(entry.date), 'dd MMM yyyy', { locale: es })}
                        </div>
                        
                        {entry.notes && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {entry.notes}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Minus size={16} />
                      </Button>
                    </div>
                  )
                })}
                
                {weightHistory.length > 10 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                    ... y {weightHistory.length - 10} registros más
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