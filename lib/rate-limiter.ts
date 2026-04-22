/**
 * @fileoverview In-memory rate limiter for API route protection.
 * Uses a sliding window counter pattern to throttle excessive requests.
 * Prevents abuse of AI-powered endpoints that consume expensive API quota.
 */

import { RATE_LIMIT_CONFIG } from './constants';
import { logger } from './logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/** In-memory store for rate limit counters, keyed by identifier (IP or userId) */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Checks whether a given identifier has exceeded the rate limit.
 * Automatically resets the counter when the time window expires.
 *
 * @param identifier - Unique key to track (e.g., IP address or user ID)
 * @param maxRequests - Maximum allowed requests per window (defaults to config)
 * @param windowMs - Time window in milliseconds (defaults to config)
 * @returns Object with `allowed` boolean and `remaining` request count
 *
 * @example
 * ```ts
 * const result = checkRateLimit('192.168.1.1');
 * if (!result.allowed) {
 *   return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = RATE_LIMIT_CONFIG.MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_CONFIG.WINDOW_MS
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No existing entry or window expired — create fresh
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  // Within window — increment
  entry.count++;

  if (entry.count > maxRequests) {
    logger.warn(`Rate limit exceeded for: ${identifier} (${entry.count}/${maxRequests})`);
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Extracts a client identifier from a Request object for rate limiting.
 * Uses X-Forwarded-For header (common behind proxies) or falls back to a default.
 *
 * @param req - The incoming Request object
 * @returns A string identifier for the client
 */
export function getClientIdentifier(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  // Fallback — in serverless environments, all requests may share a single IP
  return req.headers.get('x-real-ip') || 'anonymous';
}

/**
 * Periodic cleanup of stale rate limit entries to prevent memory leaks.
 * Called automatically every 5 minutes.
 */
function cleanupStaleEntries(): void {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    logger.debug(`Rate limiter cleanup: removed ${cleaned} stale entries`);
  }
}

// Auto-cleanup interval (every 5 minutes)
// .unref() prevents the timer from keeping the process alive (important for Jest and graceful shutdown)
if (typeof setInterval !== 'undefined') {
  const cleanupInterval = setInterval(cleanupStaleEntries, 5 * 60 * 1000);
  if (typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref();
  }
}
