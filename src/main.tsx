// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from '@/store/AppProvider'
import { AuthProvider } from '@/domains/auth/hooks/useAuth'
import { App } from './App'
import './styles/globals.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  // <StrictMode>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
 // </StrictMode>
)