import { NutritionState, NutritionAction } from '@/domains/nutrition/types'
import { AppAction } from '@/store'

export const nutritionReducer = (state: NutritionState, action: AppAction): NutritionState => {
  if (!isNutritionAction(action)) return state

  switch (action.type) {
    case 'NUTRITION_GOALS_UPDATE':
      return {
        ...state,
        goals: action.payload,
        error: null,
      }

    case 'MEAL_PLAN_LOAD':
      return {
        ...state,
        weeklyPlan: action.payload,
        isLoading: false,
        error: null,
      }

    case 'DAILY_INTAKE_LOG':
      const existingEntryIndex = state.dailyEntries.findIndex(
        entry => entry.date === action.payload.date
      )

      let updatedEntries
      if (existingEntryIndex >= 0) {
        updatedEntries = [...state.dailyEntries]
        updatedEntries[existingEntryIndex] = action.payload
      } else {
        updatedEntries = [action.payload, ...state.dailyEntries]
      }

      return {
        ...state,
        dailyEntries: updatedEntries,
        error: null,
      }

    case 'PROTEIN_SHAKE_LOG':
      const entryIndex = state.dailyEntries.findIndex(
        entry => entry.date === action.payload.date
      )

      if (entryIndex >= 0) {
        const updatedEntry = {
          ...state.dailyEntries[entryIndex],
          proteinShakes: [...state.dailyEntries[entryIndex].proteinShakes, action.payload.shake],
          totalProtein: state.dailyEntries[entryIndex].totalProtein + action.payload.shake.protein,
          totalCalories: state.dailyEntries[entryIndex].totalCalories + action.payload.shake.calories,
          updatedAt: new Date().toISOString(),
        }

        const newEntries = [...state.dailyEntries]
        newEntries[entryIndex] = updatedEntry

        return {
          ...state,
          dailyEntries: newEntries,
          error: null,
        }
      }

      // Create new entry if doesn't exist
      const newEntry = {
        id: `entry-${Date.now()}`,
        date: action.payload.date,
        meals: [],
        proteinShakes: [action.payload.shake],
        totalCalories: action.payload.shake.calories,
        totalProtein: action.payload.shake.protein,
        waterIntake: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        ...state,
        dailyEntries: [newEntry, ...state.dailyEntries],
        error: null,
      }

    case 'WATER_INTAKE_UPDATE':
      const waterEntryIndex = state.dailyEntries.findIndex(
        entry => entry.date === action.payload.date
      )

      if (waterEntryIndex >= 0) {
        const updatedWaterEntry = {
          ...state.dailyEntries[waterEntryIndex],
          waterIntake: action.payload.amount,
          updatedAt: new Date().toISOString(),
        }

        const newWaterEntries = [...state.dailyEntries]
        newWaterEntries[waterEntryIndex] = updatedWaterEntry

        return {
          ...state,
          dailyEntries: newWaterEntries,
          error: null,
        }
      }

      return state

    case 'NUTRITION_RESET':
      return {
        goals: null,
        weeklyPlan: null,
        dailyEntries: [],
        currentDay: null,
        isLoading: false,
        error: null,
      }

    default:
      return state
  }
}

// Type guard to check if action is a nutrition action
function isNutritionAction(action: AppAction): action is NutritionAction {
  return action.type.startsWith('NUTRITION_') || 
         action.type.startsWith('MEAL_') || 
         action.type.startsWith('DAILY_') ||
         action.type.startsWith('PROTEIN_') ||
         action.type.startsWith('WATER_')
}