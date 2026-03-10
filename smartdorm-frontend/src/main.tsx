import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './style.css'

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || ''
const hasValidGoogleId = !!googleClientId && googleClientId.includes('.apps.googleusercontent.com')

const AppWithProviders = () => (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    {hasValidGoogleId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppWithProviders />
      </GoogleOAuthProvider>
    ) : (
      <AppWithProviders />
    )}
  </React.StrictMode>
)
