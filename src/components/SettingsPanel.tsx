import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { Language, languageNames } from '../i18n/translations'
import { HabitSettings, ExportData } from '../types/statistics'
import { DetectionZone, HAIR_ZONES, FACE_ZONES } from '../detection/types'
import { AppSettings, DEFAULT_APP_SETTINGS } from '../types/app-settings'
import { STORAGE_KEYS } from '../constants/storage-keys'
import { IPC_CHANNELS } from '../constants/ipc-channels'
import { safeInvoke } from '../utils/ipc'
import { clampFloat, clampInt } from '../utils/validation'

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
  selectedCameraId?: string | null
  onCameraChange?: (deviceId: string | null) => void
  hidePreview?: boolean
  onHidePreviewChange?: (hide: boolean) => void
  closeAction?: 'ask' | 'quit' | 'tray'
  onCloseActionChange?: (action: 'ask' | 'quit' | 'tray') => void
}

export function SettingsPanel({
  config,
  onConfigChange,
  habitSettings,
  onHabitSettingsChange,
  onExportData,
  onImportData,
  cameraDevices = [],
  selectedCameraId,
  onCameraChange,
  hidePreview = false,
  onHidePreviewChange,
  closeAction = 'ask',
  onCloseActionChange,
}: SettingsPanelProps) {
  const { t, language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'detection' | 'habit' | 'data' | 'app'>('detection')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const debouncedHabitChange = useCallback((changes: Partial<HabitSettings>) => {
    if (habitTimerRef.current) clearTimeout(habitTimerRef.current)
    habitTimerRef.current = setTimeout(() => onHabitSettingsChange?.(changes), 150)
  }, [onHabitSettingsChange])

  // App settings state (stored in localStorage and synced with electron)
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)
      if (stored) {
        return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) }
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
        setAppSettings(settings)
      }
    }).catch(() => {
      // Not in Electron environment
    })
  }, [])

  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...appSettings, ...newSettings }
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
          alert(t.settingsImportError)
          return
        }
        const data = JSON.parse(result)
        const success = onImportData(data)
        if (success) {
          alert(t.settingsImportSuccess)
        } else {
          alert(t.settingsImportError)
        }
      } catch {
        alert(t.settingsImportError)
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
        <div className="settings-panel">
          <div className="settings-header">
            <h3>{t.settingsTitle}</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="settings-tabs">
            <button
              className={`tab-btn ${activeTab === 'detection' ? 'active' : ''}`}
              onClick={() => setActiveTab('detection')}
            >
              {t.settingsTabDetection || 'Detection'}
            </button>
            <button
              className={`tab-btn ${activeTab === 'habit' ? 'active' : ''}`}
              onClick={() => setActiveTab('habit')}
            >
              {t.settingsTabHabit || 'Habit'}
            </button>
            <button
              className={`tab-btn ${activeTab === 'app' ? 'active' : ''}`}
              onClick={() => setActiveTab('app')}
            >
              {t.settingsTabApp || 'App'}
            </button>
            <button
              className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              {t.settingsTabData || 'Data'}
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'detection' && (
              <>
                {/* Language Selection */}
                <div className="settings-section">
                  <h4>{t.settingsLanguage}</h4>
                  <div className="language-grid">
                    {(Object.keys(languageNames) as Language[]).map((lang) => (
                      <button
                        key={lang}
                        className={`language-btn ${language === lang ? 'active' : ''}`}
                        onClick={() => setLanguage(lang)}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </div>

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
              </>
            )}

            {activeTab === 'habit' && habitSettings && onHabitSettingsChange && (
              <>
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
              </>
            )}

            {activeTab === 'app' && (
              <>
                {/* Camera Selection */}
                <div className="settings-section">
                  <h4>{t.settingsCamera || 'Camera'}</h4>
                  <p className="slider-hint">{t.settingsCameraHint || 'Select camera device to use'}</p>
                  <select
                    className="camera-select"
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
                </div>

                {/* Hide Camera Preview */}
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
              </>
            )}

            {activeTab === 'data' && (
              <>
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
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .settings-container {
          position: relative;
          z-index: 1000;
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
          color: #888;
          cursor: pointer;
          transition: all 0.15s;
        }

        .settings-toggle:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .settings-panel {
          position: fixed;
          top: 56px;
          right: 12px;
          width: 340px;
          max-height: calc(100vh - 70px);
          overflow-y: auto;
          background: #1e1e2a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          z-index: 1001;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
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
          color: #888;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        }

        .close-btn:hover {
          color: #ff4444;
        }

        .settings-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-btn {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          color: #888;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-btn.active {
          color: #00ffff;
          border-bottom: 2px solid #00ffff;
        }

        .settings-content {
          padding: 16px 20px;
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
          letter-spacing: 0.5px;
        }

        .section-desc {
          margin: 0 0 12px 0;
          font-size: 11px;
          color: #666;
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
          background: rgba(0, 255, 136, 0.1);
          border-color: rgba(0, 255, 136, 0.3);
          color: #00ff88;
        }

        .language-btn.active {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
          color: #00ff88;
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
          background: #00ffff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .slider-value {
          min-width: 50px;
          text-align: right;
          font-size: 14px;
          font-family: monospace;
          color: #00ffff;
        }

        .slider-hint {
          margin: 6px 0 0 0;
          font-size: 10px;
          color: #666;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }

        .toggle-label span:first-child {
          font-size: 13px;
          color: #aaa;
        }

        .toggle-input {
          display: none;
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
          background: #666;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .toggle-input:checked + .toggle-switch {
          background: rgba(0, 255, 136, 0.3);
        }

        .toggle-input:checked + .toggle-switch::after {
          left: 22px;
          background: #00ff88;
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
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          color: #00ff88;
        }

        .data-btn.export:hover {
          background: rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
        }

        .data-btn.import {
          background: rgba(0, 136, 255, 0.1);
          border: 1px solid rgba(0, 136, 255, 0.3);
          color: #0088ff;
        }

        .data-btn.import:hover {
          background: rgba(0, 136, 255, 0.2);
          border-color: #0088ff;
        }

        .zone-category {
          margin-top: 12px;
        }

        .zone-category h5 {
          margin: 0 0 8px 0;
          font-size: 11px;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 11px;
        }

        .zone-checkbox:hover:not(:has(input:disabled)) {
          background: rgba(0, 255, 255, 0.1);
          border-color: rgba(0, 255, 255, 0.3);
        }

        .zone-checkbox:has(input:checked) {
          background: rgba(0, 255, 136, 0.15);
          border-color: rgba(0, 255, 136, 0.5);
        }

        .zone-checkbox:has(input:disabled) {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .zone-checkbox input {
          display: none;
        }

        .zone-checkbox .zone-name {
          color: #ccc;
        }

        .zone-checkbox:has(input:checked) .zone-name {
          color: #00ff88;
        }

        .zone-checkbox .zone-desc {
          color: #666;
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
          border-color: rgba(0, 255, 255, 0.4);
        }

        .camera-select:focus {
          border-color: #00ffff;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
        }

        .camera-select option {
          background: #1a1a2e;
          color: #fff;
          padding: 8px;
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
          color: #666;
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
          background: rgba(0, 255, 255, 0.1);
          border-color: rgba(0, 255, 255, 0.4);
          color: #00ffff;
        }
      `}</style>
    </div>
  )
}
