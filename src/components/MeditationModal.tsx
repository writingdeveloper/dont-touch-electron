import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { meditations, Meditation } from '../data/meditations'
import { MeditationPlayer } from './MeditationPlayer'

interface MeditationModalProps {
  touchCount: number
  onComplete: (completed: boolean, durationMinutes: number) => void
  onDismiss: () => void
  onSnooze: () => void
}

export function MeditationModal({ touchCount, onComplete, onDismiss, onSnooze }: MeditationModalProps) {
  const { t, language } = useLanguage()
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)

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
      <div className="meditation-modal-overlay">
        <MeditationPlayer
          meditation={selectedMeditation}
          onComplete={handlePlayerComplete}
          onClose={handlePlayerClose}
        />
        <style>{overlayStyle}</style>
      </div>
    )
  }

  return (
    <div className="meditation-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="meditation-modal-title">
      <div className="meditation-modal">
        <div className="modal-header">
          <span className="touch-badge" aria-hidden="true">{touchCount}x</span>
          <h2 id="meditation-modal-title">{t.meditationRecommend || 'Time for a mindful break?'}</h2>
          <p>{t.meditationRecommendDesc || "You've touched your face several times. A short breathing exercise can help break the pattern."}</p>
        </div>

        <div className="meditation-options">
          {meditations.map(meditation => (
            <button
              key={meditation.id}
              className={`meditation-option ${selectedMeditation?.id === meditation.id ? 'selected' : ''}`}
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
          background: linear-gradient(180deg, rgba(20, 10, 40, 0.98), rgba(10, 5, 20, 0.98));
          border-radius: 16px;
          border: 1px solid rgba(187, 134, 252, 0.3);
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
          background: rgba(255, 68, 68, 0.2);
          color: #ff6b6b;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 12px;
        }

        .modal-header h2 {
          color: #fff;
          font-size: 22px;
          margin: 0 0 8px 0;
        }

        .modal-header p {
          color: #888;
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
          background: rgba(187, 134, 252, 0.1);
          border-color: rgba(187, 134, 252, 0.3);
        }

        .meditation-option.selected {
          background: rgba(187, 134, 252, 0.15);
          border-color: #bb86fc;
        }

        .option-name {
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .option-desc {
          color: #888;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .option-duration {
          color: #bb86fc;
          font-size: 12px;
          font-family: 'Consolas', monospace;
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
          background: linear-gradient(135deg, #bb86fc, #6200ea);
          border: none;
          color: #fff;
          font-weight: 500;
        }

        .action-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(187, 134, 252, 0.4);
        }

        .action-btn.primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #888;
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
    z-index: 2000;
    backdrop-filter: blur(10px);
  }
`
