/**
 * @fileoverview Voter Journey Service.
 * Generates a personalized step-by-step election roadmap using Google Gemini AI.
 * Processes user demographics to create tailored voting guidance with deadlines and documents.
 */

import { geminiClient } from '@/lib/gemini';
import { User, VoterJourneyResponse } from '@/types';
import { AIServiceError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { GEMINI_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Generates a personalized voter journey based on the user's profile.
 * Calls Google Gemini with structured JSON output mode for reliable parsing.
 *
 * @param userProfile - Partial user profile with demographics
 * @returns Structured journey response with steps, summary, and urgent actions
 * @throws {AIServiceError} When Gemini API fails or returns empty response
 */
export const generateVoterJourney = async (userProfile: Partial<User>): Promise<VoterJourneyResponse> => {
  const prompt = `You are a neutral, factual election guide for India. Based on the user 
  profile provided, generate a personalized step-by-step voter journey. 
  
  User Profile:
  Name: ${userProfile.name}
  State: ${userProfile.location?.state}
  City: ${userProfile.location?.city}
  Age: ${userProfile.age}
  First Time Voter: ${userProfile.isFirstTimeVoter}
  Role: ${userProfile.role}

  Return ONLY a valid JSON object with this exact structure, nothing else:
  {
    "steps": [{ "order": number, "title": string, "description": string, "deadline": string, "documents": string[], "tips": string[] }],
    "summary": string,
    "urgentActions": string[]
  }
  Do not include any political opinions. If unsure, say 'Please verify 
  with official sources.' Never make up deadlines or legal requirements. Ensure the response is valid JSON format without markdown ticks outside the object.`;

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

    const parsedJson = JSON.parse(response.text) as VoterJourneyResponse;
    logger.info('Voter journey generated via Gemini', { stepsCount: parsedJson.steps?.length });
    return parsedJson;

  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    logger.error('Error generating voter journey', error);
    throw new AIServiceError(ERROR_MESSAGES.VOTER_JOURNEY_FAILED);
  }
};
