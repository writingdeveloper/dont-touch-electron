import { DetectionZone } from '../detection/types'

// Individual touch event
export interface TouchEvent {
  id: string
  timestamp: number        // Unix timestamp (ms)
  duration: number         // Time hand was near face before alert (ms)
  zone: DetectionZone | null
}

// Daily aggregated statistics
export interface DailyStats {
  date: string             // ISO date string (YYYY-MM-DD)
  touchCount: number       // Total touches
  totalDuration: number    // Total time near face (ms)
  touchesByHour: number[]  // 24-element array for hourly breakdown
  meditationMinutes: number
  meditationSessions: number
  firstTouch: number | null  // Timestamp of first touch
  lastTouch: number | null   // Timestamp of last touch
}

// User settings for habit tracking
export interface HabitSettings {
  touchThresholdForMeditation: number  // Trigger meditation after N touches (default: 5)
  dailyTouchGoal: number               // Stay under this to maintain streak (default: 10)
  meditationDuration: number           // Default meditation length in seconds (default: 180)
  enableMeditationReminder: boolean    // Show meditation recommendation
  meditationCooldownMinutes: number    // Don't recommend again for N minutes (default: 30)
}

// User progress tracking
export interface UserProgress {
  currentStreak: number      // Days meeting goal
  longestStreak: number      // Best streak ever
  totalMeditationMinutes: number
  totalMeditationSessions: number
  startDate: string          // When user started (ISO date)
}

// Full statistics state
export interface StatisticsState {
  todayEvents: TouchEvent[]     // Today's events only
  dailyStats: DailyStats[]      // Historical daily summaries (last 90 days)
  settings: HabitSettings
  progress: UserProgress
  lastMeditationRecommendedAt: number | null
}

// Export data format
export interface ExportData {
  version: string
  exportedAt: string
  settings: HabitSettings
  progress: UserProgress
  dailyStats: DailyStats[]
}

// Default values
export const DEFAULT_HABIT_SETTINGS: HabitSettings = {
  touchThresholdForMeditation: 5,
  dailyTouchGoal: 10,
  meditationDuration: 180,
  enableMeditationReminder: true,
  meditationCooldownMinutes: 30,
}

export const DEFAULT_PROGRESS: UserProgress = {
  currentStreak: 0,
  longestStreak: 0,
  totalMeditationMinutes: 0,
  totalMeditationSessions: 0,
  startDate: new Date().toISOString().split('T')[0],
}

// Helper to create empty daily stats
export function createEmptyDailyStats(date: string): DailyStats {
  return {
    date,
    touchCount: 0,
    totalDuration: 0,
    touchesByHour: new Array(24).fill(0),
    meditationMinutes: 0,
    meditationSessions: 0,
    firstTouch: null,
    lastTouch: null,
  }
}

// Helper to get today's date string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

// Generate UUID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
