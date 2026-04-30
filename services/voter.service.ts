/**
 * @fileoverview Voter Journey Service.
 * Generates a personalized step-by-step election roadmap using Google Gemini AI.
 * Processes user demographics to create tailored voting guidance with deadlines and documents.
 */

import { geminiClient, geminiRequestConfig } from '@/lib/gemini';
import { User, VoterJourneyResponse } from '@/types';
import { AIServiceError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { GEMINI_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

/** System instruction to ground the model as a neutral election guide */
const SYSTEM_INSTRUCTION = `You are a neutral, factual election guide for India.
You only answer questions related to the Indian election process.
Never express political opinions or favor any party/candidate.
If unsure about a fact, say "Please verify with official sources."
Never fabricate deadlines, legal requirements, or official processes.`;

/**
 * Sanitizes user-provided string input to prevent prompt injection.
 * Strips control characters and limits length.
 *
 * @param input - Raw user input string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string safe for inclusion in prompts
 */
function sanitizeInput(input: string, maxLength: number = 200): string {
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Strip control characters
    .replace(/[<>{}]/g, '')            // Strip angle brackets and braces
    .trim()
    .slice(0, maxLength);
}

/**
 * Generates a personalized voter journey based on the user's profile.
 * Calls Google Gemini with structured JSON output mode, safety settings,
 * and generation config for reliable, safe parsing.
 *
 * @param userProfile - Partial user profile with demographics
 * @returns Structured journey response with steps, summary, and urgent actions
 * @throws {AIServiceError} When Gemini API fails or returns empty response
 */
export const generateVoterJourney = async (userProfile: Partial<User>): Promise<VoterJourneyResponse> => {
  const safeName = sanitizeInput(userProfile.name || '');
  const safeState = sanitizeInput(userProfile.location?.state || '');
  const safeCity = sanitizeInput(userProfile.location?.city || '');

  const prompt = `Based on the user profile provided, generate a personalized step-by-step voter journey. 
  
  User Profile:
  Name: ${safeName}
  State: ${safeState}
  City: ${safeCity}
  Age: ${userProfile.age}
  First Time Voter: ${userProfile.isFirstTimeVoter}
  Role: ${userProfile.role}

  Return ONLY a valid JSON object with this exact structure, nothing else:
  {
    "steps": [{ "order": number, "title": string, "description": string, "deadline": string, "documents": string[], "tips": string[] }],
    "summary": string,
    "urgentActions": string[]
  }
  Ensure the response is valid JSON format without markdown ticks outside the object.`;

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

    const parsedJson = JSON.parse(response.text) as VoterJourneyResponse;
    logger.info('Voter journey generated via Gemini', { stepsCount: parsedJson.steps?.length });
    return parsedJson;

  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    logger.error('Error generating voter journey', error);
    throw new AIServiceError(ERROR_MESSAGES.VOTER_JOURNEY_FAILED);
  }
};
