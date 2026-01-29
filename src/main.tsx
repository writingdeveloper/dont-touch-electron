import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { FullscreenAlert } from './pages/FullscreenAlert'
import { LanguageProvider } from './i18n/LanguageContext'

import './index.css'

// Simple hash-based routing
function Router() {
  const hash = window.location.hash

  // Alert window route
  if (hash === '#/alert') {
    return <FullscreenAlert />
  }

  // Main app (default)
  return <App />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <Router />
    </LanguageProvider>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
