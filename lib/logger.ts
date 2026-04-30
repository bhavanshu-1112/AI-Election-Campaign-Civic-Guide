/**
 * @fileoverview Structured logging utility compatible with Google Cloud Logging.
 * Replaces raw console.log/error calls with structured, level-aware logging.
 * In production, outputs JSON with Cloud Logging severity fields for automatic
 * log level detection by Google Cloud Logging agents.
 *
 * @see https://cloud.google.com/logging/docs/structured-logging
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

/** Map internal log levels to Google Cloud Logging severity values */
const CLOUD_SEVERITY_MAP: Record<LogLevel, string> = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
};

interface StructuredLogEntry {
  /** ISO-8601 timestamp */
  timestamp: string;
  /** Google Cloud Logging severity level */
  severity: string;
  /** Human-readable log message */
  message: string;
  /** Optional structured data payload */
  data?: unknown;
  /** Service context for Google Cloud Error Reporting */
  'logging.googleapis.com/labels'?: Record<string, string>;
}

/**
 * Determines if the current log level should be emitted based on the
 * minimum log level configuration. In production, DEBUG is suppressed
 * to reduce noise and cost in Cloud Logging.
 */
function shouldLog(level: LogLevel): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && level === 'DEBUG') return false;
  return true;
}

/**
 * Formats a structured log entry and outputs it to the console.
 * Uses Google Cloud Logging-compatible JSON format in production
 * for automatic severity detection and log aggregation.
 */
function writeLog(level: LogLevel, message: string, data?: unknown): void {
  if (!shouldLog(level)) return;

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    // Google Cloud Logging structured JSON format
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      severity: CLOUD_SEVERITY_MAP[level],
      message,
      ...(data !== undefined && { data }),
      'logging.googleapis.com/labels': {
        service: 'civicguide-ai',
        version: process.env.npm_package_version || '0.1.0',
      },
    };

    const output = JSON.stringify(entry);
    switch (level) {
      case 'ERROR':
        console.error(output);
        break;
      case 'WARNING':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  } else {
    // Human-readable output for local development
    const prefix = `[${new Date().toISOString()}] [${level}]`;
    switch (level) {
      case 'ERROR':
        console.error(prefix, message, data ?? '');
        break;
      case 'WARNING':
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
 * Application logger with structured output compatible with Google Cloud Logging.
 * 
 * In production:
 * - Outputs JSON with `severity` field for Cloud Logging auto-detection
 * - Includes service labels for log filtering
 * - Suppresses DEBUG-level logs to reduce noise
 * 
 * In development:
 * - Outputs human-readable prefixed messages
 * - All log levels are emitted
 *
 * @example
 * ```ts
 * logger.info('User signed in', { userId: 'abc123' });
 * logger.error('Failed to fetch data', error);
 * ```
 */
export const logger = {
  /** Debug-level logging — suppressed in production */
  debug: (message: string, data?: unknown): void => writeLog('DEBUG', message, data),

  /** Informational logging for normal operations */
  info: (message: string, data?: unknown): void => writeLog('INFO', message, data),

  /** Warning-level logging for recoverable issues */
  warn: (message: string, data?: unknown): void => writeLog('WARNING', message, data),

  /** Error-level logging for failures */
  error: (message: string, data?: unknown): void => writeLog('ERROR', message, data),
};
