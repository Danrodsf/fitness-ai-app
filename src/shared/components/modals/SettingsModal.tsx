import { useState } from 'react'
import { Button } from '@/shared/components/ui'
import { useAppContext } from '@/store'
import { X, Sun, Moon, Bell, Download, Upload, Trash2 } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { state, dispatch } = useAppContext()
  const [notifications, setNotifications] = useState(true)

  if (!isOpen) return null

  const handleThemeToggle = () => {
    dispatch({ type: 'THEME_TOGGLE' })
  }

  const handleExportData = () => {
    const dataToExport = {
      user: state.user,
      training: state.training,
      nutrition: state.nutrition,
      progress: state.progress,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        
        // Validar estructura básica
        if (importedData.user && importedData.training) {
          dispatch({ type: 'APP_HYDRATE', payload: importedData })
          alert('Datos importados correctamente')
        } else {
          alert('Archivo inválido')
        }
      } catch (error) {
        alert('Error al importar el archivo')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset input
  }

  const handleClearData = () => {
    if (confirm('¿Estás seguro de que quieres borrar todos los datos? Esta acción no se puede deshacer.')) {
      dispatch({ type: 'APP_RESET' })
      alert('Datos borrados correctamente')
      onClose()
    }
  }


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 min-h-screen">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuración
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Apariencia
            </h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {state.theme.isDark ? <Moon size={20} /> : <Sun size={20} />}
                <span className="text-gray-700 dark:text-gray-300">
                  Tema {state.theme.isDark ? 'Oscuro' : 'Claro'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleThemeToggle}
              >
                Cambiar
              </Button>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Notificaciones
            </h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell size={20} />
                <span className="text-gray-700 dark:text-gray-300">
                  Recordatorios de entrenamiento
                </span>
              </div>
              <Button
                variant={notifications ? "primary" : "outline"}
                size="sm"
                onClick={() => setNotifications(!notifications)}
              >
                {notifications ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Gestión de Datos
            </h3>
            <div className="space-y-3">
              {/* Export Data */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download size={20} />
                  <span className="text-gray-700 dark:text-gray-300">
                    Exportar datos
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                >
                  Descargar
                </Button>
              </div>

              {/* Import Data */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <Upload size={20} />
                  <span className="text-gray-700 dark:text-gray-300">
                    Importar datos
                  </span>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Subir archivo
                  </Button>
                </label>
              </div>

              {/* Clear Data */}
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trash2 size={20} className="text-red-600" />
                  <span className="text-red-700 dark:text-red-300">
                    Borrar todos los datos
                  </span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearData}
                >
                  Borrar
                </Button>
              </div>
            </div>
          </div>


          {/* App Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Mi Plan de Fitness v1.0</p>
              <p>Aplicación personalizada para tu entrenamiento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}