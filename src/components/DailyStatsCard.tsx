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
  const remainingToGoal = Math.max(settings.dailyTouchGoal - stats.touchCount, 0)
  const progressLabel = `${stats.touchCount} ${t.statsTodayTouches || 'touches'} / ${settings.dailyTouchGoal} ${t.statsGoal || 'goal'}`
  const lastTouchTime = stats.lastTouch
    ? new Date(stats.lastTouch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : t.statsNever || 'Never'

  return (
    <div className="daily-stats-card">
      <div className="stats-header">
        <span className="stats-title">{t.statsTodayTouches || "Today's Touches"}</span>
        {progress.currentStreak > 0 && (
          <div className="streak-badge">
            <span className="streak-dot" aria-hidden="true" />
            <span className="streak-count">{progress.currentStreak}</span>
            <span className="streak-label">{t.statsDays || 'days'}</span>
          </div>
        )}
      </div>

      <div className="touch-count-container">
        <span className={`touch-count ${isOverGoal ? 'over-goal' : ''}`}>
          {stats.touchCount}
        </span>
        <span className="touch-goal">/ {settings.dailyTouchGoal}</span>
      </div>

      <div
        className="progress-bar-container"
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={settings.dailyTouchGoal}
        aria-valuenow={Math.min(stats.touchCount, settings.dailyTouchGoal)}
      >
        <div
          className={`progress-bar ${isOverGoal ? 'over-goal' : ''}`}
          style={{ width: `${goalProgress}%` }}
        />
      </div>
      <div className="goal-caption">
        {isOverGoal
          ? t.calendarBad || 'Over goal'
          : remainingToGoal === 0
            ? t.calendarGood || 'Goal met'
            : `${remainingToGoal} ${t.meditationRemaining || 'remaining'}`}
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
          margin-bottom: 6px;
        }

        .stats-title {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
          letter-spacing: 0;
        }

        .streak-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.18);
          border-radius: 999px;
          padding: 3px 7px;
          font-size: 11px;
        }

        .streak-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34d399;
        }

        .streak-count {
          color: #bbf7d0;
          font-weight: 600;
        }

        .streak-label {
          color: #94a3b8;
        }

        .touch-count-container {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }

        .touch-count {
          font-size: 30px;
          font-weight: 700;
          color: #4ade80;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .touch-count.over-goal {
          color: #fbbf24;
        }

        .touch-goal {
          font-size: 14px;
          color: #94a3b8;
          font-variant-numeric: tabular-nums;
        }

        .progress-bar-container {
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .progress-bar {
          height: 100%;
          background: #34d399;
          border-radius: inherit;
        }

        .progress-bar.over-goal {
          background: #f59e0b;
        }

        .goal-caption {
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .stats-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
        }

        .stat-label {
          color: #94a3b8;
        }

        .stat-value {
          color: #cbd5e1;
          font-variant-numeric: tabular-nums;
        }

        .stat-value.meditation {
          color: #7dd3fc;
        }
      `}</style>
    </div>
  )
}
