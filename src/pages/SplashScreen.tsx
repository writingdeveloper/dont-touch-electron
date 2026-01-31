import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import './SplashScreen.css'

interface SplashScreenProps {
  onComplete: () => void
  minimumDuration?: number // in milliseconds
}

export function SplashScreen({ onComplete, minimumDuration = 6000 }: SplashScreenProps) {
  const { t } = useLanguage()
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [updateCheckFailed, setUpdateCheckFailed] = useState(false)
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    window.appInfo?.getVersion().then(setAppVersion).catch(() => {})
  }, [])

  useEffect(() => {
    const startTime = Date.now()
    let resourcesLoaded = false

    // Loading stages
    const stages = [
      { progress: 10, text: t.splashCheckingUpdates || 'Checking for updates...' },
      { progress: 30, text: t.splashLoadingResources || 'Loading resources...' },
      { progress: 50, text: t.splashInitializingDetection || 'Initializing detection model...' },
      { progress: 70, text: t.splashPreparingInterface || 'Preparing interface...' },
      { progress: 90, text: t.splashAlmostReady || 'Almost ready...' },
      { progress: 100, text: t.splashComplete || 'Complete!' },
    ]

    let currentStage = 0

    // Progress through stages
    const progressInterval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress)
        setStatusText(stages[currentStage].text)
        currentStage++
      }
    }, minimumDuration / stages.length)

    // Check for update in background (non-blocking)
    window.ipcRenderer?.invoke('check-update-silent').then((result: { checked: boolean; reason?: string }) => {
      if (!result.checked) {
        setUpdateCheckFailed(true)
      }
    }).catch(() => {
      setUpdateCheckFailed(true)
    })

    // Mark resources as loaded after initial setup
    const loadTimeout = setTimeout(() => {
      resourcesLoaded = true
      checkCompletion()
    }, minimumDuration * 0.8)

    // Ensure minimum duration before completing
    const minDurationTimeout = setTimeout(() => {
      setIsReady(true)
      checkCompletion()
    }, minimumDuration)

    function checkCompletion() {
      const elapsed = Date.now() - startTime
      if (elapsed >= minimumDuration && resourcesLoaded) {
        setProgress(100)
        setStatusText(stages[stages.length - 1].text)

        // Small delay for visual feedback
        setTimeout(() => {
          onComplete()
        }, 300)
      }
    }

    return () => {
      clearInterval(progressInterval)
      clearTimeout(loadTimeout)
      clearTimeout(minDurationTimeout)
    }
  }, [minimumDuration, onComplete, t])

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <span className="splash-icon">🛡️</span>
          <h1 className="splash-title">{t.appTitle || "Don't Touch"}</h1>
        </div>

        <div className="splash-progress-container">
          <div className="splash-progress-bar">
            <div
              className="splash-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="splash-status">
          {statusText}
          {updateCheckFailed && progress > 10 && (
            <span className="splash-update-failed"> ({t.splashUpdateCheckFailed || 'Update check failed'})</span>
          )}
        </p>
        </div>

        <p className="splash-version">
          {appVersion ? `v${appVersion}` : (t.splashLoading || 'Loading...')}
        </p>
      </div>
    </div>
  )
}
