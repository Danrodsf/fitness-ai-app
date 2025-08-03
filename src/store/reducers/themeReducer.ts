import { ThemeState } from '@/shared/types/common'
import { AppAction } from '@/store'

export const themeReducer = (state: ThemeState, action: AppAction): ThemeState => {
  switch (action.type) {
    case 'THEME_TOGGLE':
      const newMode = state.mode === 'light' ? 'dark' : state.mode === 'dark' ? 'light' : 'light'
      const newIsDark = newMode === 'dark'
      
      return {
        ...state,
        mode: newMode,
        isDark: newIsDark,
      }

    case 'THEME_SET':
      const isDarkMode = action.payload === 'dark' || 
        (action.payload === 'system' && 
         typeof window !== 'undefined' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)
      
      return {
        ...state,
        mode: action.payload,
        isDark: isDarkMode,
      }

    default:
      return state
  }
}