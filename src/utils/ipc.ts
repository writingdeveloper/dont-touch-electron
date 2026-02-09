import { logger } from './logger'

export async function safeInvoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T | undefined> {
  try {
    return await window.ipcRenderer?.invoke(channel, ...args) as T
  } catch (err) {
    logger.error(`IPC invoke failed [${channel}]:`, err)
    return undefined
  }
}
