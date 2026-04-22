/**
 * @fileoverview Structured logging utility.
 * Replaces raw console.log/error calls with structured, level-aware logging.
 * In production, this can be extended to forward logs to Google Cloud Logging.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

/**
 * Formats a structured log entry and outputs it to the console.
 * Uses JSON format in production for compatibility with cloud log aggregators.
 */
function writeLog(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data !== undefined && { data }),
  };

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Structured JSON output for Google Cloud Logging / log aggregators
    const output = JSON.stringify(entry);
    switch (level) {
      case 'ERROR':
        console.error(output);
        break;
      case 'WARN':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  } else {
    // Human-readable output for local development
    const prefix = `[${entry.timestamp}] [${level}]`;
    switch (level) {
      case 'ERROR':
        console.error(prefix, message, data ?? '');
        break;
      case 'WARN':
        console.warn(prefix, message, data ?? '');
        break;
      case 'DEBUG':
        console.debug(prefix, message, data ?? '');
        break;
      default:
        console.log(prefix, message, data ?? '');
    }
  }
}

/**
 * Application logger with structured output.
 * 
 * @example
 * ```ts
 * logger.info('User signed in', { userId: 'abc123' });
 * logger.error('Failed to fetch data', error);
 * ```
 */
export const logger = {
  /** Debug-level logging — stripped in production log analysis */
  debug: (message: string, data?: unknown): void => writeLog('DEBUG', message, data),

  /** Informational logging for normal operations */
  info: (message: string, data?: unknown): void => writeLog('INFO', message, data),

  /** Warning-level logging for recoverable issues */
  warn: (message: string, data?: unknown): void => writeLog('WARN', message, data),

  /** Error-level logging for failures */
  error: (message: string, data?: unknown): void => writeLog('ERROR', message, data),
};
