import { AppAction } from '@/store'

type NotificationState = Array<{
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timestamp: string
}>

export const notificationReducer = (state: NotificationState, action: AppAction): NotificationState => {
  switch (action.type) {
    case 'NOTIFICATION_ADD':
      const newNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
        timestamp: new Date().toISOString(),
      }

      // Keep only the last 10 notifications
      return [newNotification, ...state].slice(0, 10)

    case 'NOTIFICATION_REMOVE':
      return state.filter(notification => notification.id !== action.payload.id)

    default:
      return state
  }
}