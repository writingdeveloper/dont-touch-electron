import { describe, it, expect } from 'vitest'
import {
  dateToLocalString,
  timestampToLocalDateString,
  getTodayDateString,
  generateId,
  createEmptyDailyStats,
  DEFAULT_HABIT_SETTINGS,
  DEFAULT_PROGRESS,
} from '../../src/types/statistics'

describe('dateToLocalString', () => {
  it('should format date as YYYY-MM-DD', () => {
    const date = new Date(2024, 0, 15) // Jan 15, 2024
    expect(dateToLocalString(date)).toBe('2024-01-15')
  })

  it('should pad single-digit months and days', () => {
    const date = new Date(2024, 2, 5) // Mar 5, 2024
    expect(dateToLocalString(date)).toBe('2024-03-05')
  })

  it('should handle December 31', () => {
    const date = new Date(2024, 11, 31) // Dec 31, 2024
    expect(dateToLocalString(date)).toBe('2024-12-31')
  })
})

describe('timestampToLocalDateString', () => {
  it('should convert timestamp to date string', () => {
    const timestamp = new Date(2024, 5, 15, 10, 30).getTime()
    expect(timestampToLocalDateString(timestamp)).toBe('2024-06-15')
  })
})

describe('getTodayDateString', () => {
  it('should return today in YYYY-MM-DD format', () => {
    const result = getTodayDateString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(result).toBe(dateToLocalString(new Date()))
  })
})

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
  })

  it('should contain a timestamp component', () => {
    const id = generateId()
    expect(id).toContain('-')
    const timestampPart = parseInt(id.split('-')[0])
    expect(timestampPart).toBeGreaterThan(0)
  })
})

describe('createEmptyDailyStats', () => {
  it('should create stats with zero counts', () => {
    const stats = createEmptyDailyStats('2024-01-15')
    expect(stats.date).toBe('2024-01-15')
    expect(stats.touchCount).toBe(0)
    expect(stats.totalDuration).toBe(0)
    expect(stats.meditationMinutes).toBe(0)
    expect(stats.meditationSessions).toBe(0)
    expect(stats.firstTouch).toBeNull()
    expect(stats.lastTouch).toBeNull()
  })

  it('should create 24-element hour array', () => {
    const stats = createEmptyDailyStats('2024-01-15')
    expect(stats.touchesByHour).toHaveLength(24)
    expect(stats.touchesByHour.every(v => v === 0)).toBe(true)
  })
})

describe('DEFAULT_HABIT_SETTINGS', () => {
  it('should have reasonable defaults', () => {
    expect(DEFAULT_HABIT_SETTINGS.touchThresholdForMeditation).toBe(5)
    expect(DEFAULT_HABIT_SETTINGS.dailyTouchGoal).toBe(10)
    expect(DEFAULT_HABIT_SETTINGS.meditationDuration).toBe(180)
    expect(DEFAULT_HABIT_SETTINGS.enableMeditationReminder).toBe(true)
    expect(DEFAULT_HABIT_SETTINGS.meditationCooldownMinutes).toBe(30)
  })
})

describe('DEFAULT_PROGRESS', () => {
  it('should start with zero progress', () => {
    expect(DEFAULT_PROGRESS.currentStreak).toBe(0)
    expect(DEFAULT_PROGRESS.longestStreak).toBe(0)
    expect(DEFAULT_PROGRESS.totalMeditationMinutes).toBe(0)
    expect(DEFAULT_PROGRESS.totalMeditationSessions).toBe(0)
  })

  it('should have a valid start date', () => {
    expect(DEFAULT_PROGRESS.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
