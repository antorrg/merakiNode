import React from 'react'
import ReactDOM from 'react-dom/client'
//import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/main.scss'
import { AuthProvider } from './context/AuthContext'
import { GlobalToaster } from './shared/components/toast/GlobalToaster'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
        <GlobalToaster />
        <App />
    </AuthProvider>
  </React.StrictMode>,
)

// Use contextBridge via secure window.api
window.api.on('main-process-message', (message) => {
  console.log(message)
})

