import { UserState, UserAction } from '@/domains/user/types'
import { AppAction } from '@/store'

export const userReducer = (state: UserState, action: AppAction): UserState => {
  if (!isUserAction(action)) return state

  switch (action.type) {
    case 'USER_PROFILE_UPDATE':
      return {
        ...state,
        profile: state.profile 
          ? { ...state.profile, ...action.payload, updatedAt: new Date().toISOString() }
          : null,
        error: null,
      }

    case 'USER_PREFERENCES_UPDATE':
      return {
        ...state,
        profile: state.profile 
          ? { 
              ...state.profile, 
              preferences: { ...state.profile.preferences, ...action.payload },
              updatedAt: new Date().toISOString(),
            }
          : null,
        error: null,
      }

    case 'USER_STATS_UPDATE':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
        error: null,
      }

    case 'USER_RESET':
      return {
        profile: null,
        stats: {
          totalWorkouts: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalVolume: 0,
          averageWorkoutDuration: 0,
        },
        isLoading: false,
        error: null,
      }

    default:
      return state
  }
}

// Type guard to check if action is a user action
function isUserAction(action: AppAction): action is UserAction {
  return action.type.startsWith('USER_')
}