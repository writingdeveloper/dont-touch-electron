import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock logger before importing the service
vi.mock('../../src/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// Create mock localStorage
const mockStorage = new Map<string, string>()
const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage.set(key, value) }),
  removeItem: vi.fn((key: string) => { mockStorage.delete(key) }),
  clear: vi.fn(() => mockStorage.clear()),
  get length() { return mockStorage.size },
  key: vi.fn((index: number) => [...mockStorage.keys()][index] ?? null),
}

vi.stubGlobal('localStorage', mockLocalStorage)

import { StatisticsServiceClass } from '../../src/services/StatisticsService'
import { DEFAULT_HABIT_SETTINGS, DEFAULT_PROGRESS, createEmptyDailyStats } from '../../src/types/statistics'

function createService(): StatisticsServiceClass {
  return new StatisticsServiceClass()
}

describe('StatisticsService', () => {
  beforeEach(() => {
    mockStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
    // June 15, 2024 12:00:00
    vi.setSystemTime(new Date(2024, 5, 15, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with default state when localStorage is empty', () => {
      const service = createService()
      expect(service.getTodayTouchCount()).toBe(0)
      expect(service.getSettings()).toEqual(DEFAULT_HABIT_SETTINGS)
      expect(service.getProgress().currentStreak).toBe(0)
    })

    it('should load state from localStorage', () => {
      const state = {
        todayEvents: [],
        dailyStats: [],
        settings: { ...DEFAULT_HABIT_SETTINGS, dailyTouchGoal: 20 },
        progress: { ...DEFAULT_PROGRESS, currentStreak: 5 },
        lastMeditationRecommendedAt: null,
      }
      mockStorage.set('dont-touch-statistics', JSON.stringify(state))

      const service = createService()
      expect(service.getSettings().dailyTouchGoal).toBe(20)
      expect(service.getProgress().currentStreak).toBe(5)
    })

    it('should handle corrupted localStorage gracefully', () => {
      mockStorage.set('dont-touch-statistics', 'invalid json{{{')
      const service = createService()
      // Should fall back to defaults
      expect(service.getTodayTouchCount()).toBe(0)
      expect(service.getSettings()).toEqual(DEFAULT_HABIT_SETTINGS)
    })
  })

  describe('recordTouch', () => {
    it('should add a touch event', () => {
      const service = createService()
      const event = service.recordTouch(1500)

      expect(event.id).toBeTruthy()
      expect(event.timestamp).toBe(Date.now())
      expect(event.duration).toBe(1500)
      expect(event.zone).toBeNull()
      expect(service.getTodayTouchCount()).toBe(1)
    })

    it('should record zone information', () => {
      const service = createService()
      const event = service.recordTouch(1000, 'nose')
      expect(event.zone).toBe('nose')
    })

    it('should save to localStorage on each touch', () => {
      const service = createService()
      service.recordTouch(1000)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'dont-touch-statistics',
        expect.any(String)
      )
    })

    it('should increment touch count correctly', () => {
      const service = createService()
      service.recordTouch(500)
      service.recordTouch(800)
      service.recordTouch(1200)
      expect(service.getTodayTouchCount()).toBe(3)
    })
  })

  describe('getTodayStats', () => {
    it('should return empty stats when no touches', () => {
      const service = createService()
      const stats = service.getTodayStats()
      expect(stats.date).toBe('2024-06-15')
      expect(stats.touchCount).toBe(0)
      expect(stats.totalDuration).toBe(0)
      expect(stats.firstTouch).toBeNull()
      expect(stats.lastTouch).toBeNull()
    })

    it('should aggregate today\'s events', () => {
      const service = createService()
      service.recordTouch(500)

      vi.advanceTimersByTime(1000)
      service.recordTouch(800)

      const stats = service.getTodayStats()
      expect(stats.touchCount).toBe(2)
      expect(stats.totalDuration).toBe(1300)
      expect(stats.firstTouch).toBeTruthy()
      expect(stats.lastTouch).toBeTruthy()
    })

    it('should track touches by hour', () => {
      const service = createService()
      // Current time is 12:00
      service.recordTouch(500)
      service.recordTouch(800)

      const stats = service.getTodayStats()
      expect(stats.touchesByHour[12]).toBe(2)
      expect(stats.touchesByHour[0]).toBe(0)
    })
  })

  describe('recordMeditation', () => {
    it('should update meditation progress', () => {
      const service = createService()
      service.recordMeditation(5)

      const progress = service.getProgress()
      expect(progress.totalMeditationMinutes).toBe(5)
      expect(progress.totalMeditationSessions).toBe(1)
    })

    it('should accumulate meditation sessions', () => {
      const service = createService()
      service.recordMeditation(3)
      service.recordMeditation(5)

      const progress = service.getProgress()
      expect(progress.totalMeditationMinutes).toBe(8)
      expect(progress.totalMeditationSessions).toBe(2)
    })
  })

  describe('shouldRecommendMeditation', () => {
    it('should return false when touch count is below threshold', () => {
      const service = createService()
      service.recordTouch(500)
      expect(service.shouldRecommendMeditation()).toBe(false)
    })

    it('should return true when touch count reaches threshold', () => {
      const service = createService()
      // Default threshold is 5
      for (let i = 0; i < 5; i++) {
        service.recordTouch(500)
      }
      expect(service.shouldRecommendMeditation()).toBe(true)
    })

    it('should return false when meditation reminders are disabled', () => {
      const service = createService()
      service.updateSettings({ enableMeditationReminder: false })
      for (let i = 0; i < 5; i++) {
        service.recordTouch(500)
      }
      expect(service.shouldRecommendMeditation()).toBe(false)
    })

    it('should respect cooldown period', () => {
      const service = createService()
      for (let i = 0; i < 5; i++) {
        service.recordTouch(500)
      }
      expect(service.shouldRecommendMeditation()).toBe(true)

      service.setMeditationRecommended()
      // Still at 5 touches, recently recommended
      expect(service.shouldRecommendMeditation()).toBe(false)
    })
  })

  describe('exportData / importData', () => {
    it('should export data in correct format', () => {
      const service = createService()
      service.recordTouch(500)

      const data = service.exportData()
      expect(data.version).toBe('1.0')
      expect(data.exportedAt).toBeTruthy()
      expect(data.settings).toEqual(expect.objectContaining({
        dailyTouchGoal: DEFAULT_HABIT_SETTINGS.dailyTouchGoal,
      }))
      expect(data.progress).toBeDefined()
      expect(Array.isArray(data.dailyStats)).toBe(true)
    })

    it('should import valid data', () => {
      const service = createService()
      const importResult = service.importData({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings: { ...DEFAULT_HABIT_SETTINGS, dailyTouchGoal: 15 },
        progress: { ...DEFAULT_PROGRESS, longestStreak: 10 },
        dailyStats: [
          { ...createEmptyDailyStats('2024-06-14'), touchCount: 3 },
        ],
      })

      expect(importResult).toBe(true)
      expect(service.getSettings().dailyTouchGoal).toBe(15)
      expect(service.getProgress().longestStreak).toBe(10)
    })

    it('should reject invalid data', () => {
      const service = createService()
      expect(service.importData(null as any)).toBe(false)
      expect(service.importData({} as any)).toBe(false)
      expect(service.importData({ version: '', dailyStats: [] } as any)).toBe(false)
    })

    it('should filter invalid dailyStats entries', () => {
      const service = createService()
      const result = service.importData({
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings: DEFAULT_HABIT_SETTINGS,
        progress: DEFAULT_PROGRESS,
        dailyStats: [
          { ...createEmptyDailyStats('2024-06-14'), touchCount: 3 },
          null as any,
          { date: 'invalid', touchCount: -1 } as any,
          { ...createEmptyDailyStats('2024-06-13'), touchCount: 5 },
        ],
      })

      expect(result).toBe(true)
      const exported = service.exportData()
      expect(exported.dailyStats).toHaveLength(2)
    })
  })

  describe('clearAllData', () => {
    it('should reset all state', () => {
      const service = createService()
      service.recordTouch(500)
      service.recordMeditation(5)
      service.updateSettings({ dailyTouchGoal: 20 })

      service.clearAllData()

      expect(service.getTodayTouchCount()).toBe(0)
      expect(service.getSettings()).toEqual(DEFAULT_HABIT_SETTINGS)
      expect(service.getProgress().totalMeditationMinutes).toBe(0)
    })
  })

  describe('updateSettings', () => {
    it('should merge partial settings', () => {
      const service = createService()
      service.updateSettings({ dailyTouchGoal: 20 })

      const settings = service.getSettings()
      expect(settings.dailyTouchGoal).toBe(20)
      expect(settings.meditationDuration).toBe(DEFAULT_HABIT_SETTINGS.meditationDuration)
    })

    it('should save to localStorage', () => {
      const service = createService()
      mockLocalStorage.setItem.mockClear()
      service.updateSettings({ dailyTouchGoal: 15 })
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })
  })

  describe('getWeeklyStats', () => {
    it('should return 7 days of stats', () => {
      const service = createService()
      const weekly = service.getWeeklyStats()
      expect(weekly).toHaveLength(7)
    })

    it('should include today as the last entry', () => {
      const service = createService()
      const weekly = service.getWeeklyStats()
      expect(weekly[6].date).toBe('2024-06-15')
    })
  })

  describe('day archival', () => {
    it('should archive events when day changes', () => {
      const service = createService()
      service.recordTouch(500)
      service.recordTouch(800)

      // Advance to next day
      vi.setSystemTime(new Date(2024, 5, 16, 10, 0, 0))
      expect(service.getTodayTouchCount()).toBe(0)

      // Check that yesterday's data was archived
      const weekly = service.getWeeklyStats()
      const yesterday = weekly.find(s => s.date === '2024-06-15')
      expect(yesterday?.touchCount).toBe(2)
    })
  })
})
