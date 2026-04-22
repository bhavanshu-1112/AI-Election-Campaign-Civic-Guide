/**
 * @fileoverview Google Gemini AI client initialization.
 * Provides a singleton client instance for all Gemini API calls.
 */

import { GoogleGenAI } from '@google/genai';

/** Gemini AI client configured with server-side API key */
export const geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
});
