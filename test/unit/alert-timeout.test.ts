import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../../src/constants/storage-keys'
import {
  coerceAlertTimeoutMinutes,
  createAlertTimeout,
  formatAlertTimeoutRemaining,
  loadAlertTimeout,
  sanitizeAlertTimeout,
  saveAlertTimeout,
} from '../../src/utils/alertTimeout'

class MemoryStorage {
  private data = new Map<string, string>()

  getItem(key: string) {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.data.set(key, value)
  }

  removeItem(key: string) {
    this.data.delete(key)
  }
}

describe('alert timeout helpers', () => {
  it('creates and loads a valid active timeout', () => {
    const storage = new MemoryStorage()
    const timeout = createAlertTimeout(15, 1_000)

    saveAlertTimeout(storage, timeout)

    expect(loadAlertTimeout(storage, 2_000)).toEqual(timeout)
  })

  it('clears expired timeout state', () => {
    const storage = new MemoryStorage()
    storage.setItem(STORAGE_KEYS.ALERT_TIMEOUT, JSON.stringify(createAlertTimeout(5, 1_000)))

    expect(loadAlertTimeout(storage, 302_000)).toBeNull()
    expect(storage.getItem(STORAGE_KEYS.ALERT_TIMEOUT)).toBeNull()
  })

  it('rejects corrupt and impossible timeout state', () => {
    expect(sanitizeAlertTimeout({ reason: 'work', startedAt: 1_000, activeUntil: 2_000 }, 1_100)).toBeNull()
    expect(sanitizeAlertTimeout({ reason: 'eating', startedAt: 1_000, activeUntil: 1_000 }, 1_100)).toBeNull()
    expect(sanitizeAlertTimeout({ reason: 'eating', startedAt: 1_000, activeUntil: 3_700_001 }, 1_100)).toBeNull()
    expect(sanitizeAlertTimeout({ reason: 'eating', startedAt: 10_000, activeUntil: 20_000 }, 1_000)).toBeNull()
  })

  it('coerces timeout duration and formats remaining time', () => {
    expect(coerceAlertTimeoutMinutes(30)).toBe(30)
    expect(coerceAlertTimeoutMinutes(17)).toBe(15)
    expect(formatAlertTimeoutRemaining(125_000)).toBe('2m 5s')
    expect(formatAlertTimeoutRemaining(60_000)).toBe('1m')
  })

  it('treats storage cleanup failures as non-fatal', () => {
    const storage = {
      getItem: (_key: string) => '{broken',
      setItem: (_key: string, _value: string) => {
        throw new Error('blocked')
      },
      removeItem: (_key: string) => {
        throw new Error('blocked')
      },
    }

    expect(loadAlertTimeout(storage, 1_000)).toBeNull()
    expect(() => saveAlertTimeout(storage, createAlertTimeout(5, 1_000))).not.toThrow()
  })
})
