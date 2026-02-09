type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const isProduction = typeof window !== 'undefined'
  ? !window.location.hostname.includes('127.0.0.1') && !window.location.hostname.includes('localhost')
  : true

const currentLevel: LogLevel = isProduction ? 'warn' : 'debug'

export const logger = {
  debug(...args: unknown[]) {
    if (LOG_LEVELS.debug >= LOG_LEVELS[currentLevel]) console.log('[Debug]', ...args)
  },
  info(...args: unknown[]) {
    if (LOG_LEVELS.info >= LOG_LEVELS[currentLevel]) console.log('[Info]', ...args)
  },
  warn(...args: unknown[]) {
    if (LOG_LEVELS.warn >= LOG_LEVELS[currentLevel]) console.warn('[Warn]', ...args)
  },
  error(...args: unknown[]) {
    if (LOG_LEVELS.error >= LOG_LEVELS[currentLevel]) console.error('[Error]', ...args)
  },
}
