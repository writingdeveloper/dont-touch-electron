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

export function VideoPreview({ videoRef, canvasRef, isRunning, faceLandmarksCount = null, handsCount = 0 }: VideoPreviewProps) {
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
      />
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        className="detection-overlay"
      />

      {/* Tech overlay decorations */}
      {isRunning && (
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
      `}</style>
    </div>
  )
}
