import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { Language, languageNames } from '../i18n/translations'
import { HabitSettings, ExportData } from '../types/statistics'
import { DetectionZone, HAIR_ZONES, FACE_ZONES } from '../detection/types'
import {
  ALERT_TIMEOUT_MINUTES,
  AlertTimeoutMinutes,
  AppSettings,
  DEFAULT_APP_SETTINGS,
} from '../types/app-settings'
import { STORAGE_KEYS } from '../constants/storage-keys'
import { IPC_CHANNELS } from '../constants/ipc-channels'
import { safeInvoke } from '../utils/ipc'
import { clampFloat, clampInt } from '../utils/validation'
import {
  CAMERA_QUALITY_PROFILES,
  CameraQuality,
  CameraStreamInfo,
  coerceCameraQuality,
  formatCameraStreamInfo,
} from '../utils/cameraQuality'
import { TONE_PRESETS, VOICE_PRESETS } from '../audio/soundPresets'
import { listCustomSounds, addCustomSound, deleteCustomSound, type CustomSoundEntry } from '../audio/customSoundStorage'
import { useFocusTrap } from '../hooks/useFocusTrap'

type SettingsTab = 'setup' | 'detection' | 'alerts' | 'habit' | 'privacy' | 'app'
const SETTINGS_TAB_ORDER: SettingsTab[] = ['setup', 'detection', 'alerts', 'habit', 'privacy', 'app']
type SettingsNotice = { kind: 'success' | 'error' | 'info'; message: string } | null

const DETECTION_PRESETS: Record<'gentle' | 'balanced' | 'strict', Pick<DetectionConfig, 'sensitivity' | 'triggerTime' | 'cooldownTime'>> = {
  gentle: { sensitivity: 0.35, triggerTime: 1.6, cooldownTime: 3.5 },
  balanced: { sensitivity: 0.5, triggerTime: 1.0, cooldownTime: 2.0 },
  strict: { sensitivity: 0.72, triggerTime: 0.7, cooldownTime: 1.5 },
}

interface DetectionConfig {
  triggerTime: number
  cooldownTime: number
  sensitivity: number
  enabledZones: DetectionZone[]
}

interface VideoDevice {
  deviceId: string
  label: string
}

interface SettingsPanelProps {
  config: DetectionConfig
  onConfigChange: (config: Partial<DetectionConfig>) => void
  isRunning: boolean
  habitSettings?: HabitSettings
  onHabitSettingsChange?: (settings: Partial<HabitSettings>) => void
  onExportData?: () => ExportData
  onImportData?: (data: ExportData) => boolean
  cameraDevices?: VideoDevice[]
  cameraStreamInfo?: CameraStreamInfo | null
  selectedCameraId?: string | null
  onCameraChange?: (deviceId: string | null) => void
  cameraQuality: CameraQuality
  onCameraQualityChange: (quality: CameraQuality) => void
  hidePreview?: boolean
  onHidePreviewChange?: (hide: boolean) => void
  closeAction?: 'ask' | 'quit' | 'tray'
  onCloseActionChange?: (action: 'ask' | 'quit' | 'tray') => void
  alertSoundId: string
  alertVolume: number
  onAlertSoundChange: (changes: { alertSoundId?: string; alertVolume?: number }) => void
  onPreviewSound: (id: string) => void
  alertTimeoutDefaultMinutes: AlertTimeoutMinutes
  onAlertTimeoutDefaultChange: (minutes: AlertTimeoutMinutes) => void
}

export function SettingsPanel({
  config,
  onConfigChange,
  habitSettings,
  onHabitSettingsChange,
  onExportData,
  onImportData,
  cameraDevices = [],
  cameraStreamInfo = null,
  selectedCameraId,
  onCameraChange,
  cameraQuality,
  onCameraQualityChange,
  hidePreview = false,
  onHidePreviewChange,
  closeAction = 'ask',
  onCloseActionChange,
  alertSoundId,
  alertVolume,
  onAlertSoundChange,
  onPreviewSound,
  alertTimeoutDefaultMinutes,
  onAlertTimeoutDefaultChange,
}: SettingsPanelProps) {
  const { t, language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>('setup')
  const [isDetectionAdvancedOpen, setIsDetectionAdvancedOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const settingsPanelRef = useFocusTrap(isOpen)

  const [customSounds, setCustomSounds] = useState<CustomSoundEntry[]>([])
  const [allLanguages, setAllLanguages] = useState(false)
  const [settingsNotice, setSettingsNotice] = useState<SettingsNotice>(null)
  const soundFileInputRef = useRef<HTMLInputElement>(null)

  const refreshCustomSounds = useCallback(async () => {
    setCustomSounds(await listCustomSounds())
  }, [])

  useEffect(() => {
    void refreshCustomSounds()
  }, [refreshCustomSounds])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const visibleVoices = useMemo(() => {
    return allLanguages ? VOICE_PRESETS : VOICE_PRESETS.filter(v => v.language === language)
  }, [allLanguages, language])

  const selectedDetectionPreset = useMemo(() => {
    return (Object.keys(DETECTION_PRESETS) as Array<keyof typeof DETECTION_PRESETS>).find((presetName) => {
      const preset = DETECTION_PRESETS[presetName]
      return (
        Math.abs(config.sensitivity - preset.sensitivity) < 0.01 &&
        Math.abs(config.triggerTime - preset.triggerTime) < 0.01 &&
        Math.abs(config.cooldownTime - preset.cooldownTime) < 0.01
      )
    }) ?? null
  }, [config.cooldownTime, config.sensitivity, config.triggerTime])

  const handleSoundUploadClick = () => soundFileInputRef.current?.click()

  const handleSoundUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const entry = await addCustomSound(file)
    if (entry) {
      await refreshCustomSounds()
      onAlertSoundChange({ alertSoundId: entry.id })
      setSettingsNotice({ kind: 'success', message: `${entry.originalName} added` })
    } else {
      setSettingsNotice({ kind: 'error', message: t.settingsImportError })
    }
  }

  const handleSoundDelete = async (id: string) => {
    await deleteCustomSound(id)
    await refreshCustomSounds()
    if (alertSoundId === id) onAlertSoundChange({ alertSoundId: 'tone-chime' })
    setSettingsNotice({ kind: 'info', message: t.settingsSoundDelete })
  }

  // Debounced slider state — local values update instantly, callbacks fire after 150ms
  const [localSensitivity, setLocalSensitivity] = useState(config.sensitivity)
  const [localTriggerTime, setLocalTriggerTime] = useState(config.triggerTime)
  const [localCooldownTime, setLocalCooldownTime] = useState(config.cooldownTime)
  const [localDailyGoal, setLocalDailyGoal] = useState(habitSettings?.dailyTouchGoal ?? 10)
  const [localMedThreshold, setLocalMedThreshold] = useState(habitSettings?.touchThresholdForMeditation ?? 5)
  const configTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const habitTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Sync local state when props change externally
  useEffect(() => { setLocalSensitivity(config.sensitivity) }, [config.sensitivity])
  useEffect(() => { setLocalTriggerTime(config.triggerTime) }, [config.triggerTime])
  useEffect(() => { setLocalCooldownTime(config.cooldownTime) }, [config.cooldownTime])
  useEffect(() => { setLocalDailyGoal(habitSettings?.dailyTouchGoal ?? 10) }, [habitSettings?.dailyTouchGoal])
  useEffect(() => { setLocalMedThreshold(habitSettings?.touchThresholdForMeditation ?? 5) }, [habitSettings?.touchThresholdForMeditation])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (configTimerRef.current) clearTimeout(configTimerRef.current)
      if (habitTimerRef.current) clearTimeout(habitTimerRef.current)
    }
  }, [])

  const debouncedConfigChange = useCallback((changes: Partial<DetectionConfig>) => {
    if (configTimerRef.current) clearTimeout(configTimerRef.current)
    configTimerRef.current = setTimeout(() => onConfigChange(changes), 150)
  }, [onConfigChange])

  const applyDetectionPreset = useCallback((presetName: keyof typeof DETECTION_PRESETS) => {
    const preset = DETECTION_PRESETS[presetName]
    setLocalSensitivity(preset.sensitivity)
    setLocalTriggerTime(preset.triggerTime)
    setLocalCooldownTime(preset.cooldownTime)
    setIsDetectionAdvancedOpen(false)
    onConfigChange(preset)
  }, [onConfigChange])

  const handleSettingsTabKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return

    event.preventDefault()
    const currentIndex = SETTINGS_TAB_ORDER.indexOf(activeTab)
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? SETTINGS_TAB_ORDER.length - 1
          : event.key === 'ArrowLeft'
            ? (currentIndex - 1 + SETTINGS_TAB_ORDER.length) % SETTINGS_TAB_ORDER.length
            : (currentIndex + 1) % SETTINGS_TAB_ORDER.length
    const nextTab = SETTINGS_TAB_ORDER[nextIndex]
    setActiveTab(nextTab)
    requestAnimationFrame(() => document.getElementById(`settings-tab-${nextTab}`)?.focus())
  }, [activeTab])

  const debouncedHabitChange = useCallback((changes: Partial<HabitSettings>) => {
    if (habitTimerRef.current) clearTimeout(habitTimerRef.current)
    habitTimerRef.current = setTimeout(() => onHabitSettingsChange?.(changes), 150)
  }, [onHabitSettingsChange])

  // App settings state (stored in localStorage and synced with electron)
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)
      if (stored) {
        const parsed = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) }
        return {
          ...parsed,
          cameraQuality: coerceCameraQuality(parsed.cameraQuality),
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_APP_SETTINGS
  })

  // Sync app settings with Electron main process
  useEffect(() => {
    // Get initial settings from Electron
    window.ipcRenderer?.invoke(IPC_CHANNELS.GET_APP_SETTINGS).then((settings: AppSettings | null) => {
      if (settings) {
        setAppSettings({
          ...settings,
          cameraQuality: coerceCameraQuality(settings.cameraQuality),
        })
      }
    }).catch(() => {
      // Not in Electron environment
    })
  }, [])

  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    const merged = { ...appSettings, ...newSettings }
    const updated = {
      ...merged,
      cameraQuality: coerceCameraQuality(merged.cameraQuality),
    }
    setAppSettings(updated)
    try {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updated))
    } catch {
      // Ignore
    }
    // Notify Electron main process
    safeInvoke(IPC_CHANNELS.SET_APP_SETTINGS, updated)
  }

  const handleExport = () => {
    if (!onExportData) return
    const data = onExportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dont-touch-data-${data.exportedAt.split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setSettingsNotice({ kind: 'success', message: t.settingsExportSuccess })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImportData) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const result = event.target?.result
        if (typeof result !== 'string') {
          setSettingsNotice({ kind: 'error', message: t.settingsImportError })
          return
        }
        const data = JSON.parse(result)
        const success = onImportData(data)
        if (success) {
          setSettingsNotice({ kind: 'success', message: t.settingsImportSuccess })
        } else {
          setSettingsNotice({ kind: 'error', message: t.settingsImportError })
        }
      } catch {
        setSettingsNotice({ kind: 'error', message: t.settingsImportError })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="settings-container">
      <button
        className="settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={t.settingsButton}
        aria-label={t.settingsButton}
        aria-expanded={isOpen}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      </button>

      {isOpen && (
        <div className="settings-backdrop" onMouseDown={() => setIsOpen(false)}>
        <div
          className="settings-panel"
          ref={settingsPanelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="settings-header">
            <h3 id="settings-title">{t.settingsTitle}</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)} aria-label="Close settings">×</button>
          </div>

          <div className="settings-tabs" role="tablist" aria-label="Settings sections" onKeyDown={handleSettingsTabKeyDown}>
            <button
              id="settings-tab-setup"
              role="tab"
              aria-selected={activeTab === 'setup'}
              aria-controls="settings-panel-setup"
              tabIndex={activeTab === 'setup' ? 0 : -1}
              className={`tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
              onClick={() => setActiveTab('setup')}
            >
              Setup
            </button>
            <button
              id="settings-tab-detection"
              role="tab"
              aria-selected={activeTab === 'detection'}
              aria-controls="settings-panel-detection"
              tabIndex={activeTab === 'detection' ? 0 : -1}
              className={`tab-btn ${activeTab === 'detection' ? 'active' : ''}`}
              onClick={() => setActiveTab('detection')}
            >
              {t.settingsTabDetection || 'Detection'}
            </button>
            <button
              id="settings-tab-alerts"
              role="tab"
              aria-selected={activeTab === 'alerts'}
              aria-controls="settings-panel-alerts"
              tabIndex={activeTab === 'alerts' ? 0 : -1}
              className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              {t.settingsTabSound}
            </button>
            <button
              id="settings-tab-habit"
              role="tab"
              aria-selected={activeTab === 'habit'}
              aria-controls="settings-panel-habit"
              tabIndex={activeTab === 'habit' ? 0 : -1}
              className={`tab-btn ${activeTab === 'habit' ? 'active' : ''}`}
              onClick={() => setActiveTab('habit')}
            >
              {t.settingsTabHabit || 'Habit support'}
            </button>
            <button
              id="settings-tab-privacy"
              role="tab"
              aria-selected={activeTab === 'privacy'}
              aria-controls="settings-panel-privacy"
              tabIndex={activeTab === 'privacy' ? 0 : -1}
              className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              {t.settingsTabData || 'Privacy & data'}
            </button>
            <button
              id="settings-tab-app"
              role="tab"
              aria-selected={activeTab === 'app'}
              aria-controls="settings-panel-app"
              tabIndex={activeTab === 'app' ? 0 : -1}
              className={`tab-btn ${activeTab === 'app' ? 'active' : ''}`}
              onClick={() => setActiveTab('app')}
            >
              {t.settingsTabApp || 'App'}
            </button>
          </div>

          <div className="settings-content">
            {settingsNotice && (
              <div className={`settings-notice ${settingsNotice.kind}`} role="status" aria-live="polite">
                <span className="settings-notice-dot" aria-hidden="true" />
                <span>{settingsNotice.message}</span>
                <button
                  type="button"
                  className="settings-notice-close"
                  onClick={() => setSettingsNotice(null)}
                  aria-label="Dismiss message"
                >
                  ×
                </button>
              </div>
            )}

            {activeTab === 'setup' && (
              <div
                id="settings-panel-setup"
                role="tabpanel"
                aria-labelledby="settings-tab-setup"
              >
                <div className="settings-section">
                  <h4>{t.settingsLanguage}</h4>
                  <div className="language-grid">
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        className={`language-btn ${language === lang ? 'active' : ''}`}
                        aria-pressed={language === lang}
                        onClick={() => setLanguage(lang)}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <h4>{t.settingsCamera || 'Camera'}</h4>
                  <p className="slider-hint">{t.settingsCameraHint || 'Select camera device to use'}</p>
                  <select
                    className="camera-select"
                    aria-label={t.settingsCamera || 'Camera'}
                    value={selectedCameraId || ''}
                    onChange={(e) => onCameraChange?.(e.target.value || null)}
                  >
                    <option value="">{t.settingsCameraDefault || 'Default Camera'}</option>
                    {cameraDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </option>
                    ))}
                  </select>
                  <div className="camera-actual">
                    <span>Actual stream</span>
                    <strong>{formatCameraStreamInfo(cameraStreamInfo)}</strong>
                  </div>
                </div>

                <div className="settings-section">
                  <h4>Camera quality</h4>
                  <p className="slider-hint">Higher quality can improve landmark accuracy. It applies the next time monitoring starts.</p>
                  <div className="camera-quality-grid" role="group" aria-label="Camera quality">
                    {(Object.keys(CAMERA_QUALITY_PROFILES) as CameraQuality[]).map((quality) => {
                      const profile = CAMERA_QUALITY_PROFILES[quality]
                      return (
                        <button
                          key={quality}
                          type="button"
                          className={`camera-quality-btn ${cameraQuality === quality ? 'selected' : ''}`}
                          aria-pressed={cameraQuality === quality}
                          onClick={() => onCameraQualityChange(quality)}
                        >
                          <span>{profile.label}</span>
                          <small>{profile.width}x{profile.height} · {profile.description}</small>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="settings-section">
                  <label className="toggle-label">
                    <div>
                      <span>{t.settingsHidePreview || 'Hide camera preview'}</span>
                      <p className="toggle-hint">{t.settingsHidePreviewHint || 'Save resources by hiding the video feed'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={hidePreview}
                      onChange={(e) => onHidePreviewChange?.(e.target.checked)}
                      className="toggle-input"
                    />
                    <span className="toggle-switch" />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'detection' && (
              <div
                id="settings-panel-detection"
                role="tabpanel"
                aria-labelledby="settings-tab-detection"
              >
                <div className="settings-section">
                  <h4>Detection preset</h4>
                  <div className="preset-grid" role="group" aria-label="Detection presets">
                    <button
                      type="button"
                      className={`preset-btn ${selectedDetectionPreset === 'gentle' ? 'selected' : ''}`}
                      aria-pressed={selectedDetectionPreset === 'gentle'}
                      onClick={() => applyDetectionPreset('gentle')}
                    >
                      <span>Gentle</span>
                      <small>Slower reminders, lower sensitivity</small>
                    </button>
                    <button
                      type="button"
                      className={`preset-btn ${selectedDetectionPreset === 'balanced' ? 'selected' : ''}`}
                      aria-pressed={selectedDetectionPreset === 'balanced'}
                      onClick={() => applyDetectionPreset('balanced')}
                    >
                      <span>Balanced</span>
                      <small>Default timing for everyday use</small>
                    </button>
                    <button
                      type="button"
                      className={`preset-btn ${selectedDetectionPreset === 'strict' ? 'selected' : ''}`}
                      aria-pressed={selectedDetectionPreset === 'strict'}
                      onClick={() => applyDetectionPreset('strict')}
                    >
                      <span>Strict</span>
                      <small>Faster reminders, higher sensitivity</small>
                    </button>
                  </div>
                  <p className="slider-hint">Choose a baseline. Fine tuning stays available under advanced controls.</p>
                </div>

                <details
                  className="advanced-settings"
                  open={isDetectionAdvancedOpen}
                  onToggle={(event) => setIsDetectionAdvancedOpen(event.currentTarget.open)}
                >
                  <summary>Advanced detection</summary>
                  <div className="advanced-settings-body">
                {/* Sensitivity */}
                <div className="settings-section">
                  <h4>{t.settingsSensitivity}</h4>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={localSensitivity}
                      aria-label={t.settingsSensitivity}
                      onChange={(e) => {
                        const v = clampFloat(e.target.value, 0, 1, localSensitivity)
                        setLocalSensitivity(v)
                        debouncedConfigChange({ sensitivity: v })
                      }}
                      className="slider"
                    />
                    <span className="slider-value">{(localSensitivity * 100).toFixed(0)}%</span>
                  </div>
                  <p className="slider-hint">{t.settingsSensitivityHint}</p>
                </div>

                {/* Trigger Time */}
                <div className="settings-section">
                  <h4>{t.settingsTriggerTime}</h4>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={localTriggerTime}
                      aria-label={t.settingsTriggerTime}
                      onChange={(e) => {
                        const v = clampFloat(e.target.value, 0.5, 3, localTriggerTime)
                        setLocalTriggerTime(v)
                        debouncedConfigChange({ triggerTime: v })
                      }}
                      className="slider"
                    />
                    <span className="slider-value">{localTriggerTime.toFixed(1)}s</span>
                  </div>
                  <p className="slider-hint">{t.settingsTriggerTimeHint}</p>
                </div>

                {/* Cooldown Time */}
                <div className="settings-section">
                  <h4>{t.settingsCooldownTime}</h4>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={localCooldownTime}
                      aria-label={t.settingsCooldownTime}
                      onChange={(e) => {
                        const v = clampFloat(e.target.value, 1, 10, localCooldownTime)
                        setLocalCooldownTime(v)
                        debouncedConfigChange({ cooldownTime: v })
                      }}
                      className="slider"
                    />
                    <span className="slider-value">{localCooldownTime.toFixed(1)}s</span>
                  </div>
                  <p className="slider-hint">{t.settingsCooldownTimeHint}</p>
                </div>

                {/* Detection Zones */}
                <div className="settings-section">
                  <h4>{t.settingsDetectionZones}</h4>
                  <p className="section-desc">{t.settingsZonesDesc}</p>

                  {/* Full Face Option */}
                  <div className="zone-group">
                    <label className="zone-checkbox">
                      <input
                        type="checkbox"
                        checked={config.enabledZones.includes('fullFace')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onConfigChange({ enabledZones: ['fullFace'] })
                          } else {
                            onConfigChange({ enabledZones: [] })
                          }
                        }}
                      />
                      <span className="zone-name">{t.zoneFullFace}</span>
                      <span className="zone-desc">{t.zoneFullFaceDesc}</span>
                    </label>
                  </div>

                  {/* Hair Areas */}
                  <div className="zone-category">
                    <h5>{t.settingsHairAreas}</h5>
                    <div className="zone-group">
                      {HAIR_ZONES.map((zone) => (
                        <label key={zone} className="zone-checkbox">
                          <input
                            type="checkbox"
                            checked={config.enabledZones.includes(zone)}
                            onChange={(e) => {
                              const newZones = e.target.checked
                                ? [...config.enabledZones.filter(z => z !== 'fullFace'), zone]
                                : config.enabledZones.filter(z => z !== zone)
                              onConfigChange({ enabledZones: newZones.length > 0 ? newZones : ['fullFace'] })
                            }}
                          />
                          <span className="zone-name">{t[`zone${zone.charAt(0).toUpperCase() + zone.slice(1)}` as keyof typeof t]}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Face Areas */}
                  <div className="zone-category">
                    <h5>{t.settingsFaceAreas}</h5>
                    <div className="zone-group">
                      {FACE_ZONES.map((zone) => (
                        <label key={zone} className="zone-checkbox">
                          <input
                            type="checkbox"
                            checked={config.enabledZones.includes(zone)}
                            onChange={(e) => {
                              const newZones = e.target.checked
                                ? [...config.enabledZones.filter(z => z !== 'fullFace'), zone]
                                : config.enabledZones.filter(z => z !== zone)
                              onConfigChange({ enabledZones: newZones.length > 0 ? newZones : ['fullFace'] })
                            }}
                          />
                          <span className="zone-name">{t[`zone${zone.charAt(0).toUpperCase() + zone.slice(1)}` as keyof typeof t]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                  </div>
                </details>
              </div>
            )}

            {activeTab === 'habit' && habitSettings && onHabitSettingsChange && (
              <div
                id="settings-panel-habit"
                role="tabpanel"
                aria-labelledby="settings-tab-habit"
              >
                {/* Daily Touch Goal */}
                <div className="settings-section">
                  <h4>{t.settingsDailyGoal || 'Daily Touch Goal'}</h4>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="3"
                      max="30"
                      step="1"
                      value={localDailyGoal}
                      aria-label={t.settingsDailyGoal || 'Daily goal'}
                      onChange={(e) => {
                        const v = clampInt(e.target.value, 3, 30, localDailyGoal)
                        setLocalDailyGoal(v)
                        debouncedHabitChange({ dailyTouchGoal: v })
                      }}
                      className="slider"
                    />
                    <span className="slider-value">{localDailyGoal}</span>
                  </div>
                  <p className="slider-hint">{t.settingsDailyGoalHint || 'Stay under this to maintain your streak'}</p>
                </div>

                {/* Meditation Threshold */}
                <div className="settings-section">
                  <h4>{t.settingsMeditationThreshold || 'Meditation Reminder'}</h4>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="1"
                      value={localMedThreshold}
                      aria-label={t.settingsMeditationThreshold || 'Meditation threshold'}
                      onChange={(e) => {
                        const v = clampInt(e.target.value, 3, 15, localMedThreshold)
                        setLocalMedThreshold(v)
                        debouncedHabitChange({ touchThresholdForMeditation: v })
                      }}
                      className="slider"
                    />
                    <span className="slider-value">{localMedThreshold}</span>
                  </div>
                  <p className="slider-hint">{t.settingsMeditationThresholdHint || 'Suggest meditation after N touches'}</p>
                </div>

                {/* Enable Meditation Reminder */}
                <div className="settings-section">
                  <label className="toggle-label">
                    <span>{t.settingsEnableMeditationReminder || 'Enable meditation reminders'}</span>
                    <input
                      type="checkbox"
                      checked={habitSettings.enableMeditationReminder}
                      onChange={(e) => onHabitSettingsChange({ enableMeditationReminder: e.target.checked })}
                      className="toggle-input"
                    />
                    <span className="toggle-switch" />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'alerts' && (
              <div
                id="settings-panel-alerts"
                role="tabpanel"
                aria-labelledby="settings-tab-alerts"
              >
                <div className="settings-section">
                  <h4>{t.alertTimeoutSettingsTitle}</h4>
                  <p className="section-desc">{t.alertTimeoutSettingsDesc}</p>
                  <div className="timeout-duration-grid" role="group" aria-label={t.alertTimeoutDefaultDuration}>
                    {ALERT_TIMEOUT_MINUTES.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        className={`timeout-duration-btn ${alertTimeoutDefaultMinutes === minutes ? 'selected' : ''}`}
                        aria-pressed={alertTimeoutDefaultMinutes === minutes}
                        onClick={() => onAlertTimeoutDefaultChange(minutes)}
                      >
                        {minutes}{t.alertTimeoutMinutesSuffix}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="settings-section">
                  <h4>{t.settingsAlertSound}</h4>
                  <p className="section-desc">{t.settingsAlertSoundDesc}</p>

                  <div className="zone-category">
                    <h5>{t.settingsSoundCategoryTones}</h5>
                    <div className="sound-list">
                      {TONE_PRESETS.map(preset => (
                        <label key={preset.id} className={`sound-row ${alertSoundId === preset.id ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="alert-sound"
                            checked={alertSoundId === preset.id}
                            onChange={() => onAlertSoundChange({ alertSoundId: preset.id })}
                          />
                          <span className="sound-label">{t[preset.labelKey as keyof typeof t] as string}</span>
                          <button
                            type="button"
                            className="sound-preview-btn"
                            aria-label={`${t.settingsSoundPreview}: ${t[preset.labelKey as keyof typeof t] as string}`}
                            title={t.settingsSoundPreview}
                            onClick={(e) => { e.preventDefault(); onPreviewSound(preset.id) }}
                          >
                            ▶ {t.settingsSoundPreview}
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="zone-category">
                    <div className="sound-voice-header">
                      <h5>{t.settingsSoundCategoryVoices}</h5>
                      <label className="all-languages-toggle">
                        <input
                          type="checkbox"
                          checked={allLanguages}
                          onChange={(e) => setAllLanguages(e.target.checked)}
                        />
                        <span>{t.settingsSoundAllLanguages}</span>
                      </label>
                    </div>
                    <div className="sound-list">
                      {visibleVoices.map(preset => (
                        <label key={preset.id} className={`sound-row ${alertSoundId === preset.id ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="alert-sound"
                            checked={alertSoundId === preset.id}
                            onChange={() => onAlertSoundChange({ alertSoundId: preset.id })}
                          />
                          <span className="sound-label">{t[preset.labelKey as keyof typeof t] as string}</span>
                          <button
                            type="button"
                            className="sound-preview-btn"
                            aria-label={`${t.settingsSoundPreview}: ${t[preset.labelKey as keyof typeof t] as string}`}
                            title={t.settingsSoundPreview}
                            onClick={(e) => { e.preventDefault(); onPreviewSound(preset.id) }}
                          >
                            ▶ {t.settingsSoundPreview}
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="zone-category">
                    <h5>{t.settingsSoundCategoryCustom}</h5>
                    <div className="sound-list">
                      {customSounds.map(entry => (
                        <label key={entry.id} className={`sound-row ${alertSoundId === entry.id ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="alert-sound"
                            checked={alertSoundId === entry.id}
                            onChange={() => onAlertSoundChange({ alertSoundId: entry.id })}
                          />
                          <span className="sound-label">{entry.originalName}</span>
                          <button
                            type="button"
                            className="sound-preview-btn"
                            aria-label={`${t.settingsSoundPreview}: ${entry.originalName}`}
                            title={t.settingsSoundPreview}
                            onClick={(e) => { e.preventDefault(); onPreviewSound(entry.id) }}
                          >
                            ▶ {t.settingsSoundPreview}
                          </button>
                          <button
                            type="button"
                            className="sound-delete-btn"
                            onClick={(e) => { e.preventDefault(); void handleSoundDelete(entry.id) }}
                            title={t.settingsSoundDelete}
                            aria-label={`${t.settingsSoundDelete}: ${entry.originalName}`}
                          >
                            ✕
                          </button>
                        </label>
                      ))}
                    </div>
                    <button type="button" className="sound-upload-btn" onClick={handleSoundUploadClick}>
                      + {t.settingsSoundUpload}
                    </button>
                    <p className="slider-hint">{t.settingsSoundUploadHint}</p>
                    <input
                      ref={soundFileInputRef}
                      type="file"
                      accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
                      onChange={handleSoundUploadFile}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className="settings-section">
                  <h4>{t.settingsSoundVolume}</h4>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={alertVolume}
                      aria-label={t.settingsSoundVolume}
                      onChange={(e) => onAlertSoundChange({ alertVolume: clampFloat(e.target.value, 0, 1, alertVolume) })}
                      className="slider"
                    />
                    <span className="slider-value">{Math.round(alertVolume * 100)}%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'app' && (
              <div
                id="settings-panel-app"
                role="tabpanel"
                aria-labelledby="settings-tab-app"
              >
                {/* Auto Start */}
                <div className="settings-section">
                  <label className="toggle-label">
                    <div>
                      <span>{t.settingsAutoStart || 'Start with Windows'}</span>
                      <p className="toggle-hint">{t.settingsAutoStartHint || 'Launch app when Windows starts'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appSettings.autoStart}
                      onChange={(e) => updateAppSettings({ autoStart: e.target.checked })}
                      className="toggle-input"
                    />
                    <span className="toggle-switch" />
                  </label>
                </div>

                {/* Minimize to Tray */}
                <div className="settings-section">
                  <label className="toggle-label">
                    <div>
                      <span>{t.settingsMinimizeToTray || 'Minimize to tray on close'}</span>
                      <p className="toggle-hint">{t.settingsMinimizeToTrayHint || 'Keep running in system tray when closed'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appSettings.minimizeToTray}
                      onChange={(e) => updateAppSettings({ minimizeToTray: e.target.checked })}
                      className="toggle-input"
                    />
                    <span className="toggle-switch" />
                  </label>
                </div>

                {/* Start Minimized */}
                <div className="settings-section">
                  <label className="toggle-label">
                    <div>
                      <span>{t.settingsStartMinimized || 'Start minimized'}</span>
                      <p className="toggle-hint">{t.settingsStartMinimizedHint || 'Start in system tray'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appSettings.startMinimized}
                      onChange={(e) => updateAppSettings({ startMinimized: e.target.checked })}
                      className="toggle-input"
                    />
                    <span className="toggle-switch" />
                  </label>
                </div>

                {/* Close Action Reset */}
                {closeAction !== 'ask' && (
                  <div className="settings-section">
                    <h4>{t.settingsCloseAction || 'Close action'}</h4>
                    <p className="slider-hint">{t.settingsCloseActionHint || 'Reset to ask before closing'}</p>
                    <button
                      className="reset-close-action-btn"
                      onClick={() => onCloseActionChange?.('ask')}
                    >
                      {t.settingsCloseActionAsk || 'Ask every time'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div
                id="settings-panel-privacy"
                role="tabpanel"
                aria-labelledby="settings-tab-privacy"
              >
                <div className="settings-section">
                  <h4>{t.settingsExportImport || 'Export / Import'}</h4>
                  <p className="section-desc">{t.settingsExportImportDesc || 'Backup or restore your statistics data'}</p>
                  <div className="data-buttons">
                    <button className="data-btn export" onClick={handleExport}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {t.settingsExport || 'Export'}
                    </button>
                    <button className="data-btn import" onClick={handleImportClick}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      {t.settingsImport || 'Import'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      )}

      <style>{`
        .settings-container {
          position: relative;
          z-index: var(--z-floating);
        }

        .settings-backdrop {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 56px 16px 16px;
          background: rgba(5, 7, 12, 0.62);
          z-index: var(--z-modal-backdrop);
          animation: settingsBackdropIn var(--motion-standard) var(--motion-ease);
        }

        .settings-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #94a3b8;
          cursor: pointer;
          transition:
            background-color var(--motion-fast) var(--motion-ease),
            color var(--motion-fast) var(--motion-ease);
        }

        .settings-toggle:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .settings-panel {
          width: min(760px, calc(100vw - 32px));
          max-height: calc(100vh - 80px);
          max-height: calc(100dvh - 80px);
          overflow-y: auto;
          background: #1b1c25;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          box-shadow: 0 8px 8px rgba(0, 0, 0, 0.35);
          z-index: var(--z-modal);
          animation: settingsPanelIn var(--motion-standard) var(--motion-ease);
        }

        .settings-header {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: #1b1c25;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .settings-header h3 {
          margin: 0;
          font-size: 14px;
          color: #fff;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          transition: color var(--motion-fast) var(--motion-ease);
        }

        .close-btn:hover {
          color: #fca5a5;
        }

        .settings-tabs {
          position: sticky;
          top: 49px;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          background: #1b1c25;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-btn {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 12px;
          cursor: pointer;
          transition:
            background-color var(--motion-fast) var(--motion-ease),
            border-color var(--motion-fast) var(--motion-ease),
            color var(--motion-fast) var(--motion-ease);
        }

        .tab-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
          color: #7dd3fc;
          border-bottom: 2px solid #7dd3fc;
          background: rgba(125, 211, 252, 0.08);
        }

        .settings-content {
          padding: 18px 22px 22px;
        }

        .settings-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          margin-bottom: 16px;
          border-radius: 8px;
          border: 1px solid rgba(125, 211, 252, 0.22);
          background: rgba(125, 211, 252, 0.08);
          color: #dbeafe;
          font-size: 12px;
          animation: settingsNoticeIn var(--motion-standard) var(--motion-ease);
        }

        .settings-notice.success {
          border-color: rgba(52, 211, 153, 0.24);
          background: rgba(52, 211, 153, 0.1);
          color: #dcfce7;
        }

        .settings-notice.error {
          border-color: rgba(248, 113, 113, 0.28);
          background: rgba(248, 113, 113, 0.12);
          color: #fee2e2;
        }

        .settings-notice-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #7dd3fc;
          flex: 0 0 auto;
        }

        .settings-notice.success .settings-notice-dot {
          background: #34d399;
        }

        .settings-notice.error .settings-notice-dot {
          background: #f87171;
        }

        .settings-notice-close {
          margin-left: auto;
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .settings-notice-close:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .settings-section {
          margin-bottom: 24px;
        }

        .settings-section:last-child {
          margin-bottom: 0;
        }

        .settings-section h4 {
          margin: 0 0 8px 0;
          font-size: 13px;
          color: #fff;
          letter-spacing: 0;
        }

        .section-desc {
          margin: 0 0 12px 0;
          font-size: 11px;
          color: #94a3b8;
        }

        .language-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .language-btn {
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #aaa;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .language-btn:hover {
          background: rgba(125, 211, 252, 0.1);
          border-color: rgba(125, 211, 252, 0.3);
          color: #7dd3fc;
        }

        .language-btn.active {
          background: rgba(125, 211, 252, 0.14);
          border-color: #7dd3fc;
          color: #bfdbfe;
        }

        .preset-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .timeout-duration-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 8px;
        }

        .timeout-duration-btn {
          min-height: 36px;
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition:
            background-color var(--motion-fast) var(--motion-ease),
            border-color var(--motion-fast) var(--motion-ease),
            color var(--motion-fast) var(--motion-ease),
            transform var(--motion-fast) var(--motion-ease);
        }

        .timeout-duration-btn:hover {
          background: rgba(125, 211, 252, 0.08);
          border-color: rgba(125, 211, 252, 0.28);
          color: #e0f2fe;
        }

        .timeout-duration-btn.selected {
          background: rgba(125, 211, 252, 0.14);
          border-color: #7dd3fc;
          color: #f8fafc;
        }

        .timeout-duration-btn:active {
          transform: translateY(1px);
        }

        .preset-btn {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-height: 76px;
          padding: 12px;
          text-align: left;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #e5e7eb;
          cursor: pointer;
        }

        .preset-btn:hover {
          background: rgba(125, 211, 252, 0.08);
          border-color: rgba(125, 211, 252, 0.32);
        }

        .preset-btn.selected {
          background: rgba(125, 211, 252, 0.14);
          border-color: #7dd3fc;
          color: #f8fafc;
        }

        .preset-btn span {
          font-size: 13px;
          font-weight: 700;
        }

        .preset-btn small {
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.35;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .slider {
          flex: 1;
          -webkit-appearance: none;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #7dd3fc;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 0 4px rgba(125, 211, 252, 0.14);
        }

        .slider-value {
          min-width: 50px;
          text-align: right;
          font-size: 14px;
          color: #7dd3fc;
        }

        .slider-hint {
          margin: 6px 0 0 0;
          font-size: 11px;
          color: #94a3b8;
        }

        .advanced-settings {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0;
        }

        .advanced-settings summary {
          cursor: pointer;
          padding: 12px 14px;
          color: #e5e7eb;
          font-size: 13px;
          font-weight: 600;
        }

        .advanced-settings-body {
          padding: 4px 14px 16px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          position: relative;
        }

        .toggle-label span:first-child {
          font-size: 13px;
          color: #aaa;
        }

        .toggle-input {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          opacity: 0;
          overflow: hidden;
        }

        .toggle-switch {
          width: 44px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          position: relative;
          transition: background 0.2s;
        }

        .toggle-switch::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #94a3b8;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .toggle-input:checked + .toggle-switch {
          background: rgba(125, 211, 252, 0.3);
        }

        .toggle-input:checked + .toggle-switch::after {
          left: 22px;
          background: #7dd3fc;
        }

        .toggle-input:focus-visible + .toggle-switch {
          box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.25);
        }

        .data-buttons {
          display: flex;
          gap: 10px;
        }

        .data-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .data-btn.export {
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.3);
          color: #86efac;
        }

        .data-btn.export:hover {
          background: rgba(52, 211, 153, 0.16);
          border-color: #34d399;
        }

        .data-btn.import {
          background: rgba(125, 211, 252, 0.1);
          border: 1px solid rgba(125, 211, 252, 0.3);
          color: #7dd3fc;
        }

        .data-btn.import:hover {
          background: rgba(125, 211, 252, 0.16);
          border-color: #7dd3fc;
        }

        .zone-category {
          margin-top: 12px;
        }

        .zone-category h5 {
          margin: 0 0 8px 0;
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .zone-group {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .zone-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          position: relative;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 11px;
        }

        .zone-checkbox:hover:not(:has(input:disabled)) {
          background: rgba(125, 211, 252, 0.08);
          border-color: rgba(125, 211, 252, 0.28);
        }

        .zone-checkbox:has(input:checked) {
          background: rgba(125, 211, 252, 0.12);
          border-color: rgba(125, 211, 252, 0.45);
        }

        .zone-checkbox:has(input:focus-visible) {
          box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.2);
        }

        .zone-checkbox:has(input:disabled) {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .zone-checkbox input {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          opacity: 0;
          overflow: hidden;
        }

        .zone-checkbox .zone-name {
          color: #ccc;
        }

        .zone-checkbox:has(input:checked) .zone-name {
          color: #bfdbfe;
        }

        .zone-checkbox .zone-desc {
          color: #94a3b8;
          font-size: 10px;
          margin-left: 4px;
        }

        .camera-select {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
          margin-top: 8px;
        }

        .camera-select:hover {
          border-color: rgba(125, 211, 252, 0.4);
        }

        .camera-select:focus {
          border-color: #7dd3fc;
          box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.18);
        }

        .camera-select option {
          background: #1a1a2e;
          color: #fff;
          padding: 8px;
        }

        .camera-actual {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(125, 211, 252, 0.08);
          border: 1px solid rgba(125, 211, 252, 0.16);
          color: #94a3b8;
          font-size: 12px;
        }

        .camera-actual strong {
          color: #dbeafe;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .camera-quality-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .camera-quality-btn {
          display: flex;
          min-height: 86px;
          flex-direction: column;
          justify-content: space-between;
          gap: 8px;
          padding: 11px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(15, 23, 42, 0.52);
          color: #e2e8f0;
          text-align: left;
          cursor: pointer;
          transition: background var(--motion-fast), border-color var(--motion-fast), transform var(--motion-fast);
        }

        .camera-quality-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(125, 211, 252, 0.38);
          background: rgba(125, 211, 252, 0.08);
        }

        .camera-quality-btn:focus-visible {
          outline: 2px solid #7dd3fc;
          outline-offset: 2px;
        }

        .camera-quality-btn.selected {
          border-color: rgba(125, 211, 252, 0.65);
          background: rgba(125, 211, 252, 0.14);
        }

        .camera-quality-btn span {
          font-size: 13px;
          font-weight: 650;
        }

        .camera-quality-btn small {
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.35;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          gap: 12px;
        }

        .toggle-label > div {
          flex: 1;
        }

        .toggle-label > div > span {
          font-size: 13px;
          color: #ccc;
          display: block;
        }

        .toggle-hint {
          font-size: 10px;
          color: #94a3b8;
          margin: 4px 0 0 0;
        }

        .reset-close-action-btn {
          width: 100%;
          padding: 10px 16px;
          margin-top: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #aaa;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-close-action-btn:hover {
          background: rgba(125, 211, 252, 0.08);
          border-color: rgba(125, 211, 252, 0.35);
          color: #7dd3fc;
        }

        .sound-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sound-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .sound-row:hover {
          background: rgba(125, 211, 252, 0.06);
          border-color: rgba(125, 211, 252, 0.25);
        }

        .sound-row.selected {
          background: rgba(52, 211, 153, 0.12);
          border-color: rgba(52, 211, 153, 0.45);
        }

        .sound-row input[type="radio"] {
          margin: 0;
          accent-color: #34d399;
        }

        .sound-label {
          flex: 1;
          font-size: 12px;
          color: #ccc;
        }

        .sound-row.selected .sound-label {
          color: #86efac;
        }

        .sound-preview-btn {
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          background: rgba(125, 211, 252, 0.1);
          border: 1px solid rgba(125, 211, 252, 0.3);
          color: #7dd3fc;
          padding: 0;
          border-radius: 6px;
          font-size: 0;
          cursor: pointer;
        }

        .sound-preview-btn::before {
          content: '';
          width: 0;
          height: 0;
          margin-left: 2px;
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-left: 7px solid currentColor;
        }

        .sound-preview-btn:hover {
          background: rgba(125, 211, 252, 0.16);
        }

        .sound-delete-btn {
          position: relative;
          width: 32px;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.16);
          border-radius: 6px;
          color: #fca5a5;
          font-size: 0;
          cursor: pointer;
          padding: 0;
        }

        .sound-delete-btn::before,
        .sound-delete-btn::after {
          content: '';
          position: absolute;
          width: 12px;
          height: 2px;
          border-radius: 999px;
          background: currentColor;
        }

        .sound-delete-btn::before {
          transform: rotate(45deg);
        }

        .sound-delete-btn::after {
          transform: rotate(-45deg);
        }

        .sound-delete-btn:hover {
          background: rgba(248, 113, 113, 0.13);
          border-color: rgba(248, 113, 113, 0.26);
          color: #fecaca;
        }

        .sound-upload-btn {
          margin-top: 8px;
          width: 100%;
          padding: 10px;
          background: rgba(125, 211, 252, 0.1);
          border: 1px dashed rgba(125, 211, 252, 0.4);
          color: #7dd3fc;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .sound-upload-btn:hover {
          background: rgba(125, 211, 252, 0.16);
          border-color: rgba(125, 211, 252, 0.7);
        }

        .sound-voice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .all-languages-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #94a3b8;
          cursor: pointer;
        }

        .all-languages-toggle input {
          accent-color: #34d399;
        }

        @keyframes settingsBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes settingsPanelIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.985);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes settingsNoticeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 680px) {
          .settings-backdrop {
            align-items: stretch;
            padding: 8px;
          }

          .settings-panel {
            width: 100%;
            max-height: calc(100dvh - 16px);
          }

          .settings-tabs {
            top: 49px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .tab-btn {
            min-height: 42px;
          }

          .settings-content {
            padding: 14px;
          }

          .preset-grid {
            grid-template-columns: 1fr;
          }

          .timeout-duration-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .data-buttons {
            flex-direction: column;
          }

          .sound-row {
            align-items: flex-start;
            gap: 8px;
          }

          .sound-label {
            min-width: 0;
            overflow-wrap: anywhere;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .settings-backdrop,
          .settings-panel,
          .settings-notice {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
}
