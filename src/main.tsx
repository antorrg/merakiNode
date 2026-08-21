import React from 'react'
import ReactDOM from 'react-dom/client'
//import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/main.scss'
import { AuthProvider } from './context/AuthContext'
import { BrandProvider } from './context/BrandContext'
import { GlobalToaster } from './shared/components/toast/GlobalToaster'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrandProvider>
      <AuthProvider>
        <GlobalToaster />
        <App />
      </AuthProvider>
    </BrandProvider>
  </React.StrictMode>,
)

// Use contextBridge via secure window.api
window.api.on('main-process-message', (message) => {
  console.log(message)
})

