import { describe, expect, it } from 'vitest'
import { translations } from '../../src/i18n/translations'

describe('English private-coach copy', () => {
  it('does not use punitive alert language for the main monitoring flow', () => {
    const englishCopy = [
      translations.en.statusInit,
      translations.en.alertWarning,
      translations.en.alertTitle,
      translations.en.alertSubtitle,
      translations.en.alertViolation,
      translations.en.alertMoveHandAway,
      translations.en.controlLoading,
      translations.en.controlStartingCamera,
      translations.en.controlRequestingCamera,
      translations.en.alertTimeoutButton,
      translations.en.alertTimeoutResume,
      translations.en.alertTimeoutClearToResume,
      translations.en.videoCameraOffline,
      translations.en.videoInitialize,
    ].join(' ')

    expect(englishCopy).not.toMatch(/WARNING|VIOLATION|FACE TOUCH DETECTED|Remove your hand|MOVE HAND|INIT|Initializing MediaPipe/)
  })

  it('keeps clear recovery and alert actions', () => {
    expect(translations.en.statusInit).toBe('Starting')
    expect(translations.en.alertTitle).toBe('Hand near face')
    expect(translations.en.alertSubtitle).toBe('Move your hand away.')
    expect(translations.en.alertClearToDismiss).toBe('Clear to close')
    expect(translations.en.controlLoading).toBe('Preparing detection...')
    expect(translations.en.alertTimeoutButton).toBe('Break Time')
    expect(translations.en.alertTimeoutResume).toBe('Resume reminders')
  })
})

describe('Localized alert tone', () => {
  it('does not keep legacy warning or violation labels in supported locales', () => {
    const legacyLabels = /^(WARNING|VIOLATION|INIT|INIC|ИНИЦ|경고|警告|ADVERTENCIA|ПРЕДУПРЕЖДЕНИЕ|위반|違反|违规|VIOLACIÓN|НАРУШЕНИЕ)$/

    for (const [locale, copy] of Object.entries(translations)) {
      expect(copy.statusInit, `${locale} statusInit`).not.toMatch(legacyLabels)
      expect(copy.alertWarning, `${locale} alertWarning`).not.toMatch(legacyLabels)
      expect(copy.alertViolation, `${locale} alertViolation`).not.toMatch(legacyLabels)
    }
  })
})
