/**
 * @fileoverview Myth Buster Service.
 * Fact-checks election-related claims using Google Gemini AI.
 * Returns structured verdicts with confidence scores and source references.
 */

import { geminiClient, geminiRequestConfig } from '@/lib/gemini';
import { MythVerificationResponse } from '@/types';
import { AIServiceError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { GEMINI_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

/** System instruction to ground the model as a neutral fact-checker */
const SYSTEM_INSTRUCTION = `You are a neutral fact-checker for election-related claims in India.
Never express political bias or favor any party/candidate.
If confidence is below 50, always set the verdict to UNVERIFIED.
Do not fabricate sources — only reference sources you are confident about.
Always include a disclaimer that this is AI-generated analysis.`;

/**
 * Sanitizes user-provided claim input to prevent prompt injection.
 * Strips control characters and dangerous patterns.
 *
 * @param input - Raw claim string from user
 * @returns Sanitized string safe for inclusion in prompts
 */
function sanitizeClaim(input: string): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Strip control characters
    .replace(/[<>{}]/g, '')            // Strip angle brackets and braces
    .trim();
}

/**
 * Verifies an election-related claim using Gemini AI fact-checking.
 * Returns a structured verdict (TRUE/FALSE/PARTIALLY_TRUE/UNVERIFIED)
 * with explanation, confidence score, and reference sources.
 * Applies safety settings and generation config for consistent, safe responses.
 *
 * @param claim - The election-related claim to fact-check
 * @returns Structured myth verification response with verdict and confidence
 * @throws {AIServiceError} When Gemini API fails or returns empty response
 */
export const verifyMyth = async (claim: string): Promise<MythVerificationResponse> => {
  const safeClaim = sanitizeClaim(claim);

  const prompt = `Analyze the claim below and return ONLY valid JSON in this exact structure:
  {
    "verdict": "TRUE" | "FALSE" | "PARTIALLY_TRUE" | "UNVERIFIED",
    "explanation": "string (max 200 words)",
    "confidence": number (0-100),
    "referenceSource": "string",
    "disclaimer": "This is AI-generated analysis. Always verify with official sources."
  }
  
  Claim: "${safeClaim}"
  
  Ensure the response is perfectly formatted JSON without markdown wrappers.`;

  try {
    const response = await geminiClient.models.generateContent({
      model: GEMINI_CONFIG.MODEL,
      contents: prompt,
      config: {
        ...geminiRequestConfig,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    if (!response.text) {
      throw new AIServiceError(ERROR_MESSAGES.GEMINI_NO_RESPONSE);
    }

    const parsedJson = JSON.parse(response.text) as MythVerificationResponse;
    logger.info('Myth verified', { verdict: parsedJson.verdict, confidence: parsedJson.confidence });
    return parsedJson;

  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    logger.error('Error verifying myth', error);
    throw new AIServiceError(ERROR_MESSAGES.MYTH_VERIFY_FAILED);
  }
};
