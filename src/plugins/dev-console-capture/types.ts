export type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

export interface LogEntry {
  id: string
  timestamp: number
  level: LogLevel
  message: string
  args: unknown[]
  source: 'console' | 'error' | 'unhandledrejection'
  stack?: string
  url?: string
  line?: number
  column?: number
}

export interface DevConsoleCaptureOptions {
  /** Maximum number of log entries to store (default: 1000) */
  maxBufferSize?: number
  /** Log levels to capture (default: all) */
  levels?: LogLevel[]
  /** Capture window.onerror events (default: true) */
  captureErrors?: boolean
  /** Capture unhandledrejection events (default: true) */
  captureUnhandledRejections?: boolean
  /** Custom path prefix (default: /__dev/console) */
  pathPrefix?: string
}

export interface CapabilitiesResponse {
  version: string
  capabilities: {
    levels: LogLevel[]
    capturesErrors: boolean
    capturesUnhandledRejections: boolean
    maxBufferSize: number
    currentCount: number
  }
}

export interface LogsResponse {
  logs: LogEntry[]
  meta: {
    total: number
    returned: number
    oldestTimestamp: number | null
    newestTimestamp: number | null
  }
}

export interface LogsQueryParams {
  limit?: number
  level?: LogLevel | LogLevel[]
  search?: string
  since?: number
}
