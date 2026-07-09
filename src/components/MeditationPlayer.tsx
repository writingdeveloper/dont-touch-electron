import { useState, useEffect, useCallback, useRef } from 'react'
import { Meditation, BreathingPattern } from '../data/meditations'
import { useLanguage } from '../i18n/LanguageContext'

type BreathPhase = 'inhale' | 'hold' | 'exhale'

interface MeditationPlayerProps {
  meditation: Meditation
  onComplete: (completed: boolean, durationMinutes: number) => void
  onClose: () => void
}

export function MeditationPlayer({ meditation, onComplete, onClose }: MeditationPlayerProps) {
  const { t, language } = useLanguage()
  const [isPlaying, setIsPlaying] = useState(true)
  const [phase, setPhase] = useState<BreathPhase>('inhale')
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(meditation.pattern.inhale)
  const [currentCycle, setCurrentCycle] = useState(1)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const startTimeRef = useRef(Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getPhaseText = (p: BreathPhase): string => {
    switch (p) {
      case 'inhale': return t.meditationInhale || 'Breathe In'
      case 'hold': return t.meditationHold || 'Hold'
      case 'exhale': return t.meditationExhale || 'Breathe Out'
    }
  }

  const getPhaseDuration = (p: BreathPhase, pattern: BreathingPattern): number => {
    switch (p) {
      case 'inhale': return pattern.inhale
      case 'hold': return pattern.hold
      case 'exhale': return pattern.exhale
    }
  }

  const getNextPhase = (p: BreathPhase): BreathPhase => {
    switch (p) {
      case 'inhale': return 'hold'
      case 'hold': return 'exhale'
      case 'exhale': return 'inhale'
    }
  }

  const getCircleScale = (): number => {
    const { pattern } = meditation
    const phaseDuration = getPhaseDuration(phase, pattern)
    const progress = 1 - (phaseTimeLeft / phaseDuration)

    switch (phase) {
      case 'inhale':
        return 1 + progress * 0.5 // 1.0 -> 1.5
      case 'hold':
        return 1.5
      case 'exhale':
        return 1.5 - progress * 0.5 // 1.5 -> 1.0
    }
  }

  const handleComplete = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60 // minutes
    onComplete(true, Math.round(elapsed))
  }, [onComplete])

  const handleCancel = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60
    onComplete(false, Math.round(elapsed))
    onClose()
  }, [onComplete, onClose])

  useEffect(() => {
    if (!isPlaying) return

    intervalRef.current = setInterval(() => {
      setTotalElapsed(prev => prev + 1)
      setPhaseTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhase = getNextPhase(phase)

          if (nextPhase === 'inhale') {
            // Completed a cycle
            if (currentCycle >= meditation.pattern.cycles) {
              // All cycles complete
              handleComplete()
              return 0
            }
            setCurrentCycle(c => c + 1)
          }

          setPhase(nextPhase)
          return getPhaseDuration(nextPhase, meditation.pattern)
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, phase, currentCycle, meditation.pattern, handleComplete])

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mediaQuery) return

    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches)
    updateMotionPreference()
    mediaQuery.addEventListener('change', updateMotionPreference)
    return () => mediaQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  const togglePause = () => {
    setIsPlaying(!isPlaying)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const remainingTime = meditation.duration - totalElapsed
  const progress = (totalElapsed / meditation.duration) * 100

  return (
    <div className="meditation-player">
      <div className="meditation-header">
        <h2 className="meditation-title" id="meditation-player-title">{meditation.name[language]}</h2>
        <p className="meditation-desc">{meditation.description[language]}</p>
      </div>

      <div className="breathing-container">
        <div
          className={`breathing-circle ${phase}`}
          style={{ transform: prefersReducedMotion ? 'scale(1)' : `scale(${getCircleScale()})` }}
        >
          <div className="circle-inner">
            <span className="phase-text" aria-live="polite">{getPhaseText(phase)}</span>
            <span className="phase-timer">{phaseTimeLeft}</span>
          </div>
        </div>
      </div>

      <div className="meditation-progress">
        <div className="progress-info">
          <span>{t.meditationCycle || 'Cycle'} {currentCycle}/{meditation.pattern.cycles}</span>
          <span>{formatTime(remainingTime)} {t.meditationRemaining || 'remaining'}</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.min(100, Math.round(progress))}
          aria-label="Meditation progress"
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="meditation-controls">
        <button className="control-btn secondary" onClick={handleCancel}>
          {t.meditationEnd || 'End'}
        </button>
        <button className="control-btn primary" onClick={togglePause}>
          {isPlaying ? (t.meditationPause || 'Pause') : (t.meditationResume || 'Resume')}
        </button>
      </div>

      <style>{`
        .meditation-player {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          background: #1b1c25;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          width: min(500px, calc(100vw - 32px));
          max-width: 100%;
        }

        .meditation-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .meditation-title {
          color: #e5e7eb;
          font-size: 24px;
          margin: 0 0 8px 0;
        }

        .meditation-desc {
          color: #94a3b8;
          font-size: 14px;
          margin: 0;
        }

        .breathing-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 250px;
          height: 250px;
          margin-bottom: 24px;
        }

        .breathing-circle {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: transform 1s ease-in-out;
          background: rgba(125, 211, 252, 0.08);
          border: 3px solid rgba(125, 211, 252, 0.45);
        }

        .breathing-circle.inhale {
          border-color: #7dd3fc;
        }

        .breathing-circle.hold {
          border-color: #fbbf24;
        }

        .breathing-circle.exhale {
          border-color: #86efac;
        }

        .circle-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .phase-text {
          font-size: 18px;
          color: #fff;
          font-weight: 500;
          letter-spacing: 0;
        }

        .phase-timer {
          font-size: 36px;
          color: #fff;
          font-variant-numeric: tabular-nums;
          font-weight: bold;
        }

        .meditation-progress {
          width: 100%;
          margin-bottom: 24px;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          color: #94a3b8;
        }

        .progress-track {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #7dd3fc;
        }

        .meditation-controls {
          display: flex;
          gap: 12px;
        }

        .control-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-btn.primary {
          background: rgba(125, 211, 252, 0.16);
          border: 1px solid rgba(125, 211, 252, 0.45);
          color: #e0f2fe;
        }

        .control-btn.primary:hover {
          background: rgba(125, 211, 252, 0.22);
        }

        .control-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #cbd5e1;
        }

        .control-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
        }
      `}</style>
    </div>
  )
}
