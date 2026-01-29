import { useState, useMemo } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { DailyStats, HabitSettings } from '../types/statistics'

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
    const todayStr = today.toISOString().split('T')[0]
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateStr = date.toISOString().split('T')[0]
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
    setSelectedDate(today.toISOString().split('T')[0])
  }

  // Get status color based on touch count vs goal
  const getStatusColor = (stats: DailyStats | null, isFuture: boolean) => {
    if (isFuture) return 'future'
    if (!stats || stats.touchCount === 0) return 'none'
    if (stats.touchCount <= settings.dailyTouchGoal) return 'good'
    if (stats.touchCount <= settings.dailyTouchGoal * 1.5) return 'warning'
    return 'bad'
  }

  return (
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
        <div className="calendar-header">
          <button className="nav-btn" onClick={goToPrevMonth}>&lt;</button>
          <div className="month-title">
            <span>{monthName}</span>
            <button className="today-btn" onClick={goToToday}>{t.calendarToday || 'Today'}</button>
          </div>
          <button className="nav-btn" onClick={goToNextMonth}>&gt;</button>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="calendar-grid">
          {/* Weekday headers */}
          {weekDays.map((day, i) => (
            <div key={i} className="weekday-header">{day}</div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayInfo, i) => (
            <div
              key={i}
              className={`calendar-day ${dayInfo.date ? 'has-date' : 'empty'} ${dayInfo.isToday ? 'today' : ''} ${selectedDate === dayInfo.date ? 'selected' : ''} status-${getStatusColor(dayInfo.stats, dayInfo.isFuture)}`}
              onClick={() => dayInfo.date && !dayInfo.isFuture && setSelectedDate(dayInfo.date)}
            >
              {dayInfo.day > 0 && (
                <>
                  <span className="day-number">{dayInfo.day}</span>
                  {dayInfo.stats && dayInfo.stats.touchCount > 0 && (
                    <span className="touch-count">{dayInfo.stats.touchCount}</span>
                  )}
                </>
              )}
            </div>
          ))}
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
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .calendar-modal {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 16px;
          padding: 20px;
          min-width: 360px;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          position: relative;
        }

        .month-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          color: #00ffff;
        }

        .today-btn {
          padding: 4px 10px;
          font-size: 11px;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 12px;
          color: #00ffff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .today-btn:hover {
          background: rgba(0, 255, 255, 0.2);
        }

        .nav-btn {
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #ccc;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          background: rgba(0, 255, 255, 0.1);
          border-color: rgba(0, 255, 255, 0.3);
          color: #00ffff;
        }

        .close-btn {
          position: absolute;
          top: 0;
          right: 0;
          width: 32px;
          height: 32px;
          background: rgba(255, 68, 68, 0.2);
          border: 1px solid rgba(255, 68, 68, 0.4);
          border-radius: 50%;
          color: #ff4444;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 68, 68, 0.4);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }

        .weekday-header {
          text-align: center;
          font-size: 11px;
          color: #666;
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
          transition: all 0.2s;
        }

        .calendar-day.has-date {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.03);
        }

        .calendar-day.has-date:hover {
          background: rgba(0, 255, 255, 0.1);
        }

        .calendar-day.today {
          border: 2px solid #00ffff;
        }

        .calendar-day.selected {
          background: rgba(0, 255, 255, 0.2) !important;
        }

        .calendar-day.status-good {
          background: rgba(0, 255, 136, 0.15);
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
          color: #666;
        }

        .day-number {
          color: #fff;
        }

        .touch-count {
          font-size: 9px;
          color: #888;
          margin-top: 2px;
        }

        .calendar-day.status-good .touch-count { color: #00ff88; }
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
          color: #00ffff;
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
          color: #666;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
        }

        .detail-value.good { color: #00ff88; }
        .detail-value.bad { color: #ff4444; }
        .detail-value.meditation { color: #bb86fc; font-size: 16px; }

        .no-data {
          color: #666;
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
          color: #888;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-dot.good { background: #00ff88; }
        .legend-dot.warning { background: #ffbb44; }
        .legend-dot.bad { background: #ff4444; }
      `}</style>
    </div>
  )
}
