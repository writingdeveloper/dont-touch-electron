import { ipcRenderer, contextBridge } from 'electron'

// IPC channel whitelists for security
// Renderer → Main (send)
const ALLOWED_SEND_CHANNELS = new Set([
  'debug-log',
  'close-alert-window',
  'set-language',
])

// Renderer → Main (invoke, expects response)
const ALLOWED_INVOKE_CHANNELS = new Set([
  'show-fullscreen-alert',
  'hide-fullscreen-alert',
  'update-alert-data',
  'get-app-settings',
  'set-app-settings',
  'get-app-version',
  'check-update',
  'check-update-silent',
  'start-download',
  'quit-and-install',
  'window-minimize',
  'window-close',
  'window-hide',
  'window-quit',
  'track-event',
  'open-external',
  'open-win',
])

// Main → Renderer (receive)
const ALLOWED_RECEIVE_CHANNELS = new Set([
  'alert-data',
  'alert-dismissed',
  'update-can-available',
  'download-progress',
  'update-downloaded',
  'update-error',
  'toggle-detection',
  'main-process-message',
])

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    if (!ALLOWED_RECEIVE_CHANNELS.has(channel)) {
      console.warn(`[Preload] Blocked receive on unauthorized channel: ${channel}`)
      return ipcRenderer
    }
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    if (!ALLOWED_RECEIVE_CHANNELS.has(channel)) {
      return ipcRenderer
    }
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    if (!ALLOWED_SEND_CHANNELS.has(channel)) {
      console.warn(`[Preload] Blocked send on unauthorized channel: ${channel}`)
      return
    }
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    if (!ALLOWED_INVOKE_CHANNELS.has(channel)) {
      console.warn(`[Preload] Blocked invoke on unauthorized channel: ${channel}`)
      return Promise.reject(new Error(`Unauthorized IPC channel: ${channel}`))
    }
    return ipcRenderer.invoke(channel, ...omit)
  },

  // Debug log to main process (terminal)
  debugLog(...args: unknown[]) {
    ipcRenderer.send('debug-log', ...args)
  },
})

// Expose analytics API
contextBridge.exposeInMainWorld('analytics', {
  trackEvent(eventName: string, props?: Record<string, string | number>) {
    return ipcRenderer.invoke('track-event', eventName, props)
  },
})

// Expose app info API
contextBridge.exposeInMainWorld('appInfo', {
  getVersion(): Promise<string> {
    return ipcRenderer.invoke('get-app-version')
  },
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)