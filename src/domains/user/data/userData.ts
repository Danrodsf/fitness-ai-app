import { UserProfile } from '../types'

export const defaultUserProfile: UserProfile = {
  id: 'user-default',
  name: 'Nuevo Usuario',
  age: 25,
  weight: 70,
  height: 170,
  goals: [],
  preferences: {
    theme: 'system',
    notifications: true,
    autoBackup: true,
    language: 'es',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}