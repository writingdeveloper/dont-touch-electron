import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('electron', () => ({ app: { isPackaged: true } }))
vi.mock('@aptabase/electron/main', () => ({
  initialize: vi.fn(),
  trackEvent: vi.fn().mockResolvedValue(undefined),
}))

import { trackAnalytics, setAnalyticsEnabled } from '../../electron/main/analytics'
import { trackEvent } from '@aptabase/electron/main'

describe('analytics opt-out gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAnalyticsEnabled(true) // default: enabled
  })

  it('forwards events to Aptabase when analytics is enabled', async () => {
    setAnalyticsEnabled(true)
    await trackAnalytics('app_started')
    expect(trackEvent).toHaveBeenCalledWith('app_started', undefined)
  })

  it('sends nothing when the user has opted out', async () => {
    setAnalyticsEnabled(false)
    await trackAnalytics('app_started', { foo: 1 })
    await trackAnalytics('face_touch_detected')
    expect(trackEvent).not.toHaveBeenCalled()
  })
})
