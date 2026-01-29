import { DailyStats, UserProgress, HabitSettings } from '../types/statistics'
import { useLanguage } from '../i18n/LanguageContext'

interface DailyStatsCardProps {
  stats: DailyStats
  progress: UserProgress
  settings: HabitSettings
}

export function DailyStatsCard({ stats, progress, settings }: DailyStatsCardProps) {
  const { t } = useLanguage()

  const goalProgress = Math.min((stats.touchCount / settings.dailyTouchGoal) * 100, 100)
  const isOverGoal = stats.touchCount > settings.dailyTouchGoal
  const lastTouchTime = stats.lastTouch
    ? new Date(stats.lastTouch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--'

  return (
    <div className="daily-stats-card">
      <div className="stats-header">
        <span className="stats-title">{t.statsTodayTouches || "Today's Touches"}</span>
        {progress.currentStreak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{progress.currentStreak}</span>
          </div>
        )}
      </div>

      <div className="touch-count-container">
        <span className={`touch-count ${isOverGoal ? 'over-goal' : ''}`}>
          {stats.touchCount}
        </span>
        <span className="touch-goal">/ {settings.dailyTouchGoal}</span>
      </div>

      <div className="progress-bar-container">
        <div
          className={`progress-bar ${isOverGoal ? 'over-goal' : ''}`}
          style={{ width: `${goalProgress}%` }}
        />
      </div>

      <div className="stats-details">
        <div className="stat-item">
          <span className="stat-label">{t.statsLastTouch || 'Last touch'}</span>
          <span className="stat-value">{lastTouchTime}</span>
        </div>
        {stats.meditationSessions > 0 && (
          <div className="stat-item">
            <span className="stat-label">{t.statsMeditation || 'Meditation'}</span>
            <span className="stat-value meditation">
              {stats.meditationSessions}x ({stats.meditationMinutes}m)
            </span>
          </div>
        )}
      </div>

      <style>{`
        .daily-stats-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 12px;
        }

        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .stats-title {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(255, 136, 0, 0.15);
          border-radius: 10px;
          padding: 3px 8px;
          font-size: 11px;
        }

        .streak-icon {
          font-size: 12px;
        }

        .streak-count {
          color: #ff8800;
          font-weight: 600;
        }

        .touch-count-container {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }

        .touch-count {
          font-size: 36px;
          font-weight: 700;
          color: #4ade80;
          font-family: 'Consolas', monospace;
          line-height: 1;
        }

        .touch-count.over-goal {
          color: #f87171;
        }

        .touch-goal {
          font-size: 14px;
          color: #555;
          font-family: 'Consolas', monospace;
        }

        .progress-bar-container {
          height: 4px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4ade80, #22d3ee);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .progress-bar.over-goal {
          background: linear-gradient(90deg, #fbbf24, #f87171);
        }

        .stats-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
        }

        .stat-label {
          color: #666;
        }

        .stat-value {
          color: #999;
          font-family: 'Consolas', monospace;
        }

        .stat-value.meditation {
          color: #a78bfa;
        }
      `}</style>
    </div>
  )
}
