import { WeeklyMealPlan, NutritionGoals, DayMealPlan, MealOption, ShoppingItem } from '../types'

// Nutrition goals from original project
export const defaultNutritionGoals: NutritionGoals = {
  dailyCalories: 1900,
  dailyProtein: 140,
  dailyCarbs: 190,
  dailyFats: 63,
  calorieDeficit: 350,
}

// Meal options from original project
const breakfastOptions: MealOption[] = [
  {
    title: 'Batido Post-Entreno (días de gym)',
    description: 'Ideal después del entrenamiento con avena para carbohidratos',
    prepTime: 5,
    recipe: 'Mezcla la proteína con leche fría. Añade avena y canela. Bate bien hasta que quede cremoso. Acompaña con tostada de tomate con sal y orégano.',
    foods: [
      { name: '1 scoop proteína PBN', quantity: 1, unit: 'scoop', calories: 103, protein: 25, carbs: 1, fats: 0.5 },
      { name: 'Leche semi-desnatada', quantity: 300, unit: 'ml', calories: 150, protein: 10, carbs: 15, fats: 5 },
      { name: 'Avena', quantity: 30, unit: 'g', calories: 117, protein: 4, carbs: 21, fats: 2.5 },
      { name: 'Canela', quantity: 1, unit: 'pizca', calories: 2, protein: 0, carbs: 0.5, fats: 0 },
      { name: 'Pan integral', quantity: 2, unit: 'rebanadas', calories: 140, protein: 6, carbs: 24, fats: 2 },
      { name: 'Tomate rallado', quantity: 1, unit: 'unidad', calories: 22, protein: 1, carbs: 5, fats: 0.2 },
      { name: 'Sal y orégano', quantity: 1, unit: 'pizca', calories: 0, protein: 0, carbs: 0, fats: 0 },
    ],
    calories: 534,
    protein: 46,
  },
  {
    title: 'Desayuno Normal (días sin gym)',
    description: 'Huevos revueltos con especias y tostada mediterránea',
    prepTime: 10,
    recipe: 'Revuelve los huevos con sal, pimienta y pimentón dulce. Cocina a fuego medio con aceite. Tuesta el pan y úntalo con tomate rallado, sal, orégano y un chorrito de aceite.',
    foods: [
      { name: 'Huevos', quantity: 3, unit: 'unidades', calories: 210, protein: 18, carbs: 1, fats: 15 },
      { name: 'Pimentón dulce', quantity: 1, unit: 'pizca', calories: 2, protein: 0, carbs: 0.5, fats: 0 },
      { name: 'Pan integral', quantity: 2, unit: 'rebanadas', calories: 140, protein: 6, carbs: 24, fats: 2 },
      { name: 'Tomate rallado', quantity: 1, unit: 'unidad', calories: 22, protein: 1, carbs: 5, fats: 0.2 },
      { name: 'Aceite oliva', quantity: 1, unit: 'cucharadita', calories: 40, protein: 0, carbs: 0, fats: 4.5 },
      { name: 'Sal, pimienta, orégano', quantity: 1, unit: 'pizca', calories: 1, protein: 0, carbs: 0, fats: 0 },
    ],
    calories: 415,
    protein: 25,
  },
]

const lunchOptions: MealOption[] = [
  {
    title: 'Pollo Air Fryer Especiado',
    description: 'Pechuga de pollo con ajo, pimentón y batatas doradas',
    prepTime: 20,
    recipe: 'Sazona el pollo con ajo en polvo, pimentón dulce, sal y pimienta. Air fryer 180°C 12 min. Corta batatas en bastones, sazona con romero y sal, air fryer 15 min. Ensalada con aceite, vinagre y mostaza.',
    foods: [
      { name: 'Pechuga pollo (sin piel)', quantity: 200, unit: 'g', calories: 330, protein: 62, carbs: 0, fats: 7 },
      { name: 'Ajo en polvo, pimentón, romero', quantity: 1, unit: 'cucharadita', calories: 5, protein: 0, carbs: 1, fats: 0 },
      { name: 'Batatas', quantity: 150, unit: 'g', calories: 129, protein: 2, carbs: 30, fats: 0.1 },
      { name: 'Ensalada mixta', quantity: 100, unit: 'g', calories: 20, protein: 2, carbs: 4, fats: 0.2 },
      { name: 'Aceite oliva extra virgen', quantity: 1, unit: 'cucharada', calories: 120, protein: 0, carbs: 0, fats: 14 },
      { name: 'Vinagre de Jerez', quantity: 1, unit: 'cucharadita', calories: 1, protein: 0, carbs: 0, fats: 0 },
    ],
    calories: 605,
    protein: 66,
  },
  {
    title: 'Ternera al Ajillo',
    description: 'Solomillo de ternera con patatas y pimientos al ajo',
    prepTime: 25,
    recipe: 'Filetea la ternera y sazona con sal y pimienta. Dora en sartén con aceite y ajo laminado. Hierve patatas con laurel. Sofríe pimientos y cebolla con ajo, pimentón y un toque de vino blanco (opcional).',
    foods: [
      { name: 'Solomillo ternera', quantity: 180, unit: 'g', calories: 290, protein: 54, carbs: 0, fats: 8 },
      { name: 'Ajo fresco', quantity: 2, unit: 'dientes', calories: 8, protein: 0.4, carbs: 2, fats: 0 },
      { name: 'Patatas hervidas', quantity: 200, unit: 'g', calories: 154, protein: 4, carbs: 36, fats: 0.2 },
      { name: 'Hoja de laurel', quantity: 1, unit: 'unidad', calories: 1, protein: 0, carbs: 0, fats: 0 },
      { name: 'Pimientos rojos', quantity: 100, unit: 'g', calories: 28, protein: 1, carbs: 6, fats: 0.3 },
      { name: 'Cebolla', quantity: 50, unit: 'g', calories: 20, protein: 1, carbs: 5, fats: 0.1 },
      { name: 'Pimentón dulce', quantity: 1, unit: 'pizca', calories: 2, protein: 0, carbs: 0.5, fats: 0 },
    ],
    calories: 503,
    protein: 60.4,
  },
  {
    title: 'Pollo con Arroz Aromático',
    description: 'Muslos de pollo con arroz al azafrán y brócoli',
    prepTime: 20,
    recipe: 'Sazona los muslos con comino, cúrcuma y sal. Dora en sartén. Cuece arroz con azafrán o cúrcuma y caldo de pollo. Saltea el brócoli con ajo y guindilla. Acompaña con tomate aliñado con albahaca.',
    foods: [
      { name: 'Muslos pollo (sin piel)', quantity: 200, unit: 'g', calories: 250, protein: 46, carbs: 0, fats: 6 },
      { name: 'Comino, cúrcuma, azafrán', quantity: 1, unit: 'pizca', calories: 3, protein: 0, carbs: 0.5, fats: 0 },
      { name: 'Arroz blanco', quantity: 80, unit: 'g (seco)', calories: 288, protein: 6, carbs: 64, fats: 0.6 },
      { name: 'Caldo de pollo (bajo en sal)', quantity: 200, unit: 'ml', calories: 15, protein: 3, carbs: 0, fats: 0.5 },
      { name: 'Brócoli', quantity: 150, unit: 'g', calories: 51, protein: 5, carbs: 10, fats: 0.6 },
      { name: 'Ajo y guindilla', quantity: 1, unit: 'pizca', calories: 4, protein: 0, carbs: 1, fats: 0 },
      { name: 'Tomate con albahaca', quantity: 1, unit: 'unidad', calories: 22, protein: 1, carbs: 5, fats: 0.2 },
    ],
    calories: 633,
    protein: 61,
  },
]

const dinnerOptions: MealOption[] = [
  {
    title: 'Tortilla de Cebolla Caramelizada',
    description: 'Tortilla con cebolla dorada y ensalada mediterránea',
    prepTime: 8,
    recipe: 'Pocha la cebolla a fuego lento hasta caramelizar. Bate huevos con sal, pimienta y hierbas provenzales. Cuaja la tortilla con la cebolla. Aliña la ensalada con aceite, vinagre, sal y orégano.',
    foods: [
      { name: 'Huevos', quantity: 3, unit: 'unidades', calories: 210, protein: 18, carbs: 1, fats: 15 },
      { name: 'Cebolla', quantity: 60, unit: 'g', calories: 24, protein: 0.6, carbs: 6, fats: 0.1 },
      { name: 'Hierbas provenzales', quantity: 1, unit: 'pizca', calories: 1, protein: 0, carbs: 0, fats: 0 },
      { name: 'Ensalada bolsa', quantity: 80, unit: 'g', calories: 16, protein: 1.6, carbs: 3.2, fats: 0.2 },
      { name: 'Tomate cherry', quantity: 100, unit: 'g', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2 },
      { name: 'Aceite oliva y vinagre', quantity: 1, unit: 'cucharadita', calories: 20, protein: 0, carbs: 0, fats: 2.2 },
    ],
    calories: 289,
    protein: 21.1,
  },
  {
    title: 'Pollo al Limón y Hierbas',
    description: 'Pechuga de pollo marinada con ensalada fresca',
    prepTime: 15,
    recipe: 'Marina el pollo con zumo de limón, ajo, romero y tomillo 10 min. Air fryer 180°C 12 min. Ensalada con tomate, pepino y cebolleta, aliñada con aceite, limón y mostaza de Dijon.',
    foods: [
      { name: 'Pechuga pollo', quantity: 150, unit: 'g', calories: 248, protein: 46, carbs: 0, fats: 5 },
      { name: 'Limón, ajo, romero, tomillo', quantity: 1, unit: 'porción', calories: 5, protein: 0, carbs: 1, fats: 0 },
      { name: 'Tomate', quantity: 1, unit: 'unidad', calories: 22, protein: 1, carbs: 5, fats: 0.2 },
      { name: 'Pepino', quantity: 100, unit: 'g', calories: 16, protein: 0.7, carbs: 4, fats: 0.1 },
      { name: 'Cebolleta', quantity: 20, unit: 'g', calories: 6, protein: 0.4, carbs: 1, fats: 0 },
      { name: 'Aceite oliva y mostaza Dijon', quantity: 1, unit: 'cucharadita', calories: 25, protein: 0, carbs: 0.5, fats: 2.5 },
    ],
    calories: 322,
    protein: 48.1,
  },
  {
    title: 'Batido Cremoso Nocturno',
    description: 'Batido de proteína con avena y canela',
    prepTime: 3,
    recipe: 'Mezcla proteína con leche fría. Añade avena, canela y cacao en polvo sin azúcar. Bate hasta conseguir textura cremosa. Acompaña con tostada integral con queso fresco batido.',
    foods: [
      { name: '1 scoop proteína', quantity: 1, unit: 'scoop', calories: 103, protein: 25, carbs: 1, fats: 0.5 },
      { name: 'Leche semi-desnatada', quantity: 250, unit: 'ml', calories: 125, protein: 8, carbs: 12, fats: 4 },
      { name: 'Avena', quantity: 20, unit: 'g', calories: 78, protein: 3, carbs: 14, fats: 1.5 },
      { name: 'Canela y cacao sin azúcar', quantity: 1, unit: 'pizca', calories: 3, protein: 0, carbs: 1, fats: 0 },
      { name: 'Pan integral', quantity: 2, unit: 'rebanadas', calories: 140, protein: 6, carbs: 24, fats: 2 },
      { name: 'Queso fresco batido 0%', quantity: 30, unit: 'g', calories: 21, protein: 4, carbs: 1, fats: 0 },
    ],
    calories: 470,
    protein: 46,
  },
]

// Weekly meal plan
const dailyPlans: DayMealPlan[] = [
  {
    id: 'monday-plan',
    day: 'monday',
    breakfast: [breakfastOptions[0]], // Post-workout shake
    lunch: [lunchOptions[0]], // Pollo Air Fryer
    dinner: [dinnerOptions[0], dinnerOptions[1]], // Options
    totalCalories: 1359,
    totalProtein: 156,
    createdAt: '2025-01-30T00:00:00Z',
    updatedAt: '2025-01-30T00:00:00Z',
  },
  {
    id: 'tuesday-plan',
    day: 'tuesday',
    breakfast: [breakfastOptions[1]], // Normal breakfast
    lunch: [lunchOptions[1]], // Ternera con patatas
    dinner: dinnerOptions,
    totalCalories: 1360,
    totalProtein: 152,
    createdAt: '2025-01-30T00:00:00Z',
    updatedAt: '2025-01-30T00:00:00Z',
  },
  {
    id: 'wednesday-plan',
    day: 'wednesday',
    breakfast: [breakfastOptions[0]], // Post-workout shake
    lunch: [lunchOptions[2]], // Pollo con arroz
    dinner: dinnerOptions,
    totalCalories: 1568,
    totalProtein: 161,
    createdAt: '2025-01-30T00:00:00Z',
    updatedAt: '2025-01-30T00:00:00Z',
  },
  {
    id: 'thursday-plan',
    day: 'thursday',
    breakfast: [breakfastOptions[1]], // Normal breakfast
    lunch: [lunchOptions[0]], // Pollo Air Fryer
    dinner: dinnerOptions,
    totalCalories: 1367,
    totalProtein: 158,
    createdAt: '2025-01-30T00:00:00Z',
    updatedAt: '2025-01-30T00:00:00Z',
  },
  {
    id: 'friday-plan',
    day: 'friday',
    breakfast: [breakfastOptions[0]], // Post-workout shake
    lunch: [lunchOptions[1]], // Ternera con patatas
    dinner: dinnerOptions,
    totalCalories: 1453,
    totalProtein: 169,
    createdAt: '2025-01-30T00:00:00Z',
    updatedAt: '2025-01-30T00:00:00Z',
  },
  {
    id: 'saturday-plan',
    day: 'saturday',
    breakfast: [breakfastOptions[1]], // Normal breakfast
    lunch: [lunchOptions[2]], // Pollo con arroz
    dinner: dinnerOptions,
    totalCalories: 1480,
    totalProtein: 150,
    createdAt: '2025-01-30T00:00:00Z',
    updatedAt: '2025-01-30T00:00:00Z',
  },
  {
    id: 'sunday-plan',
    day: 'sunday',
    breakfast: [breakfastOptions[1]], // Normal breakfast
    lunch: [lunchOptions[0]], // Pollo Air Fryer
    dinner: dinnerOptions,
    totalCalories: 1367,
    totalProtein: 158,
    createdAt: '2025-01-30T00:00:00Z',
    updatedAt: '2025-01-30T00:00:00Z',
  },
]

// Shopping list from original project
const shoppingList: ShoppingItem[] = [
  // Proteins
  { category: 'proteins', name: '1kg pechuga pollo', quantity: '1kg', estimated: false },
  { category: 'proteins', name: '500g solomillo ternera', quantity: '500g', estimated: false },
  { category: 'proteins', name: '500g lomo cerdo magro', quantity: '500g', estimated: false },
  { category: 'proteins', name: 'Huevos', quantity: '12 unidades', estimated: false },
  { category: 'proteins', name: 'Fiambre pavo/pollo', quantity: '200g', estimated: false },
  { category: 'proteins', name: 'Proteína PBN', quantity: '1 bote', estimated: false },

  // Vegetables
  { category: 'vegetables', name: 'Ensalada bolsa', quantity: '3 bolsas', estimated: false },
  { category: 'vegetables', name: 'Tomates grandes', quantity: '1.5kg', estimated: false },
  { category: 'vegetables', name: 'Tomate cherry', quantity: '500g', estimated: false },
  { category: 'vegetables', name: 'Pepinos', quantity: '3 unidades', estimated: false },
  { category: 'vegetables', name: 'Cebollas grandes', quantity: '1kg', estimated: false },
  { category: 'vegetables', name: 'Cebolletas', quantity: '1 manojo', estimated: false },
  { category: 'vegetables', name: 'Ajos frescos', quantity: '2 cabezas', estimated: false },
  { category: 'vegetables', name: 'Pimientos rojos', quantity: '500g', estimated: false },
  { category: 'vegetables', name: 'Patatas', quantity: '1kg', estimated: false },
  { category: 'vegetables', name: 'Batatas', quantity: '1kg', estimated: false },
  { category: 'vegetables', name: 'Brócoli', quantity: '500g', estimated: false },

  // Grains
  { category: 'grains', name: 'Pan integral', quantity: '2 barras', estimated: false },
  { category: 'grains', name: 'Arroz', quantity: '1kg', estimated: false },
  { category: 'grains', name: 'Avena', quantity: '500g', estimated: false },

  // Dairy
  { category: 'dairy', name: 'Leche semi-desnatada', quantity: '2L', estimated: false },
  { category: 'dairy', name: 'Queso fresco batido 0%', quantity: '500g', estimated: false },

  // Pantry
  { category: 'pantry', name: 'Aceite oliva extra virgen', quantity: '500ml', estimated: false },
  { category: 'pantry', name: 'Vinagre de Jerez', quantity: '250ml', estimated: false },
  { category: 'pantry', name: 'Sal marina', quantity: '1 paquete', estimated: true },
  { category: 'pantry', name: 'Pimienta negra molida', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Ajo en polvo', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Pimentón dulce', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Comino molido', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Cúrcuma', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Azafrán en hebras', quantity: '1 sobre', estimated: false },
  { category: 'pantry', name: 'Romero seco', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Tomillo seco', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Orégano seco', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Hierbas provenzales', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Canela molida', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Cacao en polvo sin azúcar', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Hoja de laurel', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Guindilla seca', quantity: '1 bolsa', estimated: false },
  { category: 'pantry', name: 'Mostaza de Dijon', quantity: '1 bote', estimated: false },
  { category: 'pantry', name: 'Caldo de pollo bajo en sal', quantity: '1L', estimated: false },
  { category: 'pantry', name: 'Albahaca fresca', quantity: '1 maceta', estimated: false },
]

export const defaultWeeklyMealPlan: WeeklyMealPlan = {
  id: 'weekly-plan-2025',
  name: 'Plan Semanal Déficit 300-400 cal',
  description: 'Plan alimenticio diseñado para déficit calórico con alto contenido proteico',
  days: dailyPlans,
  shoppingList,
  prepTips: [
    'Prep Domingo (1 hora): Pollo a la plancha → guarda tuppers',
    'Verduras lavadas y cortadas',
    'Huevos duros (x6)',
    'Ensalada bolsa (no lavar lechuga)',
    'Zanahoria rallada (bolsa)',
    'Tomate cherry (no cortar)',
  ],
  createdAt: '2025-01-30T00:00:00Z',
  updatedAt: '2025-01-30T00:00:00Z',
}