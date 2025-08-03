import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/shared/components/ui'
import { Droplets, Star, Calendar, AlertTriangle } from 'lucide-react'

export const ProteinShakeGuide = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="text-blue-500" />
          Batidos de Proteína - Cuándo Tomarlos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Post-workout shake */}
          <Card variant="bordered" className="bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Star className="text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">
                    Post-Entreno (OBLIGATORIO)
                  </h4>
                  <p className="font-medium text-primary-700 dark:text-primary-300 mb-3">
                    Dentro de 30 min después del gym
                  </p>
                  <ul className="space-y-2 text-primary-600 dark:text-primary-400">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full" />
                      1 scoop PBN + 300ml leche semi-desnatada
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-400 rounded-full" />
                      1 plátano (opcional)
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rest days shake */}
          <Card variant="bordered" className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="text-gray-600 dark:text-gray-400 flex-shrink-0 mt-1" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Días Sin Gym
                  </h4>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Entre comidas o cena
                  </p>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      1 scoop PBN + 250ml leche
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      Como snack o sustituto cena ligera
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important note */}
          <Card variant="bordered" className="bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-warning-600 dark:text-warning-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-warning-800 dark:text-warning-200 mb-3">
                    IMPORTANTE:
                  </h4>
                  <ul className="space-y-2 text-warning-700 dark:text-warning-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning-400 rounded-full" />
                      Total scoops/día: Máximo 2
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning-400 rounded-full" />
                      Mejor momento: Post-entreno siempre
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-warning-400 rounded-full" />
                      Segundo momento: Entre almuerzo-cena si tienes hambre
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nutritional info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  103
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Calorías por scoop
                </div>
                <Badge variant="outline" size="sm">PBN</Badge>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  25g
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Proteína por scoop
                </div>
                <Badge variant="success" size="sm">Alto contenido</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}