export interface AuthUser {
  id: string
  email: string
  created_at: string
  email_confirmed_at?: string
}

export interface UserProfile {
  id: string
  user_id: string
  name: string
  age: number
  weight: number
  height: number
  goals: string[]
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    autoBackup: boolean
    language: string
    onboardingCompleted?: boolean
    onboardingData?: any
    aiPlans?: any
    aiPlansGeneratedAt?: string
  }
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string
}

export interface ProfileUpdateData {
  name?: string
  age?: number
  weight?: number
  height?: number
  goals?: string[]
  preferences?: {
    theme?: 'light' | 'dark' | 'system'
    notifications?: boolean
    autoBackup?: boolean
    language?: string
    onboardingCompleted?: boolean
    onboardingData?: any
    aiPlans?: any
    aiPlansGeneratedAt?: string
  }
}