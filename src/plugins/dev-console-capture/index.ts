import type { Plugin, ViteDevServer } from 'vite'
import type {
  DevConsoleCaptureOptions,
  LogEntry,
  LogLevel,
  CapabilitiesResponse,
  LogsResponse,
} from './types'
import { RingBuffer } from './ring-buffer'
import { generateClientScript } from './client-script'

const DEFAULT_OPTIONS: Required<DevConsoleCaptureOptions> = {
  maxBufferSize: 1000,
  levels: ['log', 'info', 'warn', 'error', 'debug'],
  captureErrors: true,
  captureUnhandledRejections: true,
  pathPrefix: '/__dev/console',
}

export function devConsoleCapture(
  options: DevConsoleCaptureOptions = {}
): Plugin {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const buffer = new RingBuffer<LogEntry>(config.maxBufferSize)

  return {
    name: 'dev-console-capture',
    apply: 'serve',

    configureServer(server: ViteDevServer) {
      const { pathPrefix } = config

      // Capabilities endpoint
      server.middlewares.use(`${pathPrefix}/caps`, (_req, res) => {
        const response: CapabilitiesResponse = {
          version: '1.0.0',
          capabilities: {
            levels: config.levels,
            capturesErrors: config.captureErrors,
            capturesUnhandledRejections: config.captureUnhandledRejections,
            maxBufferSize: config.maxBufferSize,
            currentCount: buffer.size,
          },
        }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(response))
      })

      // Ingest endpoint
      server.middlewares.use(`${pathPrefix}/ingest`, (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }

        let body = ''
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
        })
        req.on('end', () => {
          try {
            const { entries } = JSON.parse(body) as { entries: LogEntry[] }
            for (const entry of entries) {
              if (config.levels.includes(entry.level)) {
                buffer.push(entry)
              }
            }
          } catch {
            // Silently ignore malformed payloads
          }
          res.statusCode = 204
          res.end()
        })
      })

      // Logs endpoint
      server.middlewares.use(`${pathPrefix}/logs`, (req, res) => {
        if (req.method === 'DELETE') {
          buffer.clear()
          res.statusCode = 204
          res.end()
          return
        }

        const url = new URL(req.url ?? '', 'http://localhost')
        const params = parseQueryParams(url.searchParams)

        let logs = buffer.toArray()

        // Filter by level
        if (params.level) {
          const levels = Array.isArray(params.level)
            ? params.level
            : [params.level]
          logs = logs.filter((log) => levels.includes(log.level))
        }

        // Filter by timestamp
        if (params.since) {
          logs = logs.filter((log) => log.timestamp >= params.since!)
        }

        // Filter by search term
        if (params.search) {
          const searchLower = params.search.toLowerCase()
          logs = logs.filter((log) =>
            log.message.toLowerCase().includes(searchLower)
          )
        }

        // Apply limit
        const limit = Math.min(params.limit ?? 100, 1000)
        const limited = logs.slice(-limit)

        const response: LogsResponse = {
          logs: limited,
          meta: {
            total: buffer.size,
            returned: limited.length,
            oldestTimestamp: limited[0]?.timestamp ?? null,
            newestTimestamp: limited[limited.length - 1]?.timestamp ?? null,
          },
        }

        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(response))
      })
    },

    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'text/javascript' },
          children: generateClientScript(config.pathPrefix),
          injectTo: 'head-prepend' as const,
        },
      ]
    },
  }
}

function parseQueryParams(searchParams: URLSearchParams): {
  limit?: number
  level?: LogLevel[]
  search?: string
  since?: number
} {
  const limit = searchParams.get('limit')
  const level = searchParams.get('level')
  const search = searchParams.get('search')
  const since = searchParams.get('since')

  return {
    limit: limit ? parseInt(limit, 10) : undefined,
    level: level
      ? (level.split(',').filter(Boolean) as LogLevel[])
      : undefined,
    search: search ?? undefined,
    since: since ? parseInt(since, 10) : undefined,
  }
}

export default devConsoleCapture
export * from './types'
