import { BaseEntity } from '@/shared/types/common'

export interface NutritionGoals {
  dailyCalories: number
  dailyProtein: number
  dailyCarbs?: number
  dailyFats?: number
  calorieDeficit?: number
}

export interface Meal extends BaseEntity {
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: FoodItem[]
  calories: number
  protein: number
  carbs: number
  fats: number
  prepTime: number
  instructions: string[]
  tags: string[]
}

export interface FoodItem {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fats: number
}

export interface MealOption {
  title: string
  description?: string
  prepTime: number
  recipe?: string
  foods: FoodItem[]
  calories: number
  protein: number
}

export interface DayMealPlan extends BaseEntity {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  breakfast: MealOption[]
  lunch: MealOption[]
  dinner: MealOption[]
  snacks?: MealOption[]
  totalCalories: number
  totalProtein: number
}

export interface WeeklyMealPlan extends BaseEntity {
  name: string
  description: string
  days: DayMealPlan[]
  shoppingList: ShoppingItem[]
  prepTips: string[]
}

export interface ShoppingItem {
  category: 'proteins' | 'vegetables' | 'grains' | 'dairy' | 'pantry'
  name: string
  quantity: string
  estimated: boolean
}

export interface ProteinShake {
  timing: 'post-workout' | 'between-meals' | 'dinner-replacement'
  scoops: number
  liquid: string
  liquidAmount: number
  extras?: string[]
  calories: number
  protein: number
}

export interface NutritionEntry extends BaseEntity {
  date: string
  meals: Meal[]
  proteinShakes: ProteinShake[]
  totalCalories: number
  totalProtein: number
  waterIntake: number
  notes?: string
}

// Nutrition domain actions
export type NutritionAction = 
  | { type: 'NUTRITION_GOALS_UPDATE'; payload: NutritionGoals }
  | { type: 'MEAL_PLAN_LOAD'; payload: WeeklyMealPlan }
  | { type: 'DAILY_INTAKE_LOG'; payload: NutritionEntry }
  | { type: 'PROTEIN_SHAKE_LOG'; payload: { date: string; shake: ProteinShake } }
  | { type: 'WATER_INTAKE_UPDATE'; payload: { date: string; amount: number } }
  | { type: 'NUTRITION_RESET' }

export interface NutritionState {
  goals: NutritionGoals | null
  weeklyPlan: WeeklyMealPlan | null
  dailyEntries: NutritionEntry[]
  currentDay: DayMealPlan | null
  isLoading: boolean
  error: string | null
}