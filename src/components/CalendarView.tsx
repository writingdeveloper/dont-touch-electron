import { useState, useMemo, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { DailyStats, HabitSettings, dateToLocalString } from '../types/statistics'
import { useFocusTrap } from '../hooks/useFocusTrap'

interface CalendarViewProps {
  getMonthlyStats: (year: number, month: number) => Map<string, DailyStats>
  settings: HabitSettings
  onClose: () => void
}

export function CalendarView({ getMonthlyStats, settings, onClose }: CalendarViewProps) {
  const { t, language } = useLanguage()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const calendarModalRef = useFocusTrap()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Get weekday names based on language
  const weekDays = useMemo(() => {
    const days: string[] = []
    const baseDate = new Date(2024, 0, 7) // A Sunday
    for (let i = 0; i < 7; i++) {
      baseDate.setDate(7 + i)
      days.push(baseDate.toLocaleDateString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : language === 'ru' ? 'ru-RU' : 'en-US', { weekday: 'short' }))
    }
    return days
  }, [language])

  // Get month name
  const monthName = useMemo(() => {
    const date = new Date(currentYear, currentMonth, 1)
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : language === 'ru' ? 'ru-RU' : 'en-US', { month: 'long', year: 'numeric' })
  }, [currentYear, currentMonth, language])

  // Get monthly stats
  const monthlyStats = useMemo(() => {
    return getMonthlyStats(currentYear, currentMonth)
  }, [getMonthlyStats, currentYear, currentMonth])

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startPadding = firstDay.getDay() // 0 = Sunday
    const daysInMonth = lastDay.getDate()

    const days: { date: string | null; day: number; stats: DailyStats | null; isToday: boolean; isFuture: boolean }[] = []

    // Add padding for days before the 1st
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, day: 0, stats: null, isToday: false, isFuture: false })
    }

    // Add days of the month
    const todayStr = dateToLocalString(today)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateStr = dateToLocalString(date)
      const stats = monthlyStats.get(dateStr) || null
      const isToday = dateStr === todayStr
      const isFuture = dateStr > todayStr

      days.push({ date: dateStr, day, stats, isToday, isFuture })
    }

    return days
  }, [currentYear, currentMonth, monthlyStats, today])

  // Get selected date stats
  const selectedStats = selectedDate ? monthlyStats.get(selectedDate) : null

  // Navigate months
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
    setSelectedDate(dateToLocalString(today))
  }

  // Get status color based on touch count vs goal
  const getStatusColor = (stats: DailyStats | null, isFuture: boolean) => {
    if (isFuture) return 'future'
    if (!stats || stats.touchCount === 0) return 'none'
    if (stats.touchCount <= settings.dailyTouchGoal) return 'good'
    if (stats.touchCount <= settings.dailyTouchGoal * 1.5) return 'warning'
    return 'bad'
  }

  const getDateLabel = (dayInfo: { date: string | null; day: number; stats: DailyStats | null; isToday: boolean; isFuture: boolean }) => {
    if (!dayInfo.date) return ''
    const status = getStatusColor(dayInfo.stats, dayInfo.isFuture)
    const touches = dayInfo.stats?.touchCount ?? 0
    const parts = [
      dayInfo.isToday ? t.calendarToday : dayInfo.date,
      `${touches} ${t.statsTodayTouches}`,
      status === 'future' ? 'Future date' : status === 'good' ? t.calendarGood : status === 'warning' ? t.calendarWarning : status === 'bad' ? t.calendarBad : t.calendarNoData,
    ]
    return parts.filter(Boolean).join(', ')
  }

  return (
    <div className="calendar-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="calendar-modal-title">
      <div className="calendar-modal" ref={calendarModalRef} onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <button type="button" className="calendar-nav-btn" onClick={goToPrevMonth} aria-label={t.calendarPreviousMonth}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="month-title">
            <span id="calendar-modal-title">{monthName}</span>
            <button className="today-btn" onClick={goToToday}>{t.calendarToday || 'Today'}</button>
          </div>
          <button type="button" className="calendar-nav-btn" onClick={goToNextMonth} aria-label={t.calendarNextMonth}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button type="button" className="calendar-close-btn" onClick={onClose} aria-label={t.calendarClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="calendar-grid">
          {/* Weekday headers */}
          {weekDays.map((day, i) => (
            <div key={i} className="weekday-header">{day}</div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayInfo, i) => {
            const dayClassName = `calendar-day ${dayInfo.date ? 'has-date' : 'empty'} ${dayInfo.isToday ? 'today' : ''} ${selectedDate === dayInfo.date ? 'selected' : ''} status-${getStatusColor(dayInfo.stats, dayInfo.isFuture)}`

            if (!dayInfo.date) {
              return <div key={i} className={dayClassName} aria-hidden="true" />
            }

            return (
              <button
                key={dayInfo.date}
                type="button"
                className={dayClassName}
                disabled={dayInfo.isFuture}
                aria-label={getDateLabel(dayInfo)}
                aria-pressed={selectedDate === dayInfo.date}
                onClick={() => setSelectedDate(dayInfo.date)}
              >
                <span className="day-number">{dayInfo.day}</span>
                {dayInfo.stats && dayInfo.stats.touchCount > 0 && (
                  <span className="touch-count">{dayInfo.stats.touchCount}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected date details */}
        {selectedDate && (
          <div className="day-details">
            <h4>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(
                language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : language === 'zh' ? 'zh-CN' : language === 'es' ? 'es-ES' : language === 'ru' ? 'ru-RU' : 'en-US',
                { weekday: 'long', month: 'long', day: 'numeric' }
              )}
            </h4>
            {selectedStats ? (
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">{t.statsTodayTouches || 'Touches'}</span>
                  <span className={`detail-value ${selectedStats.touchCount <= settings.dailyTouchGoal ? 'good' : 'bad'}`}>
                    {selectedStats.touchCount}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{t.statsGoal || 'Goal'}</span>
                  <span className="detail-value">{settings.dailyTouchGoal}</span>
                </div>
                {selectedStats.meditationMinutes > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">{t.statsMeditation || 'Meditation'}</span>
                    <span className="detail-value meditation">{selectedStats.meditationMinutes} {t.statsMinutes || 'min'}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="no-data">{t.calendarNoData || 'No data for this day'}</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot good"></span>
            <span>{t.calendarGood || 'Goal met'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot warning"></span>
            <span>{t.calendarWarning || 'Near goal'}</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot bad"></span>
            <span>{t.calendarBad || 'Over goal'}</span>
          </div>
        </div>
      </div>

      <style>{`
        .calendar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal-backdrop);
          backdrop-filter: blur(4px);
          animation: calendarBackdropIn var(--motion-standard) var(--motion-ease);
        }

        .calendar-modal {
          background: #1b1c25;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 20px;
          width: min(420px, calc(100vw - 32px));
          box-shadow: 0 8px 8px rgba(0, 0, 0, 0.35);
          animation: calendarModalIn var(--motion-standard) var(--motion-ease);
        }

        .calendar-header {
          display: grid;
          grid-template-columns: 44px minmax(0, 1fr) 44px 44px;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .month-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-width: 0;
          font-size: 18px;
          font-weight: 600;
          color: #e5e7eb;
        }

        .month-title span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .today-btn {
          padding: 4px 10px;
          font-size: 11px;
          background: rgba(125, 211, 252, 0.1);
          border: 1px solid rgba(125, 211, 252, 0.3);
          border-radius: 12px;
          color: #7dd3fc;
          cursor: pointer;
          flex: 0 0 auto;
          transition:
            background-color var(--motion-fast) var(--motion-ease),
            border-color var(--motion-fast) var(--motion-ease),
            color var(--motion-fast) var(--motion-ease);
        }

        .today-btn:hover {
          background: rgba(125, 211, 252, 0.16);
        }

        .calendar-nav-btn,
        .calendar-close-btn {
          width: 44px;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ccc;
          cursor: pointer;
          transition:
            background-color var(--motion-fast) var(--motion-ease),
            border-color var(--motion-fast) var(--motion-ease),
            color var(--motion-fast) var(--motion-ease),
            transform var(--motion-fast) var(--motion-ease);
        }

        .calendar-nav-btn:hover,
        .calendar-close-btn:hover {
          background: rgba(125, 211, 252, 0.08);
          border-color: rgba(125, 211, 252, 0.28);
          color: #7dd3fc;
        }

        .calendar-nav-btn:active,
        .calendar-close-btn:active {
          transform: translateY(1px);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .weekday-header {
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          padding: 8px 0;
          text-transform: uppercase;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 14px;
          position: relative;
          transition:
            background-color var(--motion-fast) var(--motion-ease),
            border-color var(--motion-fast) var(--motion-ease),
            color var(--motion-fast) var(--motion-ease),
            transform var(--motion-fast) var(--motion-ease);
          border: none;
          color: inherit;
        }

        .calendar-day.has-date {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.03);
        }

        .calendar-day.has-date:hover {
          background: rgba(125, 211, 252, 0.08);
          transform: translateY(-1px);
        }

        .calendar-day.today {
          border: 2px solid #7dd3fc;
        }

        .calendar-day.selected {
          background: rgba(125, 211, 252, 0.18) !important;
        }

        .calendar-day.status-good {
          background: rgba(52, 211, 153, 0.14);
        }

        .calendar-day.status-warning {
          background: rgba(255, 187, 68, 0.15);
        }

        .calendar-day.status-bad {
          background: rgba(255, 68, 68, 0.15);
        }

        .calendar-day.status-future {
          opacity: 0.3;
          cursor: default;
        }

        .calendar-day.status-none {
          color: #94a3b8;
        }

        .day-number {
          color: #fff;
        }

        .touch-count {
          font-size: 9px;
          color: #888;
          margin-top: 2px;
        }

        .calendar-day.status-good .touch-count { color: #86efac; }
        .calendar-day.status-warning .touch-count { color: #ffbb44; }
        .calendar-day.status-bad .touch-count { color: #ff4444; }

        .day-details {
          margin-top: 16px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .day-details h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #7dd3fc;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .detail-item {
          text-align: center;
        }

        .detail-label {
          display: block;
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
        }

        .detail-value.good { color: #86efac; }
        .detail-value.bad { color: #ff4444; }
        .detail-value.meditation { color: #7dd3fc; font-size: 16px; }

        .no-data {
          color: #94a3b8;
          text-align: center;
          font-size: 13px;
          margin: 0;
        }

        .calendar-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #94a3b8;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-dot.good { background: #34d399; }
        .legend-dot.warning { background: #ffbb44; }
        .legend-dot.bad { background: #ff4444; }

        @keyframes calendarBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes calendarModalIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @media (max-width: 460px) {
          .calendar-modal {
            padding: 16px;
          }

          .calendar-header {
            grid-template-columns: 40px minmax(0, 1fr) 40px 40px;
          }

          .calendar-nav-btn,
          .calendar-close-btn {
            width: 40px;
            height: 40px;
          }

          .month-title {
            gap: 8px;
            font-size: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .calendar-overlay,
          .calendar-modal {
            animation: none;
          }

          .calendar-day.has-date:hover,
          .calendar-nav-btn:active,
          .calendar-close-btn:active {
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}
