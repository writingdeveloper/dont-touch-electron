import path from 'node:path'
import {
  type ElectronApplication,
  type Page,
  _electron as electron,
} from 'playwright'
import {
  beforeAll,
  afterAll,
  describe,
  expect,
  test,
} from 'vitest'

const root = path.join(__dirname, '..')
let electronApp: ElectronApplication
let page: Page

if (process.platform === 'linux') {
  // Skip on Linux CI (no display)
  test(() => expect(true).true)
} else {
  beforeAll(async () => {
    electronApp = await electron.launch({
      args: ['.', '--no-sandbox'],
      cwd: root,
      env: { ...process.env, NODE_ENV: 'development' },
    })
    page = await electronApp.firstWindow()
  }, 30_000)

  afterAll(async () => {
    if (page) {
      await page.screenshot({ path: 'test/screenshots/e2e.png' }).catch(() => {})
      await page.close()
    }
    if (electronApp) {
      await electronApp.close()
    }
  })

  describe("Don't Touch e2e tests", () => {
    test('app should launch and show a window', async () => {
      const title = await page.title()
      expect(title).toContain("Don't Touch")
    })

    test('splash screen should be visible initially', async () => {
      // The splash screen has a progress bar or loading indicators
      const body = await page.textContent('body')
      expect(body).toBeTruthy()
    })

    test('main app should load after splash', async () => {
      // Wait for splash to finish (default 6s + buffer)
      await page.waitForTimeout(8000)

      // After splash, the main app should have the control button
      const hasButton = await page.$('button')
      expect(hasButton).toBeTruthy()
    }, 15_000)

    test('settings button should be present', async () => {
      const settingsBtn = await page.$('.settings-toggle')
      expect(settingsBtn).toBeTruthy()
    })
  })
}
