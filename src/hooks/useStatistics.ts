import { useState, useCallback, useEffect, useRef } from 'react'
import { StatisticsService } from '../services/StatisticsService'
import {
  TouchEvent,
  DailyStats,
  HabitSettings,
  UserProgress,
  ExportData,
  getTodayDateString,
} from '../types/statistics'
import { DetectionZone } from '../detection/types'

interface UseStatisticsReturn {
  // Today's data
  todayTouchCount: number
  todayStats: DailyStats
  todayEvents: TouchEvent[]

  // Progress
  progress: UserProgress

  // Settings
  settings: HabitSettings
  updateSettings: (settings: Partial<HabitSettings>) => void

  // Weekly data
  weeklyStats: DailyStats[]

  // Actions
  recordTouch: (duration: number, zone?: DetectionZone | null) => void
  recordMeditation: (durationMinutes: number) => void

  // Meditation recommendation
  shouldRecommendMeditation: boolean
  setMeditationRecommended: () => void

  // Import/Export
  exportData: () => ExportData
  importData: (data: ExportData) => boolean
  clearAllData: () => void

  // Calendar
  getMonthlyStats: (year: number, month: number) => Map<string, DailyStats>

  // Refresh
  refresh: () => void
}

export function useStatistics(): UseStatisticsReturn {
  const [todayTouchCount, setTodayTouchCount] = useState(StatisticsService.getTodayTouchCount())
  const [todayStats, setTodayStats] = useState(StatisticsService.getTodayStats())
  const [todayEvents, setTodayEvents] = useState(StatisticsService.getTodayEvents())
  const [progress, setProgress] = useState(StatisticsService.getProgress())
  const [settings, setSettings] = useState(StatisticsService.getSettings())
  const [weeklyStats, setWeeklyStats] = useState(StatisticsService.getWeeklyStats())
  const [shouldRecommendMeditation, setShouldRecommendMeditation] = useState(
    StatisticsService.shouldRecommendMeditation()
  )

  // Refresh all stats
  const refresh = useCallback(() => {
    setTodayTouchCount(StatisticsService.getTodayTouchCount())
    setTodayStats(StatisticsService.getTodayStats())
    setTodayEvents(StatisticsService.getTodayEvents())
    setProgress(StatisticsService.getProgress())
    setSettings(StatisticsService.getSettings())
    setWeeklyStats(StatisticsService.getWeeklyStats())
    setShouldRecommendMeditation(StatisticsService.shouldRecommendMeditation())
  }, [])

  // Record a touch event
  const recordTouch = useCallback((duration: number, zone: DetectionZone | null = null) => {
    StatisticsService.recordTouch(duration, zone)
    refresh()
  }, [refresh])

  // Record completed meditation
  const recordMeditation = useCallback((durationMinutes: number) => {
    StatisticsService.recordMeditation(durationMinutes)
    refresh()
  }, [refresh])

  // Mark meditation as recommended
  const setMeditationRecommended = useCallback(() => {
    StatisticsService.setMeditationRecommended()
    setShouldRecommendMeditation(false)
  }, [])

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<HabitSettings>) => {
    StatisticsService.updateSettings(newSettings)
    setSettings(StatisticsService.getSettings())
  }, [])

  // Get monthly stats for calendar view
  const getMonthlyStats = useCallback((year: number, month: number) => {
    return StatisticsService.getMonthlyStats(year, month)
  }, [])

  // Export data
  const exportData = useCallback(() => {
    return StatisticsService.exportData()
  }, [])

  // Import data
  const importData = useCallback((data: ExportData) => {
    const success = StatisticsService.importData(data)
    if (success) {
      refresh()
    }
    return success
  }, [refresh])

  // Clear all data
  const clearAllData = useCallback(() => {
    StatisticsService.clearAllData()
    refresh()
  }, [refresh])

  // Refresh on window focus and detect day changes
  const lastDateRef = useRef(getTodayDateString())

  useEffect(() => {
    const handleFocus = () => refresh()
    window.addEventListener('focus', handleFocus)

    // Check for day change every minute (lightweight string comparison)
    const interval = setInterval(() => {
      const today = getTodayDateString()
      if (today !== lastDateRef.current) {
        lastDateRef.current = today
        refresh()
      }
    }, 60000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [refresh])

  return {
    todayTouchCount,
    todayStats,
    todayEvents,
    progress,
    settings,
    updateSettings,
    weeklyStats,
    recordTouch,
    recordMeditation,
    shouldRecommendMeditation,
    setMeditationRecommended,
    exportData,
    importData,
    clearAllData,
    getMonthlyStats,
    refresh,
  }
}
