import { ShoppingItem } from '../types'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/shared/components/ui'
import { ShoppingCart, Package, Carrot, Wheat, Milk, UtensilsCrossed } from 'lucide-react'

interface ShoppingListProps {
  shoppingList: ShoppingItem[]
}

const categoryIcons = {
  proteins: <Package className="text-red-500" size={18} />,
  vegetables: <Carrot className="text-green-500" size={18} />,
  grains: <Wheat className="text-amber-500" size={18} />,
  dairy: <Milk className="text-blue-500" size={18} />,
  pantry: <UtensilsCrossed className="text-purple-500" size={18} />,
}

const categoryTitles = {
  proteins: 'Proteínas (prep domingo)',
  vegetables: 'Verduras (duran toda semana)',
  grains: 'Cereales',
  dairy: 'Lácteos',
  pantry: 'Básicos',
}

export const ShoppingList = ({ shoppingList }: ShoppingListProps) => {
  // Handle empty or undefined shopping list
  if (!shoppingList || shoppingList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="text-green-600" />
            Lista Compra Semanal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-300 text-center py-6">
            No hay lista de compras disponible para este plan.
          </p>
        </CardContent>
      </Card>
    )
  }

  const groupedItems = shoppingList.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = []
    }
    groups[item.category].push(item)
    return groups
  }, {} as Record<string, ShoppingItem[]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="text-green-600" />
          Lista Compra Semanal BÁSICA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                {categoryIcons[category as keyof typeof categoryIcons]}
                {categoryTitles[category as keyof typeof categoryTitles]}
              </h4>
              
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.quantity}
                      </span>
                      {item.estimated && (
                        <Badge variant="outline" size="sm">
                          Est.
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Total de artículos:</span>
            <Badge variant="primary" size="sm">
              {shoppingList.length} productos
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}