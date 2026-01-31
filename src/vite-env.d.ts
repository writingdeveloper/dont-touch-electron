/// <reference types="vite/client" />

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer & {
    debugLog: (...args: unknown[]) => void
  }
  // Aptabase analytics
  analytics: {
    trackEvent: (eventName: string, props?: Record<string, string | number>) => Promise<boolean>
  }
  // App info
  appInfo: {
    getVersion: () => Promise<string>
  }
}
