import { DailyStatsCard } from './DailyStatsCard'
import { DailyStats, HabitSettings, UserProgress } from '../types/statistics'
import { DetectionZone } from '../detection/types'
import { useLanguage } from '../i18n/LanguageContext'

interface ActivityRailProps {
  collapsed: boolean
  todayStats: DailyStats
  progress: UserProgress
  habitSettings: HabitSettings
  setupComplete: boolean
  enabledZones: DetectionZone[]
  activeZone: DetectionZone | null
  onToggleCollapsed: () => void
  onOpenCalendar: () => void
  onOpenMeditation: () => void
  onSetupComplete: () => void
}

function zoneLabelKey(zone: DetectionZone): string {
  return `zone${zone.charAt(0).toUpperCase()}${zone.slice(1)}`
}

export function ActivityRail({
  collapsed,
  todayStats,
  progress,
  habitSettings,
  setupComplete,
  enabledZones,
  activeZone,
  onToggleCollapsed,
  onOpenCalendar,
  onOpenMeditation,
  onSetupComplete,
}: ActivityRailProps) {
  const { t } = useLanguage()
  const toggleLabel = collapsed
    ? t.activityPanelShow || 'Show activity panel'
    : t.activityPanelHide || 'Hide activity panel'

  return (
    <aside className={`activity-rail ${collapsed ? 'collapsed' : ''}`} aria-label={t.activityPanelTitle || 'Activity panel'}>
      <div className="activity-rail-header">
        <button
          type="button"
          className="activity-rail-toggle"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="activity-rail-content"
          aria-label={toggleLabel}
          title={toggleLabel}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path className="rail-chevron-horizontal" d={collapsed ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
            <path className="rail-chevron-stacked" d={collapsed ? 'M6 9l6 6 6-6' : 'M6 15l6-6 6 6'} />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="activity-rail-content" id="activity-rail-content">
          <DailyStatsCard
            stats={todayStats}
            progress={progress}
            settings={habitSettings}
          />

          <div className="quick-actions">
            <button className="quick-btn" onClick={onOpenCalendar}>
              <span className="quick-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </span>
              <span>{t.calendarTitle || 'History'}</span>
            </button>
            <button className="quick-btn meditation" onClick={onOpenMeditation}>
              <span className="quick-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v6" />
                  <path d="M8 9h8" />
                  <path d="M7 21a5 5 0 0 1 10 0" />
                  <path d="M5 14c2.5 1.5 4.8 2 7 2s4.5-.5 7-2" />
                </svg>
              </span>
              <span>{t.meditationButton || 'Meditation'}</span>
            </button>
          </div>

          {!setupComplete && (
            <section className="setup-card" aria-label={t.activityPanelSetupLabel || 'First run setup'}>
              <span className="setup-card-kicker">{t.activityPanelPrivateSetup || 'Private setup'}</span>
              <h2>{t.activityPanelSetupTitle || 'Start when you are ready'}</h2>
              <p>{t.activityPanelSetupBody || 'The camera only starts after you press Start. Video stays on this device.'}</p>
              <button type="button" onClick={onSetupComplete}>{t.activityPanelSetupAction || 'Got it'}</button>
            </section>
          )}

          <div className="zone-info">
            <span className="zone-title">{t.settingsDetectionZones}</span>
            <div className="zone-list">
              {enabledZones.map((zone) => (
                <span key={zone} className={`zone-tag ${activeZone === zone ? 'active' : ''}`}>
                  {t[zoneLabelKey(zone) as keyof typeof t]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
