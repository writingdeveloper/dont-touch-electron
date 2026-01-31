import { RefObject, useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { Language } from '../i18n/translations'
import { DetectionOverlay } from './DetectionOverlay'

interface VideoPreviewProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  isRunning: boolean
  faceLandmarksCount?: number | null
  handsCount?: number
  hidePreview?: boolean
}

// Map language codes to locale codes
const languageToLocale: Record<Language, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
  zh: 'zh-CN',
  es: 'es-ES',
  ru: 'ru-RU',
}

export function VideoPreview({ videoRef, canvasRef, isRunning, faceLandmarksCount = null, handsCount = 0, hidePreview = false }: VideoPreviewProps) {
  const { t, language } = useLanguage()
  const [currentTime, setCurrentTime] = useState('')

  const formatDateTime = useCallback((date: Date) => {
    const locale = languageToLocale[language]

    // Format date and time according to locale with full details
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: language === 'en' || language === 'es', // 12-hour format for EN/ES
    }

    const formattedDate = date.toLocaleDateString(locale, dateOptions)
    const formattedTime = date.toLocaleTimeString(locale, timeOptions)

    return `${formattedDate} ${formattedTime}`
  }, [language])

  useEffect(() => {
    // Initialize immediately
    setCurrentTime(formatDateTime(new Date()))

    if (!isRunning) return

    const interval = setInterval(() => {
      setCurrentTime(formatDateTime(new Date()))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, formatDateTime])

  return (
    <div className="video-container">
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        autoPlay
        playsInline
        muted
        className={`video-preview ${isRunning ? 'active' : ''}`}
        style={hidePreview && isRunning ? { opacity: 0, position: 'absolute', pointerEvents: 'none' } : undefined}
      />
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        className="detection-overlay"
        style={hidePreview && isRunning ? { opacity: 0, position: 'absolute', pointerEvents: 'none' } : undefined}
      />

      {/* Hidden preview indicator */}
      {hidePreview && isRunning && (
        <div className="hidden-preview-indicator">
          <div className="hidden-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </div>
          <span className="hidden-text">{t.settingsHidePreview || 'Preview Hidden'}</span>
          <span className="hidden-hint">{t.statusMonitoring}</span>
        </div>
      )}

      {/* Tech overlay decorations */}
      {isRunning && !hidePreview && (
        <>
          <div className="corner-bracket top-left" />
          <div className="corner-bracket top-right" />
          <div className="corner-bracket bottom-left" />
          <div className="corner-bracket bottom-right" />
          <div className="timestamp">{currentTime}</div>
          <DetectionOverlay
            faceLandmarksCount={faceLandmarksCount}
            handsCount={handsCount}
            isRunning={isRunning}
          />
        </>
      )}

      {/* Detection info when preview is hidden */}
      {isRunning && hidePreview && (
        <DetectionOverlay
          faceLandmarksCount={faceLandmarksCount}
          handsCount={handsCount}
          isRunning={isRunning}
        />
      )}

      {!isRunning && (
        <div className="video-placeholder">
          <div className="camera-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <circle cx="12" cy="13" r="4" />
              <path d="M7 6V4a1 1 0 011-1h8a1 1 0 011 1v2" />
              <circle cx="12" cy="13" r="1.5" />
            </svg>
          </div>
          <span className="placeholder-title">{t.videoCameraOffline}</span>
          <p className="placeholder-hint">{t.videoInitialize}</p>
        </div>
      )}

      <style>{`
        .corner-bracket {
          position: absolute;
          width: 40px;
          height: 40px;
          z-index: 15;
          pointer-events: none;
        }

        .corner-bracket::before,
        .corner-bracket::after {
          content: '';
          position: absolute;
          background: #00ffff;
          opacity: 0.7;
        }

        .top-left {
          top: 15px;
          left: 15px;
        }
        .top-left::before {
          width: 3px;
          height: 100%;
          left: 0;
        }
        .top-left::after {
          width: 100%;
          height: 3px;
          top: 0;
        }

        .top-right {
          top: 15px;
          right: 15px;
        }
        .top-right::before {
          width: 3px;
          height: 100%;
          right: 0;
        }
        .top-right::after {
          width: 100%;
          height: 3px;
          top: 0;
        }

        .bottom-left {
          bottom: 15px;
          left: 15px;
        }
        .bottom-left::before {
          width: 3px;
          height: 100%;
          left: 0;
        }
        .bottom-left::after {
          width: 100%;
          height: 3px;
          bottom: 0;
        }

        .bottom-right {
          bottom: 15px;
          right: 15px;
        }
        .bottom-right::before {
          width: 3px;
          height: 100%;
          right: 0;
        }
        .bottom-right::after {
          width: 100%;
          height: 3px;
          bottom: 0;
        }

        .timestamp {
          position: absolute;
          bottom: 25px;
          left: 70px;
          font-size: 14px;
          font-family: 'Consolas', monospace;
          color: rgba(255, 255, 255, 0.7);
          z-index: 15;
          letter-spacing: 1px;
        }

        .video-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #4a5568;
          text-align: center;
          padding: 2rem;
        }

        .camera-icon {
          margin-bottom: 1.5rem;
          opacity: 0.3;
          color: #00ffff;
        }

        .placeholder-title {
          font-size: 18px;
          font-weight: 600;
          color: #00ffff;
          opacity: 0.6;
          letter-spacing: 3px;
          margin-bottom: 8px;
          font-family: monospace;
        }

        .placeholder-hint {
          font-size: 13px;
          opacity: 0.4;
          color: #888;
          margin: 0;
        }

        .hidden-preview-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
          z-index: 10;
        }

        .hidden-icon {
          margin-bottom: 16px;
          color: #00ffff;
          opacity: 0.5;
        }

        .hidden-text {
          font-size: 16px;
          font-weight: 600;
          color: #00ffff;
          opacity: 0.7;
          letter-spacing: 2px;
          margin-bottom: 8px;
          font-family: monospace;
        }

        .hidden-hint {
          font-size: 12px;
          color: #00ff88;
          opacity: 0.6;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hidden-hint::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #00ff88;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
