# Dev Console Capture API

Base URL: `http://localhost:3000/__dev/console`

## Endpoints

### GET /caps

Returns server capabilities and current state.

**Request:**
```
GET /__dev/console/caps
```

**Response:** `200 OK`
```json
{
  "version": "1.0.0",
  "capabilities": {
    "levels": ["log", "info", "warn", "error", "debug"],
    "capturesErrors": true,
    "capturesUnhandledRejections": true,
    "maxBufferSize": 1000,
    "currentCount": 42
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | API version |
| `capabilities.levels` | string[] | Log levels being captured |
| `capabilities.capturesErrors` | boolean | Whether `window.onerror` events are captured |
| `capabilities.capturesUnhandledRejections` | boolean | Whether unhandled promise rejections are captured |
| `capabilities.maxBufferSize` | number | Maximum entries stored (ring buffer capacity) |
| `capabilities.currentCount` | number | Current number of entries in buffer |

---

### GET /logs

Returns captured log entries with optional filtering.

**Request:**
```
GET /__dev/console/logs?limit=100&level=error,warn&search=failed&since=1702900000000
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 100 | Max entries to return (1-1000) |
| `level` | string | all | Comma-separated levels to include: `log`, `info`, `warn`, `error`, `debug` |
| `search` | string | - | Case-insensitive substring match on message |
| `since` | number | - | Unix timestamp (ms) - only entries after this time |

**Response:** `200 OK`
```json
{
  "logs": [
    {
      "id": "abc12345",
      "timestamp": 1702900123456,
      "level": "error",
      "message": "Failed to fetch user data",
      "args": ["userId:", 42, {"error": "timeout"}],
      "source": "console",
      "stack": "Error: Failed to fetch...\n    at fetchUser (app.js:42)",
      "url": "http://localhost:3000/src/App.tsx",
      "line": 15,
      "column": 8
    }
  ],
  "meta": {
    "total": 150,
    "returned": 1,
    "oldestTimestamp": 1702900000000,
    "newestTimestamp": 1702900123456
  }
}
```

**LogEntry Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (8 char random) |
| `timestamp` | number | Unix timestamp in milliseconds |
| `level` | string | One of: `log`, `info`, `warn`, `error`, `debug` |
| `message` | string | Stringified log message |
| `args` | any[] | Serialized arguments passed to console method |
| `source` | string | Origin: `console`, `error`, or `unhandledrejection` |
| `stack` | string? | Stack trace (errors only) |
| `url` | string? | Source file URL (window errors only) |
| `line` | number? | Line number (window errors only) |
| `column` | number? | Column number (window errors only) |

**Meta Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total entries in buffer (before filtering) |
| `returned` | number | Entries returned in this response |
| `oldestTimestamp` | number \| null | Timestamp of oldest returned entry |
| `newestTimestamp` | number \| null | Timestamp of newest returned entry |

---

### DELETE /logs

Clears all entries from the buffer.

**Request:**
```
DELETE /__dev/console/logs
```

**Response:** `204 No Content`

---

## MCP Tool Definitions

```json
{
  "tools": [
    {
      "name": "get_browser_logs",
      "description": "Get recent browser console logs from the dev server. Use this to debug client-side errors, warnings, and application behavior.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "number",
            "description": "Maximum entries to return (1-1000)",
            "default": 50
          },
          "level": {
            "type": "string",
            "description": "Filter by log level(s), comma-separated: log,info,warn,error,debug",
            "enum": ["log", "info", "warn", "error", "debug", "error,warn"]
          },
          "search": {
            "type": "string",
            "description": "Filter logs containing this substring (case-insensitive)"
          }
        }
      }
    },
    {
      "name": "get_browser_errors",
      "description": "Get browser errors and warnings only. Shortcut for get_browser_logs with level=error,warn",
      "inputSchema": {
        "type": "object",
        "properties": {
          "limit": {
            "type": "number",
            "description": "Maximum entries to return",
            "default": 20
          }
        }
      }
    },
    {
      "name": "clear_browser_logs",
      "description": "Clear all captured browser logs",
      "inputSchema": {
        "type": "object",
        "properties": {}
      }
    },
    {
      "name": "get_console_capabilities",
      "description": "Check if browser log capture is available and get current buffer status",
      "inputSchema": {
        "type": "object",
        "properties": {}
      }
    }
  ]
}
```

## Example Usage

```bash
# Get last 50 logs
curl http://localhost:3000/__dev/console/logs?limit=50

# Get only errors and warnings
curl "http://localhost:3000/__dev/console/logs?level=error,warn"

# Search for specific text
curl "http://localhost:3000/__dev/console/logs?search=fetch"

# Get logs since a timestamp
curl "http://localhost:3000/__dev/console/logs?since=1702900000000"

# Combine filters
curl "http://localhost:3000/__dev/console/logs?level=error&search=user&limit=10"

# Check capabilities
curl http://localhost:3000/__dev/console/caps

# Clear buffer
curl -X DELETE http://localhost:3000/__dev/console/logs
```

## Notes

- Logs are stored in a ring buffer; oldest entries are evicted when capacity is reached
- Buffer is cleared on server restart
- Only available in dev mode (`vite dev`), not in production builds
- The `args` field contains serialized versions of console arguments; functions become `"[Function]"`, DOM elements are truncated HTML
- StrictMode double-renders may appear with ANSI escape codes in the message (dimmed styling)
