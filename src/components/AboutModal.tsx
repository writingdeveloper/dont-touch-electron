import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

interface AboutModalProps {
  onClose: () => void
}

interface VersionInfo {
  update: boolean
  version: string
  newVersion?: string
}

interface ProgressInfo {
  percent: number
  bytesPerSecond?: number
  transferred?: number
  total?: number
}

const GITHUB_URL = 'https://github.com/writingdeveloper/dont-touch-electron'

export function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()
  const [version, setVersion] = useState('...')

  // Update states
  const [checking, setChecking] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState<boolean | null>(null)
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [downloadComplete, setDownloadComplete] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  useEffect(() => {
    window.appInfo?.getVersion().then(setVersion).catch(() => setVersion('1.0.0'))
  }, [])

  const openExternal = (url: string) => {
    window.ipcRenderer?.invoke('open-external', url)
  }

  // Check for updates
  const checkForUpdates = async () => {
    setChecking(true)
    setUpdateError(null)
    setUpdateAvailable(null)

    try {
      const result = await window.ipcRenderer?.invoke('check-update')
      if (result?.error) {
        setUpdateError(result.message || t.updateError)
        setUpdateAvailable(false)
      }
    } catch (err) {
      setUpdateError(t.updateError)
      setUpdateAvailable(false)
    } finally {
      setChecking(false)
    }
  }

  // Start download
  const startDownload = () => {
    setDownloading(true)
    setDownloadProgress(0)
    window.ipcRenderer?.invoke('start-download')
  }

  // Install update
  const installUpdate = () => {
    window.ipcRenderer?.invoke('quit-and-install')
  }

  // IPC event handlers
  const onUpdateCanAvailable = useCallback((_event: Electron.IpcRendererEvent, arg: VersionInfo) => {
    setChecking(false)
    setVersionInfo(arg)
    setUpdateAvailable(arg.update)
  }, [])

  const onUpdateError = useCallback((_event: Electron.IpcRendererEvent, arg: { message: string }) => {
    setUpdateError(arg.message)
    setDownloading(false)
  }, [])

  const onDownloadProgress = useCallback((_event: Electron.IpcRendererEvent, arg: ProgressInfo) => {
    setDownloadProgress(arg.percent || 0)
  }, [])

  const onUpdateDownloaded = useCallback(() => {
    setDownloading(false)
    setDownloadComplete(true)
    setDownloadProgress(100)
  }, [])

  useEffect(() => {
    window.ipcRenderer?.on('update-can-available', onUpdateCanAvailable)
    window.ipcRenderer?.on('update-error', onUpdateError)
    window.ipcRenderer?.on('download-progress', onDownloadProgress)
    window.ipcRenderer?.on('update-downloaded', onUpdateDownloaded)

    return () => {
      window.ipcRenderer?.off('update-can-available', onUpdateCanAvailable)
      window.ipcRenderer?.off('update-error', onUpdateError)
      window.ipcRenderer?.off('download-progress', onDownloadProgress)
      window.ipcRenderer?.off('update-downloaded', onUpdateDownloaded)
    }
  }, [onUpdateCanAvailable, onUpdateError, onDownloadProgress, onUpdateDownloaded])

  const renderUpdateSection = () => {
    // Downloading state
    if (downloading) {
      return (
        <div className="update-status downloading">
          <div className="update-progress-bar">
            <div className="progress-fill" style={{ width: `${downloadProgress}%` }} />
          </div>
          <span className="update-text">{t.updateDownloading} {downloadProgress.toFixed(0)}%</span>
        </div>
      )
    }

    // Download complete - ready to install
    if (downloadComplete) {
      return (
        <div className="update-status ready">
          <span className="update-text">{t.updateAvailable}</span>
          <div className="update-buttons">
            <button className="update-btn install" onClick={installUpdate}>
              {t.updateInstall}
            </button>
            <button className="update-btn later" onClick={onClose}>
              {t.updateLater}
            </button>
          </div>
        </div>
      )
    }

    // Update available
    if (updateAvailable && versionInfo) {
      return (
        <div className="update-status available">
          <div className="version-info">
            <span className="version-badge current">
              {t.updateCurrent}: v{versionInfo.version}
            </span>
            <span className="version-arrow">→</span>
            <span className="version-badge new">
              {t.updateNew}: v{versionInfo.newVersion}
            </span>
          </div>
          <button className="update-btn download" onClick={startDownload}>
            {t.updateDownload}
          </button>
        </div>
      )
    }

    // No update available
    if (updateAvailable === false && !updateError) {
      return (
        <div className="update-status up-to-date">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          <span className="update-text">{t.updateNotAvailable}</span>
        </div>
      )
    }

    // Error state
    if (updateError) {
      return (
        <div className="update-status error">
          <span className="update-text">{updateError}</span>
          <button className="update-btn check" onClick={checkForUpdates}>
            {t.updateCheck}
          </button>
        </div>
      )
    }

    // Default - check button
    return (
      <button
        className="update-btn check"
        onClick={checkForUpdates}
        disabled={checking}
      >
        {checking ? (
          <>
            <span className="spinner" />
            {t.updateChecking}
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            {t.updateCheck}
          </>
        )}
      </button>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="about-header">
          <span className="about-icon">🛡️</span>
          <h2>{t.appTitle}</h2>
          <span className="version">v{version}</span>
        </div>

        <div className="about-content">
          {/* Update Section */}
          <div className="about-section update-section">
            <h4>{t.updateTitle || 'Software Update'}</h4>
            {renderUpdateSection()}
          </div>

          <p className="about-desc">
            {t.aboutDescription || 'AI-powered face touch detection app to help overcome habits like trichotillomania and skin picking.'}
          </p>

          <div className="about-section">
            <h4>{t.aboutFeatures || 'Features'}</h4>
            <ul>
              <li>{t.aboutFeature1 || 'Real-time face & hand detection'}</li>
              <li>{t.aboutFeature2 || 'Customizable detection zones'}</li>
              <li>{t.aboutFeature3 || 'Daily statistics & streak tracking'}</li>
              <li>{t.aboutFeature4 || 'Guided meditation'}</li>
            </ul>
          </div>

          <div className="about-section">
            <h4>{t.aboutTech || 'Technology'}</h4>
            <div className="tech-badges">
              <span className="tech-badge">Electron</span>
              <span className="tech-badge">React</span>
              <span className="tech-badge">MediaPipe</span>
              <span className="tech-badge">TypeScript</span>
            </div>
          </div>

          <div className="about-section privacy-section">
            <h4>{t.aboutPrivacy || 'Privacy & Data Protection'}</h4>
            <p className="privacy-text">
              {t.aboutPrivacyText || 'All video processing occurs locally on your device. No images, videos, or personal data are collected, stored, or transmitted to external servers.'}
            </p>
            <div className="privacy-badges">
              <span className="privacy-badge">🔒 {t.aboutLocalOnly || 'Local Processing'}</span>
              <span className="privacy-badge">🛡️ {t.aboutNoData || 'No Data Collection'}</span>
            </div>
            <p className="compliance-text">
              {t.aboutCompliance || 'Compliant with GDPR (EU), CCPA (California), PIPEDA (Canada), and international privacy regulations.'}
            </p>
          </div>

          <div className="about-section opensource-section">
            <h4>{t.aboutOpenSource || 'Open Source'}</h4>
            <p className="opensource-text">
              {t.aboutOpenSourceText || 'This project is open source. View the source code, report issues, or contribute on GitHub.'}
            </p>
          </div>

          <div className="about-footer">
            <p className="copyright">© {currentYear} Don't Touch</p>
            <a
              href={GITHUB_URL}
              className="github-link"
              onClick={(e) => {
                e.preventDefault()
                openExternal(GITHUB_URL)
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(8px);
          }

          .about-modal {
            background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(0, 255, 255, 0.15);
            border-radius: 16px;
            width: 400px;
            max-height: 85vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
          }

          .close-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            background: none;
            border: none;
            color: #666;
            font-size: 24px;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
          }

          .about-header {
            text-align: center;
            padding: 28px 24px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .about-icon {
            font-size: 52px;
            display: block;
            margin-bottom: 10px;
          }

          .about-header h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(90deg, #00ffff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .version {
            display: inline-block;
            margin-top: 10px;
            padding: 5px 14px;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.25);
            border-radius: 14px;
            font-size: 12px;
            font-weight: 500;
            color: #00ffff;
          }

          .about-content {
            padding: 20px 24px 24px;
          }

          .about-desc {
            font-size: 13px;
            color: #b0b0b0;
            line-height: 1.6;
            margin: 0 0 20px;
            text-align: center;
          }

          .about-section {
            margin-bottom: 18px;
          }

          .about-section h4 {
            margin: 0 0 10px;
            font-size: 11px;
            font-weight: 600;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1.2px;
          }

          .about-section ul {
            margin: 0;
            padding: 0 0 0 18px;
            font-size: 12px;
            color: #ccc;
            line-height: 1.7;
          }

          .about-section li {
            margin-bottom: 4px;
          }

          /* Update Section Styles */
          .update-section {
            background: rgba(0, 255, 255, 0.05);
            border: 1px solid rgba(0, 255, 255, 0.15);
            border-radius: 10px;
            padding: 14px;
            margin-bottom: 20px;
          }

          .update-section h4 {
            color: #00ffff;
            margin-bottom: 12px;
          }

          .update-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .update-btn.check {
            width: 100%;
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.3);
            color: #00ffff;
          }

          .update-btn.check:hover:not(:disabled) {
            background: rgba(0, 255, 255, 0.2);
          }

          .update-btn.check:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .update-btn.download {
            background: rgba(0, 255, 136, 0.2);
            border: 1px solid rgba(0, 255, 136, 0.4);
            color: #00ff88;
          }

          .update-btn.download:hover {
            background: rgba(0, 255, 136, 0.3);
          }

          .update-btn.install {
            background: rgba(0, 255, 136, 0.3);
            border: 1px solid #00ff88;
            color: #00ff88;
          }

          .update-btn.install:hover {
            background: rgba(0, 255, 136, 0.4);
          }

          .update-btn.later {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #888;
          }

          .update-btn.later:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #ccc;
          }

          .update-status {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .update-status.up-to-date {
            flex-direction: row;
            align-items: center;
            justify-content: center;
            color: #00ff88;
            font-size: 13px;
            gap: 8px;
          }

          .update-status.error {
            align-items: center;
          }

          .update-status.error .update-text {
            color: #ff6b6b;
            font-size: 12px;
            text-align: center;
          }

          .update-status.available {
            align-items: center;
          }

          .update-status.ready .update-text {
            text-align: center;
            color: #00ff88;
            font-size: 13px;
          }

          .update-buttons {
            display: flex;
            gap: 10px;
            width: 100%;
          }

          .update-buttons .update-btn {
            flex: 1;
          }

          .version-info {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 4px;
          }

          .version-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
          }

          .version-badge.current {
            background: rgba(255, 255, 255, 0.1);
            color: #888;
          }

          .version-badge.new {
            background: rgba(0, 255, 136, 0.2);
            color: #00ff88;
          }

          .version-arrow {
            color: #555;
          }

          .update-progress-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
          }

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ffff, #00ff88);
            border-radius: 3px;
            transition: width 0.3s ease;
          }

          .update-status.downloading .update-text {
            text-align: center;
            color: #00ffff;
            font-size: 12px;
          }

          .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(0, 255, 255, 0.2);
            border-top-color: #00ffff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .tech-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .tech-badge {
            padding: 5px 12px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            font-size: 11px;
            font-weight: 500;
            color: #aaa;
          }

          .privacy-section {
            background: rgba(0, 255, 136, 0.05);
            border: 1px solid rgba(0, 255, 136, 0.15);
            border-radius: 10px;
            padding: 14px;
          }

          .privacy-section h4 {
            color: #00ff88;
            margin-bottom: 8px;
          }

          .privacy-text {
            font-size: 11px;
            color: #a0a0a0;
            line-height: 1.6;
            margin: 0 0 10px;
          }

          .privacy-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
          }

          .privacy-badge {
            padding: 4px 10px;
            background: rgba(0, 255, 136, 0.1);
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
            color: #00ff88;
          }

          .compliance-text {
            font-size: 10px;
            color: #777;
            line-height: 1.5;
            margin: 0;
            font-style: italic;
          }

          .opensource-section {
            background: rgba(100, 100, 255, 0.05);
            border: 1px solid rgba(100, 100, 255, 0.15);
            border-radius: 10px;
            padding: 14px;
          }

          .opensource-section h4 {
            color: #8888ff;
          }

          .opensource-text {
            font-size: 11px;
            color: #a0a0a0;
            line-height: 1.6;
            margin: 0;
          }

          .about-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }

          .copyright {
            margin: 0;
            font-size: 11px;
            color: #555;
          }

          .github-link {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #888;
            text-decoration: none;
            font-size: 12px;
            padding: 6px 12px;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .github-link:hover {
            color: #fff;
            background: rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </div>
    </div>
  )
}
