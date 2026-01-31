import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { FullscreenAlert } from './pages/FullscreenAlert'
import { SplashScreen } from './pages/SplashScreen'
import { LanguageProvider } from './i18n/LanguageContext'

import './index.css'

// Main app with splash screen
function MainApp() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} minimumDuration={6000} />
  }

  return <App />
}

// Simple hash-based routing
function Router() {
  const hash = window.location.hash

  // Alert window route
  if (hash === '#/alert') {
    return <FullscreenAlert />
  }

  // Main app (default) - with splash screen
  return <MainApp />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <Router />
    </LanguageProvider>
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
