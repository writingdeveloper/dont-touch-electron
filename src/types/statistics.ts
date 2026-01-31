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

// Helper to convert Date object to local date string (YYYY-MM-DD)
export function dateToLocalString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to convert timestamp to local date string (YYYY-MM-DD)
export function timestampToLocalDateString(timestamp: number): string {
  return dateToLocalString(new Date(timestamp))
}

// Helper to get today's date string (local timezone)
export function getTodayDateString(): string {
  return dateToLocalString(new Date())
}

// Generate UUID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
  startDate: dateToLocalString(new Date()),
}
