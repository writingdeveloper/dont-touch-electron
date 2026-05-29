import { app } from 'electron'
import { initialize as initAptabase, trackEvent } from '@aptabase/electron/main'

const APP_KEY = 'A-SH-5688838680'
const HOST = 'https://***REMOVED***'

// Opt-out gate. Anonymous analytics are on by default; the user can disable them
// in Settings, which routes here so BOTH main-process events and renderer events
// (via the track-event IPC, which calls trackAnalytics) are suppressed.
let analyticsEnabled = true

export function setAnalyticsEnabled(enabled: boolean): void {
  analyticsEnabled = enabled
}

export function initAnalytics(): void {
  initAptabase(APP_KEY, { host: HOST })
  console.log('[Aptabase] init', { host: HOST, isPackaged: app.isPackaged })
}

export async function trackAnalytics(
  eventName: string,
  props?: Record<string, string | number>
): Promise<void> {
  if (!analyticsEnabled) return
  try {
    await trackEvent(eventName, props)
    if (!app.isPackaged) console.log(`[Aptabase] sent ${eventName}`, props ?? '')
  } catch (err) {
    console.error(`[Aptabase] failed ${eventName}:`, err)
  }
}
