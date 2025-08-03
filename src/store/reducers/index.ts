import { AppState, AppAction } from '@/store'
import { userReducer } from './userReducer'
import { trainingReducer } from './trainingReducer'
import { nutritionReducer } from './nutritionReducer'
import { progressReducer } from './progressReducer'
import { themeReducer } from './themeReducer'
import { notificationReducer } from './notificationReducer'

export const appReducer = (state: AppState, action: AppAction): AppState => {
  // Handle global actions first
  switch (action.type) {
    case 'APP_RESET':
      return {
        ...state,
        user: userReducer(state.user, { type: 'USER_RESET' }),
        training: trainingReducer(state.training, { type: 'TRAINING_RESET' }),
        nutrition: nutritionReducer(state.nutrition, { type: 'NUTRITION_RESET' }),
        progress: progressReducer(state.progress, { type: 'PROGRESS_RESET' }),
        notifications: [],
      }

    case 'APP_HYDRATE':
      return {
        ...state,
        ...action.payload,
      }

    default:
      // Pass actions to domain-specific reducers
      return {
        ...state,
        user: userReducer(state.user, action),
        training: trainingReducer(state.training, action),
        nutrition: nutritionReducer(state.nutrition, action),
        progress: progressReducer(state.progress, action),
        theme: themeReducer(state.theme, action),
        notifications: notificationReducer(state.notifications, action),
      }
  }
}