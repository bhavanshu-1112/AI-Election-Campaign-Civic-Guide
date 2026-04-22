/**
 * @fileoverview AI response caching layer using Firebase Firestore.
 * Caches Gemini API responses to reduce latency, cost, and API quota usage.
 * Uses SHA-256 hash of the prompt as the cache key with configurable TTL.
 */

import { adminDb } from './firebase-admin';
import { COLLECTIONS, CACHE_CONFIG, ERROR_MESSAGES } from './constants';
import { logger } from './logger';
import crypto from 'crypto';

/**
 * Generates a deterministic SHA-256 hash from the input string.
 * Used as a Firestore document ID for cache entries.
 *
 * @param input - The prompt or query string to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function generateCacheKey(input: string): string {
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex');
}

/**
 * Attempts to retrieve a cached AI response from Firestore.
 * Returns null if the entry doesn't exist or has expired.
 *
 * @typeParam T - The expected shape of the cached response
 * @param cacheKey - The SHA-256 hash cache key
 * @returns The cached response data, or null if miss/expired
 */
export async function getCachedResponse<T>(cacheKey: string): Promise<T | null> {
  try {
    const docRef = adminDb.collection(COLLECTIONS.AI_CACHE).doc(cacheKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.debug(`Cache MISS: ${cacheKey.substring(0, 12)}...`);
      return null;
    }

    const data = doc.data();
    if (!data) return null;

    // Check TTL expiration
    const expiresAt = new Date(data.expiresAt).getTime();
    if (Date.now() > expiresAt) {
      logger.debug(`Cache EXPIRED: ${cacheKey.substring(0, 12)}...`);
      // Async cleanup — don't await
      docRef.delete().catch(() => {});
      return null;
    }

    logger.info(`Cache HIT: ${cacheKey.substring(0, 12)}...`);
    return data.response as T;
  } catch (error) {
    logger.warn(ERROR_MESSAGES.CACHE_ERROR, error);
    return null;
  }
}

/**
 * Stores an AI response in the Firestore cache with TTL.
 *
 * @typeParam T - The shape of the response data
 * @param cacheKey - The SHA-256 hash cache key
 * @param query - The original query string (stored for debugging)
 * @param response - The response data to cache
 */
export async function setCachedResponse<T>(
  cacheKey: string,
  query: string,
  response: T
): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_CONFIG.TTL_MS);

    await adminDb.collection(COLLECTIONS.AI_CACHE).doc(cacheKey).set({
      query,
      response,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    logger.debug(`Cache SET: ${cacheKey.substring(0, 12)}... (expires ${expiresAt.toISOString()})`);
  } catch (error) {
    // Cache write failure is non-critical — log and continue
    logger.warn(ERROR_MESSAGES.CACHE_ERROR, error);
  }
}
