/**
 * @fileoverview Myth Buster Service.
 * Fact-checks election-related claims using Google Gemini AI.
 * Returns structured verdicts with confidence scores and source references.
 */

import { geminiClient } from '@/lib/gemini';
import { MythVerificationResponse } from '@/types';
import { AIServiceError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { GEMINI_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Verifies an election-related claim using Gemini AI fact-checking.
 * Returns a structured verdict (TRUE/FALSE/PARTIALLY_TRUE/UNVERIFIED)
 * with explanation, confidence score, and reference sources.
 *
 * @param claim - The election-related claim to fact-check
 * @returns Structured myth verification response with verdict and confidence
 * @throws {AIServiceError} When Gemini API fails or returns empty response
 */
export const verifyMyth = async (claim: string): Promise<MythVerificationResponse> => {
  const prompt = `You are a neutral fact-checker for election-related claims in India.
  Analyze the claim below and return ONLY valid JSON in this exact structure:
  {
    "verdict": "TRUE" | "FALSE" | "PARTIALLY_TRUE" | "UNVERIFIED",
    "explanation": "string (max 200 words)",
    "confidence": number (0-100),
    "referenceSource": "string",
    "disclaimer": "This is AI-generated analysis. Always verify with official sources."
  }
  
  Claim: "${claim}"
  
  Guidelines:
  - Never express political bias.
  - If confidence < 50, set verdict to UNVERIFIED.
  - Do not make up sources. Return accurate and factual information. Ensure the response is perfectly formatted JSON without markdown wrappers.`;

  try {
    const response = await geminiClient.models.generateContent({
      model: GEMINI_CONFIG.MODEL,
      contents: prompt,
      config: {
        responseMimeType: GEMINI_CONFIG.RESPONSE_MIME_TYPE,
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
