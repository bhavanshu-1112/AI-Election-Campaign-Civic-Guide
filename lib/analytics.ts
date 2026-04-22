/**
 * @fileoverview Firebase Analytics event tracking utilities.
 * Provides type-safe wrappers for logging user interactions.
 * Only fires on the client side where the Analytics SDK is available.
 */

'use client';

import { getAnalytics, logEvent, isSupported, type Analytics } from 'firebase/analytics';
import { app } from './firebase';
import { ANALYTICS_EVENTS } from './constants';

let analyticsInstance: Analytics | null = null;

/**
 * Lazily initializes and returns the Firebase Analytics instance.
 * Returns null if analytics is not supported (e.g., SSR, ad-blockers).
 */
async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (analyticsInstance) return analyticsInstance;

  try {
    const supported = await isSupported();
    if (supported) {
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    }
  } catch {
    // Analytics not available — silently degrade
  }
  return null;
}

/**
 * Safely logs a Firebase Analytics event.
 * No-ops gracefully if analytics is unavailable.
 *
 * @param eventName - The event name to log
 * @param params - Optional event parameters
 */
async function trackEvent(eventName: string, params?: Record<string, unknown>): Promise<void> {
  try {
    const analytics = await getAnalyticsInstance();
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  } catch {
    // Non-critical — silently ignore analytics failures
  }
}

// ─── Typed Event Helpers ────────────────────────────────────────────────────

/** Track when a voter journey is generated */
export const trackJourneyGenerated = (state: string, isFirstTimeVoter: boolean): Promise<void> =>
  trackEvent(ANALYTICS_EVENTS.JOURNEY_GENERATED, { state, is_first_time_voter: isFirstTimeVoter });

/** Track when an FAQ question is asked */
export const trackFAQAsked = (questionLength: number): Promise<void> =>
  trackEvent(ANALYTICS_EVENTS.FAQ_ASKED, { question_length: questionLength });

/** Track when a myth is fact-checked */
export const trackMythChecked = (verdict: string, confidence: number): Promise<void> =>
  trackEvent(ANALYTICS_EVENTS.MYTH_CHECKED, { verdict, confidence });

/** Track when a checklist item is toggled */
export const trackChecklistToggled = (itemId: string, checked: boolean): Promise<void> =>
  trackEvent(ANALYTICS_EVENTS.CHECKLIST_ITEM_TOGGLED, { item_id: itemId, checked });

/** Track when the full checklist is completed */
export const trackChecklistCompleted = (): Promise<void> =>
  trackEvent(ANALYTICS_EVENTS.CHECKLIST_COMPLETED);

/** Track user sign-in */
export const trackUserSignedIn = (method: string): Promise<void> =>
  trackEvent(ANALYTICS_EVENTS.USER_SIGNED_IN, { method });

/** Track user sign-out */
export const trackUserSignedOut = (): Promise<void> =>
  trackEvent(ANALYTICS_EVENTS.USER_SIGNED_OUT);
