import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '../../src/constants/storage-keys'

describe('first-run setup persistence', () => {
  it('uses a stable localStorage key for setup completion', () => {
    expect(STORAGE_KEYS.SETUP_COMPLETE).toBe('dont-touch-setup-complete')
  })
})
