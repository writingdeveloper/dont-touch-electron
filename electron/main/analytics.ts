import { app } from 'electron'
import { initialize as initAptabase, trackEvent } from '@aptabase/electron/main'

const APP_KEY = 'A-SH-5688838680'
const HOST = 'https://aptabase.devmanage.duckdns.org'

export function initAnalytics(): void {
  initAptabase(APP_KEY, { host: HOST })
  console.log('[Aptabase] init', { host: HOST, isPackaged: app.isPackaged })
}

export async function trackAnalytics(
  eventName: string,
  props?: Record<string, string | number>
): Promise<void> {
  try {
    await trackEvent(eventName, props)
    if (!app.isPackaged) console.log(`[Aptabase] sent ${eventName}`, props ?? '')
  } catch (err) {
    console.error(`[Aptabase] failed ${eventName}:`, err)
  }
}
