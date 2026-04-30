/**
 * @fileoverview Google Gemini AI client initialization and shared configuration.
 * Provides a singleton client instance and reusable config objects for all Gemini API calls.
 * Safety settings and generation config are centralized here for consistency.
 */

import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import {
  GEMINI_CONFIG,
  GEMINI_SAFETY_SETTINGS,
  GEMINI_GENERATION_CONFIG,
} from './constants';

/** Gemini AI client configured with server-side API key */
export const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

/**
 * Shared Gemini request configuration applied to all API calls.
 * Includes safety settings, generation parameters, and response format.
 */
export const geminiRequestConfig = {
  safetySettings: GEMINI_SAFETY_SETTINGS.map(s => ({
    category: s.category as HarmCategory,
    threshold: s.threshold as HarmBlockThreshold,
  })),
  responseMimeType: GEMINI_CONFIG.RESPONSE_MIME_TYPE,
  temperature: GEMINI_GENERATION_CONFIG.temperature,
  topP: GEMINI_GENERATION_CONFIG.topP,
  topK: GEMINI_GENERATION_CONFIG.topK,
  maxOutputTokens: GEMINI_GENERATION_CONFIG.maxOutputTokens,
};

