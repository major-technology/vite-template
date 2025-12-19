export function generateClientScript(pathPrefix: string): string {
  return `
(function() {
  'use strict';

  if (window.__DEV_CONSOLE_CAPTURE__) return;
  window.__DEV_CONSOLE_CAPTURE__ = true;

  var ENDPOINT = '${pathPrefix}/ingest';
  var LEVELS = ['log', 'info', 'warn', 'error', 'debug'];
  var queue = [];
  var flushTimeout = null;

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function serialize(args) {
    return args.map(function(arg) {
      try {
        if (arg instanceof Error) {
          return { __error__: true, message: arg.message, stack: arg.stack };
        }
        return JSON.parse(JSON.stringify(arg, function(key, value) {
          if (typeof value === 'function') return '[Function]';
          if (typeof value === 'symbol') return value.toString();
          if (value instanceof HTMLElement) return value.outerHTML.slice(0, 200);
          return value;
        }));
      } catch (e) {
        return String(arg);
      }
    });
  }

  function flush() {
    if (queue.length === 0) return;

    var entries = queue.splice(0, queue.length);
    var payload = JSON.stringify({ entries: entries });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
    } else {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(function() {});
    }

    flushTimeout = null;
  }

  function scheduleFlush() {
    if (flushTimeout) return;
    flushTimeout = setTimeout(flush, 100);
  }

  LEVELS.forEach(function(level) {
    var original = console[level];
    console[level] = function() {
      var args = Array.prototype.slice.call(arguments);
      queue.push({
        id: uid(),
        level: level,
        timestamp: Date.now(),
        args: serialize(args),
        message: args.map(function(a) { return String(a); }).join(' '),
        source: 'console'
      });
      scheduleFlush();
      return original.apply(console, args);
    };
  });

  window.addEventListener('error', function(event) {
    queue.push({
      id: uid(),
      level: 'error',
      timestamp: Date.now(),
      args: [event.message],
      message: event.message,
      source: 'error',
      stack: event.error ? event.error.stack : undefined,
      url: event.filename,
      line: event.lineno,
      column: event.colno
    });
    scheduleFlush();
  });

  window.addEventListener('unhandledrejection', function(event) {
    var message = event.reason && event.reason.message ? event.reason.message : String(event.reason);
    queue.push({
      id: uid(),
      level: 'error',
      timestamp: Date.now(),
      args: [message],
      message: 'Unhandled Promise Rejection: ' + message,
      source: 'unhandledrejection',
      stack: event.reason ? event.reason.stack : undefined
    });
    scheduleFlush();
  });

  window.addEventListener('beforeunload', flush);
  window.addEventListener('pagehide', flush);
})();
`
}
