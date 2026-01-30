# Test Coverage Analysis

## Current State

### Existing Tests
The project currently has **only 1 test file**: `test/e2e.spec.ts`

This test file is **outdated and tests the wrong application** - it's testing the default Electron-Vite-React template (looking for "Electron + Vite + React" title and a counter button) rather than the actual Don't Touch application.

### Testing Infrastructure
- **Framework**: Vitest 2.1.5 + Playwright 1.48.2 for E2E
- **Configuration**: `vitest.config.ts` with 29-second timeout
- **Test directory**: `test/`
- **Test pattern**: `test/**/*.{test,spec}.?(c|m)[jt]s?(x)`

## Test Coverage Gaps

### Critical Priority - Core Business Logic

#### 1. ProximityAnalyzer (`src/detection/ProximityAnalyzer.ts`)
**Lines**: 394 | **Current Coverage**: 0%

This is the heart of the detection system. It implements a state machine for detecting hand-to-face proximity.

**Recommended Tests**:
- State machine transitions: IDLE → DETECTING → ALERT → COOLDOWN → IDLE
- State transitions when hand is removed during DETECTING
- Progress calculation during detection phase
- Cooldown progress calculation
- Alert callback invocation at correct time
- `requireHandRemoval` flag behavior after alert
- Zone detection with various hand positions
- `checkFingertipInsideFace()` ellipse calculation
- `getZoneCenters()` coordinate calculations
- `getEarPositions()` fallback estimation
- Config updates during active detection
- `reset()` function behavior

**Example Test Cases**:
```typescript
describe('ProximityAnalyzer', () => {
  describe('state machine', () => {
    it('transitions from IDLE to DETECTING when hand near head')
    it('returns to IDLE when hand removed during DETECTING')
    it('transitions to ALERT after triggerTime elapsed')
    it('transitions to COOLDOWN immediately after ALERT')
    it('returns to IDLE after cooldownTime elapsed')
    it('requires hand removal before re-detection after alert')
  })

  describe('zone detection', () => {
    it('detects fingertip inside fullFace ellipse')
    it('detects fingertip in specific zone when enabled')
    it('ignores zones that are not enabled')
    it('returns correct activeZone')
  })

  describe('progress calculation', () => {
    it('calculates detection progress correctly')
    it('calculates cooldown progress correctly')
  })
})
```

#### 2. StatisticsService (`src/services/StatisticsService.ts`)
**Lines**: 384 | **Current Coverage**: 0%

Manages all user statistics, including touch events, daily stats, streaks, and meditation tracking.

**Recommended Tests**:
- `recordTouch()` - creates event with correct structure
- `getTodayTouchCount()` - accurate counting
- `getTodayEvents()` - returns defensive copy
- `getTodayStats()` - aggregates events correctly
- `getWeeklyStats()` - returns 7 days of data
- `getMonthlyStats()` - handles month boundaries
- `recordMeditation()` - updates stats correctly
- `shouldRecommendMeditation()` - threshold and cooldown logic
- `updateStreak()` - streak calculation with goal
- `checkAndArchiveDay()` - day rollover logic
- `archiveEventsToDaily()` - event aggregation
- `exportData()` / `importData()` - data integrity
- `clearAllData()` - complete reset
- `loadFromStorage()` / `saveToStorage()` - persistence
- `validateState()` - migration and defaults

**Example Test Cases**:
```typescript
describe('StatisticsService', () => {
  describe('touch recording', () => {
    it('records touch event with correct structure')
    it('increments touch count correctly')
    it('updates storage after recording')
  })

  describe('streak calculation', () => {
    it('calculates streak based on daily goal')
    it('resets streak when goal exceeded')
    it('tracks longest streak')
  })

  describe('meditation recommendations', () => {
    it('recommends meditation at threshold')
    it('respects cooldown period')
    it('disables when setting is off')
  })

  describe('data persistence', () => {
    it('saves state to localStorage')
    it('loads state from localStorage')
    it('handles corrupted data gracefully')
    it('migrates old data format')
  })
})
```

#### 3. Statistics Helper Functions (`src/types/statistics.ts`)
**Lines**: 99 | **Current Coverage**: 0%

**Recommended Tests**:
- `createEmptyDailyStats()` - correct structure and defaults
- `getTodayDateString()` - ISO format
- `generateId()` - uniqueness and format

### High Priority - Detection System

#### 4. Detection Types (`src/detection/types.ts`)
**Lines**: 108 | **Current Coverage**: 0%

**Recommended Tests**:
- `DEFAULT_ENABLED_ZONES` contains expected defaults
- `ALL_SPECIFIC_ZONES` includes all zones except fullFace
- Zone category arrays are correct (`HAIR_ZONES`, `FACE_ZONES`)

#### 5. useDetection Hook (`src/hooks/useDetection.ts`)
**Lines**: 209 | **Current Coverage**: 0%

**Recommended Tests** (using React Testing Library):
- Model loading state management
- Detection state updates
- Config updates propagate to analyzer
- `startDetection()` / `stopDetection()` lifecycle
- Cleanup on unmount
- Error handling during initialization

#### 6. useCamera Hook (`src/hooks/useCamera.ts`)
**Lines**: 118 | **Current Coverage**: 0%

**Recommended Tests**:
- Device enumeration
- Camera selection and switching
- Stream management
- Error handling for permission denial
- Cleanup on unmount

#### 7. useStatistics Hook (`src/hooks/useStatistics.ts`)
**Lines**: 152 | **Current Coverage**: 0%

**Recommended Tests**:
- State synchronization with StatisticsService
- Refresh mechanism
- Settings updates

### Medium Priority - UI Components

#### 8. React Components (14 files, ~2000 lines total)
**Current Coverage**: 0%

**Priority Order**:
1. `SettingsPanel.tsx` - Complex form with validation
2. `CalendarView.tsx` - Date calculations and display
3. `DailyStatsCard.tsx` - Data formatting
4. `Controls.tsx` - User interactions
5. `AlertOverlay.tsx` - Timer and display logic
6. `MeditationModal.tsx` / `MeditationPlayer.tsx` - Audio/timer

**Recommended Testing Approach**:
- Use React Testing Library
- Test user interactions and state changes
- Mock service dependencies
- Verify accessibility

### Lower Priority

#### 9. MediaPipeDetector (`src/detection/MediaPipeDetector.ts`)
**Lines**: 357 | **Current Coverage**: 0%

Complex to test due to MediaPipe dependency. Consider:
- Mocking MediaPipe tasks-vision
- Testing result transformation logic
- Testing drawing functions with canvas mocks

#### 10. Electron Main Process (`electron/main/index.ts`)
**Lines**: 417 | **Current Coverage**: 0%

Requires specialized Electron testing:
- IPC handler unit tests
- Window management tests
- Tray menu behavior
- Settings persistence

#### 11. E2E Tests
Update the existing `test/e2e.spec.ts` to test actual application:
- Application launches successfully
- Main window displays correctly
- Camera permission handling
- Detection starts/stops
- Settings panel opens
- Alert overlay appears

## Recommended Test File Structure

```
test/
├── unit/
│   ├── detection/
│   │   ├── ProximityAnalyzer.test.ts
│   │   └── types.test.ts
│   ├── services/
│   │   └── StatisticsService.test.ts
│   ├── types/
│   │   └── statistics.test.ts
│   └── hooks/
│       ├── useDetection.test.ts
│       ├── useCamera.test.ts
│       └── useStatistics.test.ts
├── components/
│   ├── SettingsPanel.test.tsx
│   ├── CalendarView.test.tsx
│   ├── DailyStatsCard.test.tsx
│   └── ... (other components)
├── integration/
│   └── StatisticsFlow.test.ts
└── e2e/
    └── app.spec.ts
```

## Configuration Improvements

### Update vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    root: __dirname,
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    testTimeout: 1000 * 29,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/main.tsx'],
    },
  },
})
```

### Add test/setup.ts

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock MediaPipe
vi.mock('@mediapipe/tasks-vision', () => ({
  FaceLandmarker: {
    createFromOptions: vi.fn(),
  },
  HandLandmarker: {
    createFromOptions: vi.fn(),
  },
  FilesetResolver: {
    forVisionTasks: vi.fn(),
  },
}))
```

### Required Dev Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@vitest/coverage-v8": "^2.1.0",
    "jsdom": "^24.0.0"
  }
}
```

## Priority Implementation Order

1. **Week 1**: ProximityAnalyzer unit tests (critical business logic)
2. **Week 2**: StatisticsService unit tests (data integrity)
3. **Week 3**: Helper functions and type tests
4. **Week 4**: React hooks tests
5. **Week 5+**: Component tests and E2E updates

## Estimated Coverage Goals

| Area | Current | Target | Priority |
|------|---------|--------|----------|
| ProximityAnalyzer | 0% | 90%+ | Critical |
| StatisticsService | 0% | 90%+ | Critical |
| Helper functions | 0% | 100% | High |
| React Hooks | 0% | 70%+ | High |
| Components | 0% | 60%+ | Medium |
| E2E | 0% | Core flows | Medium |

## Summary

The codebase has **virtually no test coverage**. The existing E2E test file tests the wrong application. The most critical areas requiring immediate attention are:

1. **ProximityAnalyzer** - The core detection state machine
2. **StatisticsService** - User data and statistics management
3. **Helper functions** - Data transformation utilities

These three areas contain the core business logic and should be prioritized for comprehensive unit testing. The React components and E2E tests can follow once the foundation is solid.
