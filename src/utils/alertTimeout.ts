import {
  ALERT_TIMEOUT_MINUTES,
  AlertTimeoutMinutes,
  AlertTimeoutState,
} from '../types/app-settings'
import { STORAGE_KEYS } from '../constants/storage-keys'

const MAX_TIMEOUT_MS = Math.max(...ALERT_TIMEOUT_MINUTES) * 60 * 1000

type TimeoutStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function isAlertTimeoutMinutes(value: unknown): value is AlertTimeoutMinutes {
  return ALERT_TIMEOUT_MINUTES.includes(value as AlertTimeoutMinutes)
}

export function coerceAlertTimeoutMinutes(value: unknown, fallback: AlertTimeoutMinutes = 15): AlertTimeoutMinutes {
  return isAlertTimeoutMinutes(value) ? value : fallback
}

export function createAlertTimeout(minutes: AlertTimeoutMinutes, now = Date.now()): AlertTimeoutState {
  return {
    reason: 'eating',
    startedAt: now,
    activeUntil: now + minutes * 60 * 1000,
  }
}

export function sanitizeAlertTimeout(value: unknown, now = Date.now()): AlertTimeoutState | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<AlertTimeoutState>
  const startedAt = candidate.startedAt
  const activeUntil = candidate.activeUntil
  if (candidate.reason !== 'eating') return null
  if (typeof startedAt !== 'number' || typeof activeUntil !== 'number') return null
  if (!Number.isFinite(startedAt) || !Number.isFinite(activeUntil)) return null
  if (activeUntil <= now) return null
  if (activeUntil <= startedAt) return null
  if (activeUntil - startedAt > MAX_TIMEOUT_MS) return null
  if (startedAt > now + 5_000) return null

  return {
    reason: 'eating',
    startedAt,
    activeUntil,
  }
}

export function loadAlertTimeout(storage: TimeoutStorage, now = Date.now()): AlertTimeoutState | null {
  try {
    const raw = storage.getItem(STORAGE_KEYS.ALERT_TIMEOUT)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    const timeout = sanitizeAlertTimeout(parsed, now)
    if (!timeout) {
      clearAlertTimeout(storage)
    }
    return timeout
  } catch {
    clearAlertTimeout(storage)
    return null
  }
}

export function saveAlertTimeout(storage: TimeoutStorage, timeout: AlertTimeoutState): void {
  try {
    storage.setItem(STORAGE_KEYS.ALERT_TIMEOUT, JSON.stringify(timeout))
  } catch {
    // Storage may be unavailable or full. Timeout state is best-effort.
  }
}

export function clearAlertTimeout(storage: TimeoutStorage): void {
  try {
    storage.removeItem(STORAGE_KEYS.ALERT_TIMEOUT)
  } catch {
    // Storage may be unavailable. Timeout state is best-effort.
  }
}

export function isAlertTimeoutActive(timeout: AlertTimeoutState | null, now = Date.now()): boolean {
  return Boolean(timeout && sanitizeAlertTimeout(timeout, now))
}

export function getAlertTimeoutRemainingMs(timeout: AlertTimeoutState | null, now = Date.now()): number {
  if (!timeout) return 0
  return Math.max(0, timeout.activeUntil - now)
}

export function formatAlertTimeoutRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) return `${seconds}s`
  if (seconds === 0) return `${minutes}m`
  return `${minutes}m ${seconds}s`
}
