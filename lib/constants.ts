/**
 * @fileoverview Centralized application constants.
 * Keeps magic strings and configuration values in one place for maintainability.
 */

// ─── API Endpoints ───────────────────────────────────────────────────────────

export const API_ENDPOINTS = {
  VOTER_JOURNEY: '/api/voter/journey',
  FAQ_CHAT: '/api/faq/chat',
  MYTH_VERIFY: '/api/myths/verify',
  CHECKLIST: (userId: string) => `/api/checklist/${userId}`,
} as const;

// ─── Gemini Model Configuration ─────────────────────────────────────────────

export const GEMINI_CONFIG = {
  MODEL: 'gemini-2.5-flash',
  RESPONSE_MIME_TYPE: 'application/json' as const,
  /** Maximum number of chat history messages to send for context */
  MAX_HISTORY_MESSAGES: 10,
} as const;

// ─── Firestore Collection Names ─────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  ELECTION_STAGES: 'election_stages',
  USER_CHECKLISTS: 'user_checklists',
  FAQ_SESSIONS: 'faq_sessions',
  AI_CACHE: 'ai_cache',
  ANALYTICS: 'analytics',
} as const;

// ─── Cache Configuration ────────────────────────────────────────────────────

export const CACHE_CONFIG = {
  /** Time-to-live for cached AI responses in milliseconds (1 hour) */
  TTL_MS: 60 * 60 * 1000,
  /** Maximum number of cached entries to keep before cleanup */
  MAX_ENTRIES: 500,
} as const;

// ─── Rate Limiting ──────────────────────────────────────────────────────────

export const RATE_LIMIT_CONFIG = {
  /** Maximum requests per window */
  MAX_REQUESTS: 20,
  /** Window duration in milliseconds (1 minute) */
  WINDOW_MS: 60 * 1000,
} as const;

// ─── Error Messages ─────────────────────────────────────────────────────────

export const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input provided.',
  UNAUTHORIZED: 'Authentication required. Please sign in.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  GEMINI_NO_RESPONSE: 'No response received from AI service.',
  VOTER_JOURNEY_FAILED: 'Failed to generate personalized voter journey. Please try again.',
  FAQ_FAILED: 'Failed to process question. Please try again.',
  MYTH_VERIFY_FAILED: 'Failed to verify claim. Please try again.',
  CHECKLIST_FETCH_FAILED: 'Failed to fetch checklist data.',
  CHECKLIST_UPDATE_FAILED: 'Failed to update checklist.',
  TIMELINE_FETCH_FAILED: 'Failed to fetch timeline data.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
  CACHE_ERROR: 'Cache operation failed.',
} as const;

// ─── Analytics Event Names ──────────────────────────────────────────────────

export const ANALYTICS_EVENTS = {
  JOURNEY_GENERATED: 'journey_generated',
  FAQ_ASKED: 'faq_asked',
  MYTH_CHECKED: 'myth_checked',
  CHECKLIST_ITEM_TOGGLED: 'checklist_item_toggled',
  CHECKLIST_COMPLETED: 'checklist_completed',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  PAGE_VIEW: 'page_view',
} as const;

// ─── Validation Limits ──────────────────────────────────────────────────────

export const VALIDATION = {
  NAME_MAX_LENGTH: 100,
  MESSAGE_MIN_LENGTH: 2,
  MESSAGE_MAX_LENGTH: 500,
  CLAIM_MIN_LENGTH: 5,
  CLAIM_MAX_LENGTH: 500,
  MIN_VOTING_AGE: 18,
  MAX_AGE: 120,
} as const;
