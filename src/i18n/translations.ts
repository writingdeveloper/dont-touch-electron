export type Language = 'en' | 'ko' | 'ja' | 'zh' | 'es' | 'ru';

export interface Translations {
  // App
  appTitle: string;

  // Status
  statusSystem: string;
  statusReady: string;
  statusInit: string;
  statusDetection: string;
  statusActive: string;
  statusStandby: string;
  statusStatus: string;
  statusMonitoring: string;
  statusDetecting: string;
  statusAlert: string;
  statusCooldown: string;
  statusProximity: string;
  statusNear: string;
  statusSafe: string;

  // Progress
  progressAlertThreshold: string;
  progressCooldownTimer: string;
  progressAlertIn: string;
  progressResumeIn: string;

  // Controls
  controlStart: string;
  controlStop: string;
  controlLoading: string;

  // Video
  videoCameraOffline: string;
  videoInitialize: string;
  videoRec: string;

  // Alert
  alertWarning: string;
  alertTitle: string;
  alertSubtitle: string;
  alertStatus: string;
  alertViolation: string;
  alertAction: string;
  alertClearToDismiss: string;
  alertHandStillNear: string;
  alertDismissHint: string;
  alertMoveHandAway: string;
  alertZoneDetected: string;

  // Settings
  settingsButton: string;
  settingsTitle: string;
  settingsDetectionZones: string;
  settingsZonesDesc: string;
  settingsSensitivity: string;
  settingsSensitivityHint: string;
  settingsTriggerTime: string;
  settingsTriggerTimeHint: string;
  settingsCooldownTime: string;
  settingsCooldownTimeHint: string;
  settingsLanguage: string;
  settingsGeneral: string;
  settingsHairAreas: string;
  settingsFaceAreas: string;
  settingsActive: string;

  // Zones
  zoneScalp: string;
  zoneForehead: string;
  zoneEyebrows: string;
  zoneEyes: string;
  zoneNose: string;
  zoneCheeks: string;
  zoneMouth: string;
  zoneChin: string;
  zoneEars: string;
  zoneFullFace: string;

  // Zone descriptions
  zoneScalpDesc: string;
  zoneEyebrowsDesc: string;
  zoneForeheadDesc: string;
  zoneEyesDesc: string;
  zoneNoseDesc: string;
  zoneCheeksDesc: string;
  zoneMouthDesc: string;
  zoneChinDesc: string;
  zoneEarsDesc: string;
  zoneFullFaceDesc: string;

  // Camera errors
  cameraError: string;

  // Statistics
  statsTodayTouches: string;
  statsGoal: string;
  statsProgress: string;
  statsStreak: string;
  statsDays: string;
  statsLastTouch: string;
  statsNever: string;
  statsAgo: string;
  statsMinutes: string;
  statsHours: string;
  statsMeditation: string;

  // Meditation
  meditationButton: string;
  meditationRecommend: string;
  meditationRecommendDesc: string;
  meditationStart: string;
  meditationSkip: string;
  meditationLater: string;
  meditationInhale: string;
  meditationHold: string;
  meditationExhale: string;
  meditationCycle: string;
  meditationRemaining: string;
  meditationEnd: string;
  meditationPause: string;
  meditationResume: string;

  // Settings tabs and habit settings
  settingsTabDetection: string;
  settingsTabHabit: string;
  settingsTabData: string;
  settingsDailyGoal: string;
  settingsDailyGoalHint: string;
  settingsMeditationThreshold: string;
  settingsMeditationThresholdHint: string;
  settingsMeditationReminder: string;
  settingsEnableMeditationReminder: string;
  settingsExport: string;
  settingsImport: string;
  settingsExportImport: string;
  settingsExportImportDesc: string;
  settingsExportSuccess: string;
  settingsImportSuccess: string;
  settingsImportError: string;

  // Calendar
  calendarTitle: string;
  calendarToday: string;
  calendarNoData: string;
  calendarGood: string;
  calendarWarning: string;
  calendarBad: string;

  // App Settings
  settingsTabApp: string;
  settingsCamera: string;
  settingsCameraHint: string;
  settingsCameraDefault: string;
  settingsAutoStart: string;
  settingsAutoStartHint: string;
  settingsMinimizeToTray: string;
  settingsMinimizeToTrayHint: string;
  settingsStartMinimized: string;
  settingsStartMinimizedHint: string;

  // Button titles
  buttonAbout: string;
  buttonMinimize: string;
  buttonClose: string;

  // Camera Preview
  settingsHidePreview: string;
  settingsHidePreviewHint: string;

  // Close Modal
  closeModalTitle: string;
  closeModalQuit: string;
  closeModalTray: string;
  closeModalCancel: string;
  closeModalRemember: string;
  settingsCloseAction: string;
  settingsCloseActionAsk: string;
  settingsCloseActionHint: string;

  // Splash Screen
  splashCheckingUpdates: string;
  splashLoadingResources: string;
  splashInitializingDetection: string;
  splashPreparingInterface: string;
  splashAlmostReady: string;
  splashComplete: string;
  splashLoading: string;

  // About
  aboutDescription: string;
  aboutFeatures: string;
  aboutFeature1: string;
  aboutFeature2: string;
  aboutFeature3: string;
  aboutFeature4: string;
  aboutTech: string;
  aboutPrivacy: string;
  aboutPrivacyText: string;
  aboutLocalOnly: string;
  aboutNoData: string;
  aboutCompliance: string;
  aboutOpenSource: string;
  aboutOpenSourceText: string;

  // Update
  updateTitle: string;
  updateCheck: string;
  updateChecking: string;
  updateAvailable: string;
  updateNotAvailable: string;
  updateDownload: string;
  updateDownloading: string;
  updateInstall: string;
  updateLater: string;
  updateError: string;
  updateCurrent: string;
  updateNew: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: "Don't Touch",

    statusSystem: 'SYSTEM',
    statusReady: 'READY',
    statusInit: 'INIT',
    statusDetection: 'DETECTION',
    statusActive: 'ACTIVE',
    statusStandby: 'STANDBY',
    statusStatus: 'STATUS',
    statusMonitoring: 'MONITORING',
    statusDetecting: 'DETECTING',
    statusAlert: 'ALERT',
    statusCooldown: 'COOLDOWN',
    statusProximity: 'PROXIMITY',
    statusNear: 'NEAR',
    statusSafe: 'SAFE',

    progressAlertThreshold: 'ALERT THRESHOLD',
    progressCooldownTimer: 'COOLDOWN TIMER',
    progressAlertIn: 'Alert in',
    progressResumeIn: 'Resume in',

    controlStart: 'Start Detection',
    controlStop: 'Stop Detection',
    controlLoading: 'Initializing TensorFlow.js...',

    videoCameraOffline: 'CAMERA OFFLINE',
    videoInitialize: 'Initialize detection system to begin monitoring',
    videoRec: 'REC',

    alertWarning: 'WARNING',
    alertTitle: 'FACE TOUCH DETECTED',
    alertSubtitle: 'Remove your hand from your face immediately',
    alertStatus: 'STATUS',
    alertViolation: 'VIOLATION',
    alertAction: 'ACTION',
    alertClearToDismiss: 'CLEAR TO DISMISS',
    alertHandStillNear: 'HAND STILL NEAR',
    alertDismissHint: 'Click anywhere or press any key to dismiss',
    alertMoveHandAway: 'MOVE HAND AWAY FROM FACE FIRST',
    alertZoneDetected: 'ZONE',

    settingsButton: 'Settings',
    settingsTitle: 'Detection Settings',
    settingsDetectionZones: 'Detection Zones',
    settingsZonesDesc: 'Select areas to monitor for face touching',
    settingsSensitivity: 'Sensitivity',
    settingsSensitivityHint: 'Higher = triggers from further distance',
    settingsTriggerTime: 'Trigger Time',
    settingsTriggerTimeHint: 'Time before alert triggers',
    settingsCooldownTime: 'Cooldown Time',
    settingsCooldownTimeHint: 'Wait time after alert before re-detecting',
    settingsLanguage: 'Language',
    settingsGeneral: 'General',
    settingsHairAreas: 'Hair Areas',
    settingsFaceAreas: 'Face Areas',
    settingsActive: 'Active',

    zoneScalp: 'Scalp',
    zoneForehead: 'Forehead',
    zoneEyebrows: 'Eyebrows',
    zoneEyes: 'Eyes',
    zoneNose: 'Nose',
    zoneCheeks: 'Cheeks',
    zoneMouth: 'Mouth',
    zoneChin: 'Chin',
    zoneEars: 'Ears',
    zoneFullFace: 'Full Face',

    zoneScalpDesc: 'Hair pulling prevention',
    zoneEyebrowsDesc: 'Eyebrow pulling prevention',
    zoneForeheadDesc: 'Forehead touching prevention',
    zoneEyesDesc: 'Eye rubbing prevention',
    zoneNoseDesc: 'Nose touching prevention',
    zoneCheeksDesc: 'Cheek touching prevention',
    zoneMouthDesc: 'Mouth area touching prevention',
    zoneChinDesc: 'Chin/beard area',
    zoneEarsDesc: 'Ear touching prevention',
    zoneFullFaceDesc: 'Monitor entire face',

    cameraError: 'Camera Error',

    // Statistics
    statsTodayTouches: 'Today\'s Touches',
    statsGoal: 'Goal',
    statsProgress: 'Progress',
    statsStreak: 'Streak',
    statsDays: 'days',
    statsLastTouch: 'Last touch',
    statsNever: 'Never',
    statsAgo: 'ago',
    statsMinutes: 'min',
    statsHours: 'h',
    statsMeditation: 'Meditation',

    // Meditation
    meditationButton: 'Meditation',
    meditationRecommend: 'Time for a mindful break?',
    meditationRecommendDesc: "You've touched your face several times. A short breathing exercise can help break the pattern.",
    meditationStart: 'Start',
    meditationSkip: 'Skip',
    meditationLater: 'Later',
    meditationInhale: 'Breathe In',
    meditationHold: 'Hold',
    meditationExhale: 'Breathe Out',
    meditationCycle: 'Cycle',
    meditationRemaining: 'remaining',
    meditationEnd: 'End',
    meditationPause: 'Pause',
    meditationResume: 'Resume',

    // Settings tabs and habit settings
    settingsTabDetection: 'Detection',
    settingsTabHabit: 'Habit',
    settingsTabData: 'Data',
    settingsDailyGoal: 'Daily Goal',
    settingsDailyGoalHint: 'Target max touches per day',
    settingsMeditationThreshold: 'Meditation Threshold',
    settingsMeditationThresholdHint: 'Recommend meditation after N touches',
    settingsMeditationReminder: 'Enable meditation reminders',
    settingsEnableMeditationReminder: 'Enable meditation reminders',
    settingsExport: 'Export Data',
    settingsImport: 'Import Data',
    settingsExportImport: 'Export / Import',
    settingsExportImportDesc: 'Backup or restore your statistics data',
    settingsExportSuccess: 'Data exported successfully',
    settingsImportSuccess: 'Data imported successfully',
    settingsImportError: 'Failed to import data',

    // Calendar
    calendarTitle: 'Monthly History',
    calendarToday: 'Today',
    calendarNoData: 'No data for this day',
    calendarGood: 'Goal met',
    calendarWarning: 'Near goal',
    calendarBad: 'Over goal',

    // App Settings
    settingsTabApp: 'App',
    settingsCamera: 'Camera',
    settingsCameraHint: 'Select camera device to use',
    settingsCameraDefault: 'Default Camera',
    settingsAutoStart: 'Start with Windows',
    settingsAutoStartHint: 'Launch app when Windows starts',
    settingsMinimizeToTray: 'Minimize to tray on close',
    settingsMinimizeToTrayHint: 'Keep running in system tray when closed',
    settingsStartMinimized: 'Start minimized',
    settingsStartMinimizedHint: 'Start in system tray',

    // Button titles
    buttonAbout: 'About',
    buttonMinimize: 'Minimize to tray',
    buttonClose: 'Close',

    // Camera Preview
    settingsHidePreview: 'Hide camera preview',
    settingsHidePreviewHint: 'Save resources by hiding the video feed (detection still works)',

    // Close Modal
    closeModalTitle: 'Close Application',
    closeModalQuit: 'Quit',
    closeModalTray: 'Minimize to Tray',
    closeModalCancel: 'Cancel',
    closeModalRemember: 'Remember my choice',
    settingsCloseAction: 'Close action',
    settingsCloseActionAsk: 'Ask every time',
    settingsCloseActionHint: 'Reset to ask before closing',

    // Splash Screen
    splashCheckingUpdates: 'Checking for updates...',
    splashLoadingResources: 'Loading resources...',
    splashInitializingDetection: 'Initializing detection model...',
    splashPreparingInterface: 'Preparing interface...',
    splashAlmostReady: 'Almost ready...',
    splashComplete: 'Complete!',
    splashLoading: 'Loading...',

    // About
    aboutDescription: 'An app to help break face-touching habits like hair pulling or skin picking through real-time detection.',
    aboutFeatures: 'Features',
    aboutFeature1: 'Real-time face/hand detection',
    aboutFeature2: 'Customizable detection zones',
    aboutFeature3: 'Daily statistics & streak tracking',
    aboutFeature4: 'Guided meditation',
    aboutTech: 'Technology',
    aboutPrivacy: 'Privacy & Data Protection',
    aboutPrivacyText: 'All video processing occurs locally on your device. No images, videos, or personal data are ever transmitted to external servers.',
    aboutLocalOnly: 'Local Processing Only',
    aboutNoData: 'No Data Collection',
    aboutCompliance: 'Compliant with GDPR (EU), CCPA (California), and PIPEDA (Canada) privacy regulations.',
    aboutOpenSource: 'Open Source',
    aboutOpenSourceText: 'This project is open source. View the source code, report issues, or contribute on GitHub.',

    // Update
    updateTitle: 'Software Update',
    updateCheck: 'Check for Updates',
    updateChecking: 'Checking...',
    updateAvailable: 'Update Available',
    updateNotAvailable: 'You are up to date!',
    updateDownload: 'Download',
    updateDownloading: 'Downloading...',
    updateInstall: 'Install Now',
    updateLater: 'Later',
    updateError: 'Update check failed',
    updateCurrent: 'Current',
    updateNew: 'New',
  },

  ko: {
    appTitle: '손대지마',

    statusSystem: '시스템',
    statusReady: '준비됨',
    statusInit: '초기화',
    statusDetection: '감지',
    statusActive: '활성',
    statusStandby: '대기',
    statusStatus: '상태',
    statusMonitoring: '모니터링',
    statusDetecting: '감지중',
    statusAlert: '경고',
    statusCooldown: '쿨다운',
    statusProximity: '거리',
    statusNear: '가까움',
    statusSafe: '안전',

    progressAlertThreshold: '경고 임계값',
    progressCooldownTimer: '쿨다운 타이머',
    progressAlertIn: '경고까지',
    progressResumeIn: '재개까지',

    controlStart: '감지 시작',
    controlStop: '감지 중지',
    controlLoading: 'TensorFlow.js 초기화 중...',

    videoCameraOffline: '카메라 꺼짐',
    videoInitialize: '모니터링을 시작하려면 감지 시스템을 초기화하세요',
    videoRec: '녹화',

    alertWarning: '경고',
    alertTitle: '얼굴 터치 감지됨',
    alertSubtitle: '즉시 얼굴에서 손을 떼세요',
    alertStatus: '상태',
    alertViolation: '위반',
    alertAction: '동작',
    alertClearToDismiss: '닫기 가능',
    alertHandStillNear: '손이 아직 가까움',
    alertDismissHint: '아무 곳이나 클릭하거나 아무 키나 눌러서 닫기',
    alertMoveHandAway: '먼저 손을 얼굴에서 떼세요',
    alertZoneDetected: '영역',

    settingsButton: '설정',
    settingsTitle: '감지 설정',
    settingsDetectionZones: '감지 영역',
    settingsZonesDesc: '얼굴 터치를 모니터링할 영역을 선택하세요',
    settingsSensitivity: '민감도',
    settingsSensitivityHint: '높을수록 더 먼 거리에서 감지',
    settingsTriggerTime: '경고 시간',
    settingsTriggerTimeHint: '경고가 발생하기까지의 시간',
    settingsCooldownTime: '쿨다운 시간',
    settingsCooldownTimeHint: '경고 후 재감지까지 대기 시간',
    settingsLanguage: '언어',
    settingsGeneral: '일반',
    settingsHairAreas: '모발 영역',
    settingsFaceAreas: '얼굴 영역',
    settingsActive: '활성',

    zoneScalp: '두피/정수리',
    zoneForehead: '이마',
    zoneEyebrows: '눈썹',
    zoneEyes: '눈',
    zoneNose: '코',
    zoneCheeks: '볼',
    zoneMouth: '입',
    zoneChin: '턱',
    zoneEars: '귀',
    zoneFullFace: '전체 얼굴',

    zoneScalpDesc: '발모벽 방지',
    zoneEyebrowsDesc: '눈썹 뽑기 방지',
    zoneForeheadDesc: '이마 만지기 방지',
    zoneEyesDesc: '눈 비비기 방지',
    zoneNoseDesc: '코 만지기 방지',
    zoneCheeksDesc: '볼 만지기 방지',
    zoneMouthDesc: '입 주변 만지기 방지',
    zoneChinDesc: '턱/수염 부위',
    zoneEarsDesc: '귀 만지기 방지',
    zoneFullFaceDesc: '전체 얼굴 감지',

    cameraError: '카메라 오류',

    // Statistics
    statsTodayTouches: '오늘 터치',
    statsGoal: '목표',
    statsProgress: '진행률',
    statsStreak: '연속',
    statsDays: '일',
    statsLastTouch: '마지막 터치',
    statsNever: '없음',
    statsAgo: '전',
    statsMinutes: '분',
    statsHours: '시간',
    statsMeditation: '명상',

    // Meditation
    meditationButton: '명상',
    meditationRecommend: '잠시 휴식하시겠어요?',
    meditationRecommendDesc: '얼굴을 여러 번 만지셨습니다. 짧은 호흡 운동이 습관을 바꾸는 데 도움이 됩니다.',
    meditationStart: '시작',
    meditationSkip: '건너뛰기',
    meditationLater: '나중에',
    meditationInhale: '들숨',
    meditationHold: '멈춤',
    meditationExhale: '날숨',
    meditationCycle: '사이클',
    meditationRemaining: '남음',
    meditationEnd: '종료',
    meditationPause: '일시정지',
    meditationResume: '재개',

    // Settings tabs and habit settings
    settingsTabDetection: '감지',
    settingsTabHabit: '습관',
    settingsTabData: '데이터',
    settingsDailyGoal: '일일 목표',
    settingsDailyGoalHint: '하루 최대 터치 횟수 목표',
    settingsMeditationThreshold: '명상 임계값',
    settingsMeditationThresholdHint: 'N회 터치 후 명상 권유',
    settingsMeditationReminder: '명상 알림 활성화',
    settingsEnableMeditationReminder: '명상 알림 활성화',
    settingsExport: '데이터 내보내기',
    settingsImport: '데이터 가져오기',
    settingsExportImport: '내보내기 / 가져오기',
    settingsExportImportDesc: '통계 데이터 백업 또는 복원',
    settingsExportSuccess: '데이터 내보내기 완료',
    settingsImportSuccess: '데이터 가져오기 완료',
    settingsImportError: '데이터 가져오기 실패',

    // Calendar
    calendarTitle: '월별 기록',
    calendarToday: '오늘',
    calendarNoData: '이 날의 데이터가 없습니다',
    calendarGood: '목표 달성',
    calendarWarning: '목표 근접',
    calendarBad: '목표 초과',

    // App Settings
    settingsTabApp: '앱',
    settingsCamera: '카메라',
    settingsCameraHint: '사용할 카메라 장치 선택',
    settingsCameraDefault: '기본 카메라',
    settingsAutoStart: 'Windows와 함께 시작',
    settingsAutoStartHint: 'Windows 시작 시 앱 실행',
    settingsMinimizeToTray: '닫을 때 트레이로 최소화',
    settingsMinimizeToTrayHint: '닫아도 시스템 트레이에서 계속 실행',
    settingsStartMinimized: '최소화 상태로 시작',
    settingsStartMinimizedHint: '시스템 트레이에서 시작',

    // Button titles
    buttonAbout: '정보',
    buttonMinimize: '트레이로 최소화',
    buttonClose: '닫기',

    // Camera Preview
    settingsHidePreview: '카메라 미리보기 숨기기',
    settingsHidePreviewHint: '영상 표시를 숨겨 리소스 절약 (감지는 계속 동작)',

    // Close Modal
    closeModalTitle: '앱 닫기',
    closeModalQuit: '종료',
    closeModalTray: '트레이로 최소화',
    closeModalCancel: '취소',
    closeModalRemember: '이 선택 기억하기',
    settingsCloseAction: '닫기 동작',
    settingsCloseActionAsk: '매번 묻기',
    settingsCloseActionHint: '닫기 전 매번 확인하도록 초기화',

    // Splash Screen
    splashCheckingUpdates: '업데이트 확인 중...',
    splashLoadingResources: '리소스 로딩 중...',
    splashInitializingDetection: '감지 모델 초기화 중...',
    splashPreparingInterface: '인터페이스 준비 중...',
    splashAlmostReady: '거의 완료...',
    splashComplete: '완료!',
    splashLoading: '로딩 중...',

    // About
    aboutDescription: '실시간 감지를 통해 발모벽, 피부뜯기 등의 얼굴 터치 습관을 개선하는 앱입니다.',
    aboutFeatures: '주요 기능',
    aboutFeature1: '실시간 얼굴/손 감지',
    aboutFeature2: '맞춤형 감지 영역 설정',
    aboutFeature3: '일일 통계 및 스트릭 추적',
    aboutFeature4: '명상 가이드',
    aboutTech: '기술',
    aboutPrivacy: '개인정보 보호',
    aboutPrivacyText: '모든 영상 처리는 사용자의 기기에서 로컬로 수행됩니다. 이미지, 영상 또는 개인 데이터는 외부 서버로 전송되지 않습니다.',
    aboutLocalOnly: '로컬 처리만',
    aboutNoData: '데이터 수집 없음',
    aboutCompliance: 'GDPR(유럽), CCPA(캘리포니아), PIPEDA(캐나다) 개인정보보호 규정을 준수합니다.',
    aboutOpenSource: '오픈 소스',
    aboutOpenSourceText: '이 프로젝트는 오픈 소스입니다. GitHub에서 소스 코드를 확인하거나, 이슈를 보고하거나, 기여할 수 있습니다.',

    // Update
    updateTitle: '소프트웨어 업데이트',
    updateCheck: '업데이트 확인',
    updateChecking: '확인 중...',
    updateAvailable: '업데이트 가능',
    updateNotAvailable: '최신 버전입니다!',
    updateDownload: '다운로드',
    updateDownloading: '다운로드 중...',
    updateInstall: '지금 설치',
    updateLater: '나중에',
    updateError: '업데이트 확인 실패',
    updateCurrent: '현재',
    updateNew: '최신',
  },

  ja: {
    appTitle: '触らないで',

    statusSystem: 'システム',
    statusReady: '準備完了',
    statusInit: '初期化',
    statusDetection: '検出',
    statusActive: 'アクティブ',
    statusStandby: 'スタンバイ',
    statusStatus: 'ステータス',
    statusMonitoring: '監視中',
    statusDetecting: '検出中',
    statusAlert: '警告',
    statusCooldown: 'クールダウン',
    statusProximity: '距離',
    statusNear: '近い',
    statusSafe: '安全',

    progressAlertThreshold: '警告しきい値',
    progressCooldownTimer: 'クールダウンタイマー',
    progressAlertIn: '警告まで',
    progressResumeIn: '再開まで',

    controlStart: '検出開始',
    controlStop: '検出停止',
    controlLoading: 'TensorFlow.js初期化中...',

    videoCameraOffline: 'カメラオフライン',
    videoInitialize: '監視を開始するには検出システムを初期化してください',
    videoRec: '録画',

    alertWarning: '警告',
    alertTitle: '顔タッチ検出',
    alertSubtitle: '今すぐ顔から手を離してください',
    alertStatus: 'ステータス',
    alertViolation: '違反',
    alertAction: 'アクション',
    alertClearToDismiss: '閉じることができます',
    alertHandStillNear: '手がまだ近い',
    alertDismissHint: 'どこかをクリックするかキーを押して閉じる',
    alertMoveHandAway: '最初に顔から手を離してください',
    alertZoneDetected: 'ゾーン',

    settingsButton: '設定',
    settingsTitle: '検出設定',
    settingsDetectionZones: '検出ゾーン',
    settingsZonesDesc: '顔タッチを監視する領域を選択してください',
    settingsSensitivity: '感度',
    settingsSensitivityHint: '高いほど遠い距離から検出',
    settingsTriggerTime: 'トリガー時間',
    settingsTriggerTimeHint: '警告が発生するまでの時間',
    settingsCooldownTime: 'クールダウン時間',
    settingsCooldownTimeHint: '警告後の再検出までの待機時間',
    settingsLanguage: '言語',
    settingsGeneral: '一般',
    settingsHairAreas: '毛髪エリア',
    settingsFaceAreas: '顔エリア',
    settingsActive: 'アクティブ',

    zoneScalp: '頭皮',
    zoneForehead: '額',
    zoneEyebrows: '眉毛',
    zoneEyes: '目',
    zoneNose: '鼻',
    zoneCheeks: '頬',
    zoneMouth: '口',
    zoneChin: '顎',
    zoneEars: '耳',
    zoneFullFace: '顔全体',

    zoneScalpDesc: '抜毛防止',
    zoneEyebrowsDesc: '眉毛抜き防止',
    zoneForeheadDesc: '額触り防止',
    zoneEyesDesc: '目こすり防止',
    zoneNoseDesc: '鼻触り防止',
    zoneCheeksDesc: '頬触り防止',
    zoneMouthDesc: '口周り触り防止',
    zoneChinDesc: '顎/ひげエリア',
    zoneEarsDesc: '耳触り防止',
    zoneFullFaceDesc: '顔全体を監視',

    cameraError: 'カメラエラー',

    // Statistics
    statsTodayTouches: '今日のタッチ',
    statsGoal: '目標',
    statsProgress: '進捗',
    statsStreak: '連続',
    statsDays: '日',
    statsLastTouch: '最後のタッチ',
    statsNever: 'なし',
    statsAgo: '前',
    statsMinutes: '分',
    statsHours: '時間',
    statsMeditation: '瞑想',

    // Meditation
    meditationButton: '瞑想',
    meditationRecommend: '休憩の時間ですか？',
    meditationRecommendDesc: '顔を何度か触りました。短い呼吸運動がパターンを変えるのに役立ちます。',
    meditationStart: '開始',
    meditationSkip: 'スキップ',
    meditationLater: '後で',
    meditationInhale: '吸う',
    meditationHold: '止める',
    meditationExhale: '吐く',
    meditationCycle: 'サイクル',
    meditationRemaining: '残り',
    meditationEnd: '終了',
    meditationPause: '一時停止',
    meditationResume: '再開',

    // Settings tabs and habit settings
    settingsTabDetection: '検出',
    settingsTabHabit: '習慣',
    settingsTabData: 'データ',
    settingsDailyGoal: '1日の目標',
    settingsDailyGoalHint: '1日の最大タッチ回数目標',
    settingsMeditationThreshold: '瞑想しきい値',
    settingsMeditationThresholdHint: 'N回タッチ後に瞑想を推奨',
    settingsMeditationReminder: '瞑想リマインダーを有効にする',
    settingsEnableMeditationReminder: '瞑想リマインダーを有効にする',
    settingsExport: 'データをエクスポート',
    settingsImport: 'データをインポート',
    settingsExportImport: 'エクスポート / インポート',
    settingsExportImportDesc: '統計データのバックアップまたは復元',
    settingsExportSuccess: 'データのエクスポートが完了しました',
    settingsImportSuccess: 'データのインポートが完了しました',
    settingsImportError: 'データのインポートに失敗しました',

    // Calendar
    calendarTitle: '月間履歴',
    calendarToday: '今日',
    calendarNoData: 'この日のデータはありません',
    calendarGood: '目標達成',
    calendarWarning: '目標付近',
    calendarBad: '目標超過',

    // App Settings
    settingsTabApp: 'アプリ',
    settingsCamera: 'カメラ',
    settingsCameraHint: '使用するカメラデバイスを選択',
    settingsCameraDefault: 'デフォルトカメラ',
    settingsAutoStart: 'Windows起動時に開始',
    settingsAutoStartHint: 'Windows起動時にアプリを起動',
    settingsMinimizeToTray: '閉じるときにトレイに最小化',
    settingsMinimizeToTrayHint: '閉じてもシステムトレイで実行を続ける',
    settingsStartMinimized: '最小化状態で起動',
    settingsStartMinimizedHint: 'システムトレイで起動',

    // Button titles
    buttonAbout: '情報',
    buttonMinimize: 'トレイに最小化',
    buttonClose: '閉じる',

    // Camera Preview
    settingsHidePreview: 'カメラプレビューを非表示',
    settingsHidePreviewHint: 'リソース節約のため映像表示を非表示（検出は継続）',

    // Close Modal
    closeModalTitle: 'アプリを閉じる',
    closeModalQuit: '終了',
    closeModalTray: 'トレイに最小化',
    closeModalCancel: 'キャンセル',
    closeModalRemember: 'この選択を記憶する',
    settingsCloseAction: '閉じる動作',
    settingsCloseActionAsk: '毎回確認',
    settingsCloseActionHint: '閉じる前に毎回確認するように戻す',

    // Splash Screen
    splashCheckingUpdates: 'アップデートを確認中...',
    splashLoadingResources: 'リソースを読み込み中...',
    splashInitializingDetection: '検出モデルを初期化中...',
    splashPreparingInterface: 'インターフェースを準備中...',
    splashAlmostReady: 'もうすぐ完了...',
    splashComplete: '完了！',
    splashLoading: '読み込み中...',

    // About
    aboutDescription: 'リアルタイム検出により、抜毛症や皮膚むしりなどの顔を触る習慣を改善するアプリです。',
    aboutFeatures: '主な機能',
    aboutFeature1: 'リアルタイム顔/手検出',
    aboutFeature2: 'カスタマイズ可能な検出ゾーン',
    aboutFeature3: '日次統計とストリーク追跡',
    aboutFeature4: '瞑想ガイド',
    aboutTech: '技術',
    aboutPrivacy: 'プライバシーとデータ保護',
    aboutPrivacyText: 'すべてのビデオ処理はお使いのデバイス上でローカルに行われます。画像、ビデオ、個人データが外部サーバーに送信されることはありません。',
    aboutLocalOnly: 'ローカル処理のみ',
    aboutNoData: 'データ収集なし',
    aboutCompliance: 'GDPR（EU）、CCPA（カリフォルニア）、PIPEDA（カナダ）のプライバシー規制に準拠しています。',
    aboutOpenSource: 'オープンソース',
    aboutOpenSourceText: 'このプロジェクトはオープンソースです。GitHubでソースコードの閲覧、問題の報告、貢献ができます。',

    // Update
    updateTitle: 'ソフトウェアアップデート',
    updateCheck: 'アップデートを確認',
    updateChecking: '確認中...',
    updateAvailable: 'アップデート可能',
    updateNotAvailable: '最新版です！',
    updateDownload: 'ダウンロード',
    updateDownloading: 'ダウンロード中...',
    updateInstall: '今すぐインストール',
    updateLater: '後で',
    updateError: 'アップデート確認失敗',
    updateCurrent: '現在',
    updateNew: '最新',
  },

  zh: {
    appTitle: '别碰',

    statusSystem: '系统',
    statusReady: '就绪',
    statusInit: '初始化',
    statusDetection: '检测',
    statusActive: '活动',
    statusStandby: '待机',
    statusStatus: '状态',
    statusMonitoring: '监控中',
    statusDetecting: '检测中',
    statusAlert: '警报',
    statusCooldown: '冷却',
    statusProximity: '距离',
    statusNear: '接近',
    statusSafe: '安全',

    progressAlertThreshold: '警报阈值',
    progressCooldownTimer: '冷却计时器',
    progressAlertIn: '警报倒计时',
    progressResumeIn: '恢复倒计时',

    controlStart: '开始检测',
    controlStop: '停止检测',
    controlLoading: '正在初始化TensorFlow.js...',

    videoCameraOffline: '摄像头离线',
    videoInitialize: '初始化检测系统以开始监控',
    videoRec: '录制',

    alertWarning: '警告',
    alertTitle: '检测到触摸脸部',
    alertSubtitle: '请立即将手从脸上移开',
    alertStatus: '状态',
    alertViolation: '违规',
    alertAction: '操作',
    alertClearToDismiss: '可以关闭',
    alertHandStillNear: '手仍然靠近',
    alertDismissHint: '点击任意位置或按任意键关闭',
    alertMoveHandAway: '请先将手从脸上移开',
    alertZoneDetected: '区域',

    settingsButton: '设置',
    settingsTitle: '检测设置',
    settingsDetectionZones: '检测区域',
    settingsZonesDesc: '选择要监控的面部触摸区域',
    settingsSensitivity: '灵敏度',
    settingsSensitivityHint: '越高触发距离越远',
    settingsTriggerTime: '触发时间',
    settingsTriggerTimeHint: '警报触发前的时间',
    settingsCooldownTime: '冷却时间',
    settingsCooldownTimeHint: '警报后重新检测前的等待时间',
    settingsLanguage: '语言',
    settingsGeneral: '一般',
    settingsHairAreas: '毛发区域',
    settingsFaceAreas: '面部区域',
    settingsActive: '活动',

    zoneScalp: '头皮',
    zoneForehead: '额头',
    zoneEyebrows: '眉毛',
    zoneEyes: '眼睛',
    zoneNose: '鼻子',
    zoneCheeks: '脸颊',
    zoneMouth: '嘴巴',
    zoneChin: '下巴',
    zoneEars: '耳朵',
    zoneFullFace: '整张脸',

    zoneScalpDesc: '防止拔毛',
    zoneEyebrowsDesc: '防止拔眉毛',
    zoneForeheadDesc: '防止触摸额头',
    zoneEyesDesc: '防止揉眼睛',
    zoneNoseDesc: '防止触摸鼻子',
    zoneCheeksDesc: '防止触摸脸颊',
    zoneMouthDesc: '防止触摸嘴部周围',
    zoneChinDesc: '下巴/胡须区域',
    zoneEarsDesc: '防止触摸耳朵',
    zoneFullFaceDesc: '监控整张脸',

    cameraError: '摄像头错误',

    // Statistics
    statsTodayTouches: '今日触摸',
    statsGoal: '目标',
    statsProgress: '进度',
    statsStreak: '连续',
    statsDays: '天',
    statsLastTouch: '最后触摸',
    statsNever: '从未',
    statsAgo: '前',
    statsMinutes: '分钟',
    statsHours: '小时',
    statsMeditation: '冥想',

    // Meditation
    meditationButton: '冥想',
    meditationRecommend: '需要休息一下吗？',
    meditationRecommendDesc: '您已经触摸脸部多次。短暂的呼吸练习可以帮助打破这种习惯。',
    meditationStart: '开始',
    meditationSkip: '跳过',
    meditationLater: '稍后',
    meditationInhale: '吸气',
    meditationHold: '屏息',
    meditationExhale: '呼气',
    meditationCycle: '周期',
    meditationRemaining: '剩余',
    meditationEnd: '结束',
    meditationPause: '暂停',
    meditationResume: '继续',

    // Settings tabs and habit settings
    settingsTabDetection: '检测',
    settingsTabHabit: '习惯',
    settingsTabData: '数据',
    settingsDailyGoal: '每日目标',
    settingsDailyGoalHint: '每日最大触摸次数目标',
    settingsMeditationThreshold: '冥想阈值',
    settingsMeditationThresholdHint: '触摸N次后推荐冥想',
    settingsMeditationReminder: '启用冥想提醒',
    settingsEnableMeditationReminder: '启用冥想提醒',
    settingsExport: '导出数据',
    settingsImport: '导入数据',
    settingsExportImport: '导出 / 导入',
    settingsExportImportDesc: '备份或恢复统计数据',
    settingsExportSuccess: '数据导出成功',
    settingsImportSuccess: '数据导入成功',
    settingsImportError: '数据导入失败',

    // Calendar
    calendarTitle: '月度记录',
    calendarToday: '今天',
    calendarNoData: '该日无数据',
    calendarGood: '达成目标',
    calendarWarning: '接近目标',
    calendarBad: '超出目标',

    // App Settings
    settingsTabApp: '应用',
    settingsCamera: '摄像头',
    settingsCameraHint: '选择要使用的摄像头设备',
    settingsCameraDefault: '默认摄像头',
    settingsAutoStart: '随Windows启动',
    settingsAutoStartHint: 'Windows启动时启动应用',
    settingsMinimizeToTray: '关闭时最小化到托盘',
    settingsMinimizeToTrayHint: '关闭时继续在系统托盘中运行',
    settingsStartMinimized: '启动时最小化',
    settingsStartMinimizedHint: '在系统托盘中启动',

    // Button titles
    buttonAbout: '关于',
    buttonMinimize: '最小化到托盘',
    buttonClose: '关闭',

    // Camera Preview
    settingsHidePreview: '隐藏摄像头预览',
    settingsHidePreviewHint: '隐藏视频画面以节省资源（检测仍在运行）',

    // Close Modal
    closeModalTitle: '关闭应用',
    closeModalQuit: '退出',
    closeModalTray: '最小化到托盘',
    closeModalCancel: '取消',
    closeModalRemember: '记住我的选择',
    settingsCloseAction: '关闭动作',
    settingsCloseActionAsk: '每次询问',
    settingsCloseActionHint: '关闭前每次询问',

    // Splash Screen
    splashCheckingUpdates: '正在检查更新...',
    splashLoadingResources: '正在加载资源...',
    splashInitializingDetection: '正在初始化检测模型...',
    splashPreparingInterface: '正在准备界面...',
    splashAlmostReady: '即将完成...',
    splashComplete: '完成！',
    splashLoading: '加载中...',

    // About
    aboutDescription: '通过实时检测帮助改善拔毛症、抠皮等触摸面部的习惯。',
    aboutFeatures: '主要功能',
    aboutFeature1: '实时面部/手部检测',
    aboutFeature2: '可自定义检测区域',
    aboutFeature3: '每日统计和连续记录',
    aboutFeature4: '冥想指导',
    aboutTech: '技术',
    aboutPrivacy: '隐私与数据保护',
    aboutPrivacyText: '所有视频处理都在您的设备本地进行。不会将任何图像、视频或个人数据传输到外部服务器。',
    aboutLocalOnly: '仅本地处理',
    aboutNoData: '不收集数据',
    aboutCompliance: '符合GDPR（欧盟）、CCPA（加利福尼亚）和PIPEDA（加拿大）隐私法规。',
    aboutOpenSource: '开源项目',
    aboutOpenSourceText: '本项目是开源的。您可以在GitHub上查看源代码、报告问题或参与贡献。',

    // Update
    updateTitle: '软件更新',
    updateCheck: '检查更新',
    updateChecking: '检查中...',
    updateAvailable: '有可用更新',
    updateNotAvailable: '已是最新版本！',
    updateDownload: '下载',
    updateDownloading: '下载中...',
    updateInstall: '立即安装',
    updateLater: '稍后',
    updateError: '检查更新失败',
    updateCurrent: '当前',
    updateNew: '最新',
  },

  es: {
    appTitle: 'No Toques',

    statusSystem: 'SISTEMA',
    statusReady: 'LISTO',
    statusInit: 'INIC',
    statusDetection: 'DETECCIÓN',
    statusActive: 'ACTIVO',
    statusStandby: 'ESPERA',
    statusStatus: 'ESTADO',
    statusMonitoring: 'MONITOREANDO',
    statusDetecting: 'DETECTANDO',
    statusAlert: 'ALERTA',
    statusCooldown: 'ENFRIAMIENTO',
    statusProximity: 'PROXIMIDAD',
    statusNear: 'CERCA',
    statusSafe: 'SEGURO',

    progressAlertThreshold: 'UMBRAL DE ALERTA',
    progressCooldownTimer: 'TEMPORIZADOR DE ENFRIAMIENTO',
    progressAlertIn: 'Alerta en',
    progressResumeIn: 'Reanudar en',

    controlStart: 'Iniciar Detección',
    controlStop: 'Detener Detección',
    controlLoading: 'Inicializando TensorFlow.js...',

    videoCameraOffline: 'CÁMARA DESCONECTADA',
    videoInitialize: 'Inicialice el sistema de detección para comenzar el monitoreo',
    videoRec: 'GRAB',

    alertWarning: 'ADVERTENCIA',
    alertTitle: 'TOQUE FACIAL DETECTADO',
    alertSubtitle: 'Retire la mano de su cara inmediatamente',
    alertStatus: 'ESTADO',
    alertViolation: 'VIOLACIÓN',
    alertAction: 'ACCIÓN',
    alertClearToDismiss: 'PUEDE CERRAR',
    alertHandStillNear: 'MANO AÚN CERCA',
    alertDismissHint: 'Haga clic en cualquier lugar o presione cualquier tecla para cerrar',
    alertMoveHandAway: 'PRIMERO ALEJE LA MANO DE LA CARA',
    alertZoneDetected: 'ZONA',

    settingsButton: 'Ajustes',
    settingsTitle: 'Configuración de Detección',
    settingsDetectionZones: 'Zonas de Detección',
    settingsZonesDesc: 'Seleccione las áreas para monitorear el toque facial',
    settingsSensitivity: 'Sensibilidad',
    settingsSensitivityHint: 'Mayor = se activa desde más lejos',
    settingsTriggerTime: 'Tiempo de Activación',
    settingsTriggerTimeHint: 'Tiempo antes de que se active la alerta',
    settingsCooldownTime: 'Tiempo de Enfriamiento',
    settingsCooldownTimeHint: 'Tiempo de espera después de la alerta',
    settingsLanguage: 'Idioma',
    settingsGeneral: 'General',
    settingsHairAreas: 'Áreas de Cabello',
    settingsFaceAreas: 'Áreas Faciales',
    settingsActive: 'Activo',

    zoneScalp: 'Cuero Cabelludo',
    zoneForehead: 'Frente',
    zoneEyebrows: 'Cejas',
    zoneEyes: 'Ojos',
    zoneNose: 'Nariz',
    zoneCheeks: 'Mejillas',
    zoneMouth: 'Boca',
    zoneChin: 'Mentón',
    zoneEars: 'Orejas',
    zoneFullFace: 'Cara Completa',

    zoneScalpDesc: 'Prevención de arrancarse el cabello',
    zoneEyebrowsDesc: 'Prevención de arrancarse las cejas',
    zoneForeheadDesc: 'Prevención de tocarse la frente',
    zoneEyesDesc: 'Prevención de frotarse los ojos',
    zoneNoseDesc: 'Prevención de tocarse la nariz',
    zoneCheeksDesc: 'Prevención de tocarse las mejillas',
    zoneMouthDesc: 'Prevención de tocarse la boca',
    zoneChinDesc: 'Área del mentón/barba',
    zoneEarsDesc: 'Prevención de tocarse las orejas',
    zoneFullFaceDesc: 'Monitorear toda la cara',

    cameraError: 'Error de Cámara',

    // Statistics
    statsTodayTouches: 'Toques de Hoy',
    statsGoal: 'Meta',
    statsProgress: 'Progreso',
    statsStreak: 'Racha',
    statsDays: 'días',
    statsLastTouch: 'Último toque',
    statsNever: 'Nunca',
    statsAgo: 'hace',
    statsMinutes: 'min',
    statsHours: 'h',
    statsMeditation: 'Meditación',

    // Meditation
    meditationButton: 'Meditación',
    meditationRecommend: '¿Tiempo para un descanso?',
    meditationRecommendDesc: 'Has tocado tu cara varias veces. Un breve ejercicio de respiración puede ayudar a romper el patrón.',
    meditationStart: 'Iniciar',
    meditationSkip: 'Omitir',
    meditationLater: 'Después',
    meditationInhale: 'Inhalar',
    meditationHold: 'Mantener',
    meditationExhale: 'Exhalar',
    meditationCycle: 'Ciclo',
    meditationRemaining: 'restante',
    meditationEnd: 'Terminar',
    meditationPause: 'Pausar',
    meditationResume: 'Reanudar',

    // Settings tabs and habit settings
    settingsTabDetection: 'Detección',
    settingsTabHabit: 'Hábito',
    settingsTabData: 'Datos',
    settingsDailyGoal: 'Meta Diaria',
    settingsDailyGoalHint: 'Máximo de toques por día',
    settingsMeditationThreshold: 'Umbral de Meditación',
    settingsMeditationThresholdHint: 'Recomendar meditación después de N toques',
    settingsMeditationReminder: 'Activar recordatorios de meditación',
    settingsEnableMeditationReminder: 'Activar recordatorios de meditación',
    settingsExport: 'Exportar Datos',
    settingsImport: 'Importar Datos',
    settingsExportImport: 'Exportar / Importar',
    settingsExportImportDesc: 'Respaldar o restaurar datos de estadísticas',
    settingsExportSuccess: 'Datos exportados correctamente',
    settingsImportSuccess: 'Datos importados correctamente',
    settingsImportError: 'Error al importar datos',

    // Calendar
    calendarTitle: 'Historial Mensual',
    calendarToday: 'Hoy',
    calendarNoData: 'Sin datos para este día',
    calendarGood: 'Meta cumplida',
    calendarWarning: 'Cerca de la meta',
    calendarBad: 'Sobre la meta',

    // App Settings
    settingsTabApp: 'App',
    settingsCamera: 'Cámara',
    settingsCameraHint: 'Seleccionar dispositivo de cámara',
    settingsCameraDefault: 'Cámara predeterminada',
    settingsAutoStart: 'Iniciar con Windows',
    settingsAutoStartHint: 'Ejecutar la app al iniciar Windows',
    settingsMinimizeToTray: 'Minimizar a bandeja al cerrar',
    settingsMinimizeToTrayHint: 'Seguir ejecutando en la bandeja del sistema',
    settingsStartMinimized: 'Iniciar minimizado',
    settingsStartMinimizedHint: 'Iniciar en la bandeja del sistema',

    // Button titles
    buttonAbout: 'Acerca de',
    buttonMinimize: 'Minimizar a bandeja',
    buttonClose: 'Cerrar',

    // Camera Preview
    settingsHidePreview: 'Ocultar vista previa de cámara',
    settingsHidePreviewHint: 'Ahorra recursos ocultando el video (la detección sigue funcionando)',

    // Close Modal
    closeModalTitle: 'Cerrar Aplicación',
    closeModalQuit: 'Salir',
    closeModalTray: 'Minimizar a Bandeja',
    closeModalCancel: 'Cancelar',
    closeModalRemember: 'Recordar mi elección',
    settingsCloseAction: 'Acción de cierre',
    settingsCloseActionAsk: 'Preguntar siempre',
    settingsCloseActionHint: 'Preguntar antes de cerrar cada vez',

    // Splash Screen
    splashCheckingUpdates: 'Comprobando actualizaciones...',
    splashLoadingResources: 'Cargando recursos...',
    splashInitializingDetection: 'Inicializando modelo de detección...',
    splashPreparingInterface: 'Preparando interfaz...',
    splashAlmostReady: 'Casi listo...',
    splashComplete: '¡Completado!',
    splashLoading: 'Cargando...',

    // About
    aboutDescription: 'Una app para ayudar a romper hábitos de tocarse la cara como tirarse del pelo o rascarse la piel mediante detección en tiempo real.',
    aboutFeatures: 'Características',
    aboutFeature1: 'Detección facial/manos en tiempo real',
    aboutFeature2: 'Zonas de detección personalizables',
    aboutFeature3: 'Estadísticas diarias y racha',
    aboutFeature4: 'Guía de meditación',
    aboutTech: 'Tecnología',
    aboutPrivacy: 'Privacidad y Protección de Datos',
    aboutPrivacyText: 'Todo el procesamiento de video ocurre localmente en su dispositivo. No se transmiten imágenes, videos ni datos personales a servidores externos.',
    aboutLocalOnly: 'Solo Procesamiento Local',
    aboutNoData: 'Sin Recopilación de Datos',
    aboutCompliance: 'Cumple con las regulaciones de privacidad GDPR (UE), CCPA (California) y PIPEDA (Canadá).',
    aboutOpenSource: 'Código Abierto',
    aboutOpenSourceText: 'Este proyecto es de código abierto. Vea el código fuente, reporte problemas o contribuya en GitHub.',

    // Update
    updateTitle: 'Actualización de Software',
    updateCheck: 'Buscar Actualizaciones',
    updateChecking: 'Buscando...',
    updateAvailable: 'Actualización Disponible',
    updateNotAvailable: '¡Está actualizado!',
    updateDownload: 'Descargar',
    updateDownloading: 'Descargando...',
    updateInstall: 'Instalar Ahora',
    updateLater: 'Más Tarde',
    updateError: 'Error al buscar actualizaciones',
    updateCurrent: 'Actual',
    updateNew: 'Nuevo',
  },

  ru: {
    appTitle: 'Не трогай',

    statusSystem: 'СИСТЕМА',
    statusReady: 'ГОТОВ',
    statusInit: 'ИНИЦ',
    statusDetection: 'ОБНАРУЖЕНИЕ',
    statusActive: 'АКТИВЕН',
    statusStandby: 'ОЖИДАНИЕ',
    statusStatus: 'СТАТУС',
    statusMonitoring: 'МОНИТОРИНГ',
    statusDetecting: 'ОБНАРУЖЕНИЕ',
    statusAlert: 'ТРЕВОГА',
    statusCooldown: 'ПЕРЕЗАРЯДКА',
    statusProximity: 'РАССТОЯНИЕ',
    statusNear: 'БЛИЗКО',
    statusSafe: 'БЕЗОПАСНО',

    progressAlertThreshold: 'ПОРОГ ТРЕВОГИ',
    progressCooldownTimer: 'ТАЙМЕР ПЕРЕЗАРЯДКИ',
    progressAlertIn: 'Тревога через',
    progressResumeIn: 'Возобновление через',

    controlStart: 'Начать обнаружение',
    controlStop: 'Остановить обнаружение',
    controlLoading: 'Инициализация TensorFlow.js...',

    videoCameraOffline: 'КАМЕРА ОТКЛЮЧЕНА',
    videoInitialize: 'Инициализируйте систему обнаружения для начала мониторинга',
    videoRec: 'ЗАП',

    alertWarning: 'ПРЕДУПРЕЖДЕНИЕ',
    alertTitle: 'ОБНАРУЖЕНО КАСАНИЕ ЛИЦА',
    alertSubtitle: 'Немедленно уберите руку от лица',
    alertStatus: 'СТАТУС',
    alertViolation: 'НАРУШЕНИЕ',
    alertAction: 'ДЕЙСТВИЕ',
    alertClearToDismiss: 'МОЖНО ЗАКРЫТЬ',
    alertHandStillNear: 'РУКА ЕЩЁ БЛИЗКО',
    alertDismissHint: 'Нажмите в любом месте или любую клавишу, чтобы закрыть',
    alertMoveHandAway: 'СНАЧАЛА УБЕРИТЕ РУКУ ОТ ЛИЦА',
    alertZoneDetected: 'ЗОНА',

    settingsButton: 'Настройки',
    settingsTitle: 'Настройки обнаружения',
    settingsDetectionZones: 'Зоны обнаружения',
    settingsZonesDesc: 'Выберите области для мониторинга касания лица',
    settingsSensitivity: 'Чувствительность',
    settingsSensitivityHint: 'Выше = срабатывает с большего расстояния',
    settingsTriggerTime: 'Время срабатывания',
    settingsTriggerTimeHint: 'Время до срабатывания тревоги',
    settingsCooldownTime: 'Время перезарядки',
    settingsCooldownTimeHint: 'Время ожидания после тревоги',
    settingsLanguage: 'Язык',
    settingsGeneral: 'Общие',
    settingsHairAreas: 'Области волос',
    settingsFaceAreas: 'Области лица',
    settingsActive: 'Активно',

    zoneScalp: 'Кожа головы',
    zoneForehead: 'Лоб',
    zoneEyebrows: 'Брови',
    zoneEyes: 'Глаза',
    zoneNose: 'Нос',
    zoneCheeks: 'Щёки',
    zoneMouth: 'Рот',
    zoneChin: 'Подбородок',
    zoneEars: 'Уши',
    zoneFullFace: 'Всё лицо',

    zoneScalpDesc: 'Предотвращение выдёргивания волос',
    zoneEyebrowsDesc: 'Предотвращение выдёргивания бровей',
    zoneForeheadDesc: 'Предотвращение касания лба',
    zoneEyesDesc: 'Предотвращение трения глаз',
    zoneNoseDesc: 'Предотвращение касания носа',
    zoneCheeksDesc: 'Предотвращение касания щёк',
    zoneMouthDesc: 'Предотвращение касания рта',
    zoneChinDesc: 'Область подбородка/бороды',
    zoneEarsDesc: 'Предотвращение касания ушей',
    zoneFullFaceDesc: 'Мониторинг всего лица',

    cameraError: 'Ошибка камеры',

    // Statistics
    statsTodayTouches: 'Касания сегодня',
    statsGoal: 'Цель',
    statsProgress: 'Прогресс',
    statsStreak: 'Серия',
    statsDays: 'дней',
    statsLastTouch: 'Последнее касание',
    statsNever: 'Никогда',
    statsAgo: 'назад',
    statsMinutes: 'мин',
    statsHours: 'ч',
    statsMeditation: 'Медитация',

    // Meditation
    meditationButton: 'Медитация',
    meditationRecommend: 'Время для перерыва?',
    meditationRecommendDesc: 'Вы несколько раз касались лица. Короткое дыхательное упражнение поможет избавиться от привычки.',
    meditationStart: 'Начать',
    meditationSkip: 'Пропустить',
    meditationLater: 'Позже',
    meditationInhale: 'Вдох',
    meditationHold: 'Задержка',
    meditationExhale: 'Выдох',
    meditationCycle: 'Цикл',
    meditationRemaining: 'осталось',
    meditationEnd: 'Завершить',
    meditationPause: 'Пауза',
    meditationResume: 'Продолжить',

    // Settings tabs and habit settings
    settingsTabDetection: 'Обнаружение',
    settingsTabHabit: 'Привычка',
    settingsTabData: 'Данные',
    settingsDailyGoal: 'Ежедневная цель',
    settingsDailyGoalHint: 'Максимум касаний в день',
    settingsMeditationThreshold: 'Порог медитации',
    settingsMeditationThresholdHint: 'Рекомендовать медитацию после N касаний',
    settingsMeditationReminder: 'Включить напоминания о медитации',
    settingsEnableMeditationReminder: 'Включить напоминания о медитации',
    settingsExport: 'Экспорт данных',
    settingsImport: 'Импорт данных',
    settingsExportImport: 'Экспорт / Импорт',
    settingsExportImportDesc: 'Резервное копирование или восстановление данных статистики',
    settingsExportSuccess: 'Данные успешно экспортированы',
    settingsImportSuccess: 'Данные успешно импортированы',
    settingsImportError: 'Ошибка импорта данных',

    // Calendar
    calendarTitle: 'Месячная история',
    calendarToday: 'Сегодня',
    calendarNoData: 'Нет данных за этот день',
    calendarGood: 'Цель достигнута',
    calendarWarning: 'Близко к цели',
    calendarBad: 'Цель превышена',

    // App Settings
    settingsTabApp: 'Приложение',
    settingsCamera: 'Камера',
    settingsCameraHint: 'Выберите устройство камеры',
    settingsCameraDefault: 'Камера по умолчанию',
    settingsAutoStart: 'Запускать с Windows',
    settingsAutoStartHint: 'Запускать приложение при старте Windows',
    settingsMinimizeToTray: 'Сворачивать в трей при закрытии',
    settingsMinimizeToTrayHint: 'Продолжать работу в системном трее',
    settingsStartMinimized: 'Запускать свёрнутым',
    settingsStartMinimizedHint: 'Запускать в системном трее',

    // Button titles
    buttonAbout: 'О приложении',
    buttonMinimize: 'Свернуть в трей',
    buttonClose: 'Закрыть',

    // Camera Preview
    settingsHidePreview: 'Скрыть превью камеры',
    settingsHidePreviewHint: 'Экономия ресурсов скрытием видео (обнаружение продолжается)',

    // Close Modal
    closeModalTitle: 'Закрыть приложение',
    closeModalQuit: 'Выйти',
    closeModalTray: 'Свернуть в трей',
    closeModalCancel: 'Отмена',
    closeModalRemember: 'Запомнить мой выбор',
    settingsCloseAction: 'Действие при закрытии',
    settingsCloseActionAsk: 'Спрашивать каждый раз',
    settingsCloseActionHint: 'Спрашивать перед закрытием каждый раз',

    // Splash Screen
    splashCheckingUpdates: 'Проверка обновлений...',
    splashLoadingResources: 'Загрузка ресурсов...',
    splashInitializingDetection: 'Инициализация модели обнаружения...',
    splashPreparingInterface: 'Подготовка интерфейса...',
    splashAlmostReady: 'Почти готово...',
    splashComplete: 'Готово!',
    splashLoading: 'Загрузка...',

    // About
    aboutDescription: 'Приложение для избавления от привычки касаться лица (трихотилломания, дерматилломания) с помощью обнаружения в реальном времени.',
    aboutFeatures: 'Функции',
    aboutFeature1: 'Обнаружение лица/рук в реальном времени',
    aboutFeature2: 'Настраиваемые зоны обнаружения',
    aboutFeature3: 'Ежедневная статистика и серии',
    aboutFeature4: 'Гид по медитации',
    aboutTech: 'Технологии',
    aboutPrivacy: 'Конфиденциальность и защита данных',
    aboutPrivacyText: 'Вся обработка видео происходит локально на вашем устройстве. Никакие изображения, видео или персональные данные не передаются на внешние серверы.',
    aboutLocalOnly: 'Только локальная обработка',
    aboutNoData: 'Сбор данных отсутствует',
    aboutCompliance: 'Соответствует требованиям GDPR (ЕС), CCPA (Калифорния) и PIPEDA (Канада) о защите персональных данных.',
    aboutOpenSource: 'Открытый исходный код',
    aboutOpenSourceText: 'Этот проект с открытым исходным кодом. Просматривайте код, сообщайте о проблемах или вносите свой вклад на GitHub.',

    // Update
    updateTitle: 'Обновление ПО',
    updateCheck: 'Проверить обновления',
    updateChecking: 'Проверка...',
    updateAvailable: 'Доступно обновление',
    updateNotAvailable: 'У вас последняя версия!',
    updateDownload: 'Скачать',
    updateDownloading: 'Скачивание...',
    updateInstall: 'Установить сейчас',
    updateLater: 'Позже',
    updateError: 'Ошибка проверки обновлений',
    updateCurrent: 'Текущая',
    updateNew: 'Новая',
  },
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  zh: '中文',
  es: 'Español',
  ru: 'Русский',
};
