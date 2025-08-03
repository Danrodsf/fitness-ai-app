// Shared types across all domains
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface NotificationPayload {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ActionBase {
  type: string
  payload?: unknown
}

export type AsyncActionStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T = unknown> {
  data: T | null
  status: AsyncActionStatus
  error: string | null
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeState {
  mode: ThemeMode
  isDark: boolean
}