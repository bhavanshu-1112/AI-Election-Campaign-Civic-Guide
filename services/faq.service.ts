/**
 * @fileoverview FAQ Service.
 * Provides conversational election Q&A using Google Gemini AI with chat session support.
 * Handles multi-turn conversations with history context for coherent follow-ups.
 */

import { geminiClient, geminiRequestConfig } from '@/lib/gemini';
import { FAQResponse } from '@/types';
import { AIServiceError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { GEMINI_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

/** System instruction for FAQ chat sessions */
const SYSTEM_INSTRUCTION = `You are a helpful, unbiased election information assistant for India.
Answer only election-related questions. For each response provide ONLY a valid JSON object matching this structure:
{
  "answer": "string",
  "confidence": number (0-100),
  "sources": ["string"],
  "disclaimer": "string",
  "isElectionRelated": boolean
}
If confidence < 60, explicitly say 'Please verify with official sources.' in the disclaimer.
If the question is not election-related, set isElectionRelated: false and politely redirect the user in the answer field.
Never generate political opinions or favor any party/candidate. Return pure JSON without markdown tags.`;

/**
 * Answers an election-related FAQ question using Gemini with conversation history.
 * Uses structured JSON output mode with safety settings and generation config
 * to ensure reliable, safe parsing of responses.
 *
 * @param message - The user's question
 * @param history - Previous conversation messages for context continuity
 * @returns Structured FAQ response with answer, confidence, sources, and disclaimer
 * @throws {AIServiceError} When Gemini API fails or returns empty response
 */
export const answerFAQ = async (
  message: string,
  history: Array<{ role: string; content: string }> = []
): Promise<FAQResponse> => {
  // Format history for Gemini structured messages
  const formattedHistory = history.map((h) => ({
    role: h.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: h.content }],
  }));

  try {
    const chat = geminiClient.chats.create({
      model: GEMINI_CONFIG.MODEL,
      config: {
        ...geminiRequestConfig,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message });

    if (!response.text) {
      throw new AIServiceError(ERROR_MESSAGES.GEMINI_NO_RESPONSE);
    }

    const parsedJson = JSON.parse(response.text) as FAQResponse;
    logger.info('FAQ answered', { confidence: parsedJson.confidence, isElectionRelated: parsedJson.isElectionRelated });
    return parsedJson;

  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    logger.error('Error answering FAQ', error);
    throw new AIServiceError(ERROR_MESSAGES.FAQ_FAILED);
  }
};
