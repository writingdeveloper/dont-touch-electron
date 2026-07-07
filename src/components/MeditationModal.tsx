import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { meditations, Meditation } from '../data/meditations'
import { MeditationPlayer } from './MeditationPlayer'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface MeditationModalProps {
  touchCount: number
  onComplete: (completed: boolean, durationMinutes: number) => void
  onDismiss: () => void
  onSnooze: () => void
}

export function MeditationModal({ touchCount: _touchCount, onComplete, onDismiss, onSnooze }: MeditationModalProps) {
  const { t, language } = useLanguage()
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(() => (
    meditations.reduce((shortest, current) => current.duration < shortest.duration ? current : shortest, meditations[0])
  ))
  const [showPlayer, setShowPlayer] = useState(false)
  const meditationModalRef = useFocusTrap(!showPlayer)
  const playerModalRef = useFocusTrap(showPlayer)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  const handleSelectMeditation = (meditation: Meditation) => {
    setSelectedMeditation(meditation)
  }

  const handleStartMeditation = () => {
    if (selectedMeditation) {
      setShowPlayer(true)
    }
  }

  const handlePlayerComplete = (completed: boolean, durationMinutes: number) => {
    setShowPlayer(false)
    onComplete(completed, durationMinutes)
  }

  const handlePlayerClose = () => {
    setShowPlayer(false)
  }

  if (showPlayer && selectedMeditation) {
    return (
      <div
        className="meditation-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meditation-player-title"
      >
        <div ref={playerModalRef}>
          <MeditationPlayer
            meditation={selectedMeditation}
            onComplete={handlePlayerComplete}
            onClose={handlePlayerClose}
          />
        </div>
        <style>{overlayStyle}</style>
      </div>
    )
  }

  return (
    <div className="meditation-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="meditation-modal-title">
      <div className="meditation-modal" ref={meditationModalRef}>
        <div className="modal-header">
          <span className="touch-badge" aria-hidden="true">Short reset suggested</span>
          <h2 id="meditation-modal-title">{t.meditationRecommend || 'Time for a mindful break?'}</h2>
          <p>{t.meditationRecommendDesc || "You've touched your face several times. A short breathing exercise can help break the pattern."}</p>
        </div>

        <div className="meditation-options">
          {meditations.map(meditation => (
            <button
              key={meditation.id}
              className={`meditation-option ${selectedMeditation?.id === meditation.id ? 'selected' : ''}`}
              aria-pressed={selectedMeditation?.id === meditation.id}
              onClick={() => handleSelectMeditation(meditation)}
            >
              <span className="option-name">{meditation.name[language]}</span>
              <span className="option-desc">{meditation.description[language]}</span>
              <span className="option-duration">{Math.floor(meditation.duration / 60)} min</span>
            </button>
          ))}
        </div>

        <div className="modal-actions">
          <button className="action-btn secondary" onClick={onSnooze}>
            {t.meditationLater || 'Later'}
          </button>
          <button className="action-btn secondary" onClick={onDismiss}>
            {t.meditationSkip || 'Skip'}
          </button>
          <button
            className="action-btn primary"
            onClick={handleStartMeditation}
            disabled={!selectedMeditation}
          >
            {t.meditationStart || 'Start'}
          </button>
        </div>
      </div>

      <style>{`
        ${overlayStyle}

        .meditation-modal {
          background: #1b1c25;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 24px;
          max-width: 450px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .touch-badge {
          display: inline-block;
          background: rgba(245, 158, 11, 0.14);
          color: #fbbf24;
          padding: 5px 12px;
          border: 1px solid rgba(245, 158, 11, 0.24);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .modal-header h2 {
          color: #fff;
          font-size: 22px;
          margin: 0 0 8px 0;
        }

        .modal-header p {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
          line-height: 1.5;
        }

        .meditation-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .meditation-option {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .meditation-option:hover {
          background: rgba(125, 211, 252, 0.08);
          border-color: rgba(125, 211, 252, 0.28);
        }

        .meditation-option.selected {
          background: rgba(125, 211, 252, 0.12);
          border-color: #7dd3fc;
        }

        .option-name {
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .option-desc {
          color: #94a3b8;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .option-duration {
          color: #7dd3fc;
          font-size: 12px;
          font-variant-numeric: tabular-nums;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .action-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn.primary {
          background: rgba(125, 211, 252, 0.16);
          border: 1px solid rgba(125, 211, 252, 0.45);
          color: #e0f2fe;
          font-weight: 500;
        }

        .action-btn.primary:hover:not(:disabled) {
          background: rgba(125, 211, 252, 0.22);
        }

        .action-btn.primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #cbd5e1;
        }

        .action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
      `}</style>
    </div>
  )
}

const overlayStyle = `
  .meditation-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: var(--z-modal-backdrop);
    backdrop-filter: blur(10px);
  }
`
