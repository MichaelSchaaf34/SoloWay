import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { DarkModeProvider } from './context/DarkModeContext'
import { AuthProvider } from './context/AuthContext'
import { TripProvider } from './context/TripContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <DarkModeProvider>
        <TripProvider>
          <App />
        </TripProvider>
      </DarkModeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
