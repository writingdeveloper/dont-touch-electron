import {
  TouchEvent,
  DailyStats,
  HabitSettings,
  UserProgress,
  StatisticsState,
  ExportData,
  DEFAULT_HABIT_SETTINGS,
  DEFAULT_PROGRESS,
  createEmptyDailyStats,
  getTodayDateString,
  timestampToLocalDateString,
  dateToLocalString,
  generateId,
} from '../types/statistics'
import { DetectionZone } from '../detection/types'

const STORAGE_KEY = 'dont-touch-statistics'
const MAX_DAILY_STATS_DAYS = 90

class StatisticsServiceClass {
  private state: StatisticsState

  constructor() {
    this.state = this.loadFromStorage()
    this.checkAndArchiveDay()
  }

  // Load state from localStorage
  private loadFromStorage(): StatisticsState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Validate and migrate if needed
        return this.validateState(parsed)
      }
    } catch (error) {
      console.error('Failed to load statistics from storage:', error)
    }

    // Return default state
    return {
      todayEvents: [],
      dailyStats: [],
      settings: { ...DEFAULT_HABIT_SETTINGS },
      progress: { ...DEFAULT_PROGRESS },
      lastMeditationRecommendedAt: null,
    }
  }

  // Validate and migrate stored state
  private validateState(stored: any): StatisticsState {
    return {
      todayEvents: Array.isArray(stored.todayEvents) ? stored.todayEvents : [],
      dailyStats: Array.isArray(stored.dailyStats) ? stored.dailyStats : [],
      settings: { ...DEFAULT_HABIT_SETTINGS, ...stored.settings },
      progress: { ...DEFAULT_PROGRESS, ...stored.progress },
      lastMeditationRecommendedAt: stored.lastMeditationRecommendedAt ?? null,
    }
  }

  // Save state to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.error('Failed to save statistics to storage:', error)
    }
  }

  // Check if we need to archive yesterday's events to daily stats
  private checkAndArchiveDay(): void {
    const today = getTodayDateString()

    // Check if we have events from previous days
    const oldEvents = this.state.todayEvents.filter(e => {
      const eventDate = timestampToLocalDateString(e.timestamp)
      return eventDate !== today
    })

    if (oldEvents.length > 0) {
      // Group by date and archive
      const eventsByDate = new Map<string, TouchEvent[]>()

      for (const event of oldEvents) {
        const eventDate = timestampToLocalDateString(event.timestamp)
        if (!eventsByDate.has(eventDate)) {
          eventsByDate.set(eventDate, [])
        }
        eventsByDate.get(eventDate)!.push(event)
      }

      // Create or update daily stats for each date
      for (const [date, events] of eventsByDate) {
        this.archiveEventsToDaily(date, events)
      }

      // Keep only today's events
      this.state.todayEvents = this.state.todayEvents.filter(e => {
        const eventDate = timestampToLocalDateString(e.timestamp)
        return eventDate === today
      })

      // Update streak
      this.updateStreak()
      this.saveToStorage()
    }
  }

  // Archive events to daily stats
  private archiveEventsToDaily(date: string, events: TouchEvent[]): void {
    let dailyStats = this.state.dailyStats.find(d => d.date === date)

    if (!dailyStats) {
      dailyStats = createEmptyDailyStats(date)
      this.state.dailyStats.push(dailyStats)
    }

    for (const event of events) {
      dailyStats.touchCount++
      dailyStats.totalDuration += event.duration

      const hour = new Date(event.timestamp).getHours()
      dailyStats.touchesByHour[hour]++

      if (!dailyStats.firstTouch || event.timestamp < dailyStats.firstTouch) {
        dailyStats.firstTouch = event.timestamp
      }
      if (!dailyStats.lastTouch || event.timestamp > dailyStats.lastTouch) {
        dailyStats.lastTouch = event.timestamp
      }
    }

    // Keep only last N days
    this.state.dailyStats.sort((a, b) => b.date.localeCompare(a.date))
    this.state.dailyStats = this.state.dailyStats.slice(0, MAX_DAILY_STATS_DAYS)
  }

  // Update streak based on daily stats
  private updateStreak(): void {
    const goal = this.state.settings.dailyTouchGoal
    const stats = [...this.state.dailyStats].sort((a, b) => b.date.localeCompare(a.date))

    let streak = 0
    const today = getTodayDateString()

    for (const daily of stats) {
      // Skip today (still in progress)
      if (daily.date === today) continue

      if (daily.touchCount <= goal) {
        streak++
      } else {
        break
      }
    }

    this.state.progress.currentStreak = streak
    if (streak > this.state.progress.longestStreak) {
      this.state.progress.longestStreak = streak
    }
  }

  // Record a new touch event
  recordTouch(duration: number, zone: DetectionZone | null = null): TouchEvent {
    this.checkAndArchiveDay()

    const event: TouchEvent = {
      id: generateId(),
      timestamp: Date.now(),
      duration,
      zone,
    }

    this.state.todayEvents.push(event)
    this.saveToStorage()

    return event
  }

  // Record completed meditation
  recordMeditation(durationMinutes: number): void {
    this.state.progress.totalMeditationMinutes += durationMinutes
    this.state.progress.totalMeditationSessions++

    // Also record to today's stats
    const today = getTodayDateString()
    let todayStats = this.state.dailyStats.find(d => d.date === today)
    if (!todayStats) {
      todayStats = createEmptyDailyStats(today)
      this.state.dailyStats.push(todayStats)
    }
    todayStats.meditationMinutes += durationMinutes
    todayStats.meditationSessions++

    this.saveToStorage()
  }

  // Mark meditation as recommended
  setMeditationRecommended(): void {
    this.state.lastMeditationRecommendedAt = Date.now()
    this.saveToStorage()
  }

  // Check if meditation should be recommended
  shouldRecommendMeditation(): boolean {
    if (!this.state.settings.enableMeditationReminder) return false

    const touchCount = this.getTodayTouchCount()
    const threshold = this.state.settings.touchThresholdForMeditation

    if (touchCount < threshold) return false

    // Check if already recommended recently
    if (this.state.lastMeditationRecommendedAt) {
      const cooldownMs = this.state.settings.meditationCooldownMinutes * 60 * 1000
      if (Date.now() - this.state.lastMeditationRecommendedAt < cooldownMs) {
        return false
      }
    }

    // Recommend at multiples of threshold
    return touchCount % threshold === 0
  }

  // Get today's touch count
  getTodayTouchCount(): number {
    this.checkAndArchiveDay()
    return this.state.todayEvents.length
  }

  // Get today's events
  getTodayEvents(): TouchEvent[] {
    this.checkAndArchiveDay()
    return [...this.state.todayEvents]
  }

  // Get today's stats (creates temporary stats from events)
  getTodayStats(): DailyStats {
    this.checkAndArchiveDay()
    const today = getTodayDateString()
    const stats = createEmptyDailyStats(today)

    for (const event of this.state.todayEvents) {
      stats.touchCount++
      stats.totalDuration += event.duration

      const hour = new Date(event.timestamp).getHours()
      stats.touchesByHour[hour]++

      if (!stats.firstTouch || event.timestamp < stats.firstTouch) {
        stats.firstTouch = event.timestamp
      }
      if (!stats.lastTouch || event.timestamp > stats.lastTouch) {
        stats.lastTouch = event.timestamp
      }
    }

    // Add meditation stats from archived today if exists
    const archivedToday = this.state.dailyStats.find(d => d.date === today)
    if (archivedToday) {
      stats.meditationMinutes = archivedToday.meditationMinutes
      stats.meditationSessions = archivedToday.meditationSessions
    }

    return stats
  }

  // Get weekly stats (last 7 days)
  getWeeklyStats(): DailyStats[] {
    this.checkAndArchiveDay()
    const result: DailyStats[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = dateToLocalString(date)

      if (i === 0) {
        // Today - use live stats
        result.push(this.getTodayStats())
      } else {
        // Historical - use archived or empty
        const archived = this.state.dailyStats.find(d => d.date === dateStr)
        result.push(archived || createEmptyDailyStats(dateStr))
      }
    }

    return result
  }

  // Get monthly stats for a specific month
  getMonthlyStats(year: number, month: number): Map<string, DailyStats> {
    this.checkAndArchiveDay()
    const result = new Map<string, DailyStats>()
    const today = getTodayDateString()

    // Get all days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = dateToLocalString(date)

      if (dateStr === today) {
        // Today - use live stats
        result.set(dateStr, this.getTodayStats())
      } else if (dateStr < today) {
        // Historical - use archived or empty
        const archived = this.state.dailyStats.find(d => d.date === dateStr)
        if (archived) {
          result.set(dateStr, archived)
        }
      }
      // Future dates - don't add to map
    }

    return result
  }

  // Get settings
  getSettings(): HabitSettings {
    return { ...this.state.settings }
  }

  // Update settings
  updateSettings(settings: Partial<HabitSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings }
    this.saveToStorage()
  }

  // Get progress
  getProgress(): UserProgress {
    return { ...this.state.progress }
  }

  // Export all data
  exportData(): ExportData {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.state.settings,
      progress: this.state.progress,
      dailyStats: this.state.dailyStats,
    }
  }

  // Import data
  importData(data: ExportData): boolean {
    try {
      if (!data.version || !data.dailyStats) {
        throw new Error('Invalid export data format')
      }

      this.state.settings = { ...DEFAULT_HABIT_SETTINGS, ...data.settings }
      this.state.progress = { ...DEFAULT_PROGRESS, ...data.progress }
      this.state.dailyStats = data.dailyStats
      this.state.todayEvents = [] // Don't import today's events
      this.state.lastMeditationRecommendedAt = null

      this.saveToStorage()
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  // Clear all data
  clearAllData(): void {
    this.state = {
      todayEvents: [],
      dailyStats: [],
      settings: { ...DEFAULT_HABIT_SETTINGS },
      progress: { ...DEFAULT_PROGRESS },
      lastMeditationRecommendedAt: null,
    }
    this.saveToStorage()
  }
}

// Singleton instance
export const StatisticsService = new StatisticsServiceClass()
