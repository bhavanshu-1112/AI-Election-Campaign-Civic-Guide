/**
 * @fileoverview FAQ Chat API route.
 * Processes election-related questions using Google Gemini with session memory.
 * Stores conversation history in Firebase Firestore for context continuity.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { answerFAQ } from '@/services/faq.service';
import { adminDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { handleApiError, ValidationError, RateLimitError } from '@/lib/errors';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { VALIDATION, ERROR_MESSAGES, COLLECTIONS, GEMINI_CONFIG } from '@/lib/constants';

/** Zod schema for FAQ chat request validation */
const faqSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string(),
  message: z.string().min(VALIDATION.MESSAGE_MIN_LENGTH, 'Message too short').max(VALIDATION.MESSAGE_MAX_LENGTH, 'Message too long'),
});

/**
 * POST /api/faq/chat
 * Accepts a user message and returns an AI-generated answer with confidence metadata.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateCheck = checkRateLimit(clientId);
    if (!rateCheck.allowed) {
      throw new RateLimitError(ERROR_MESSAGES.RATE_LIMITED);
    }

    // Input validation
    const rawBody = await req.json();
    const parsedBody = faqSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT, parsedBody.error.format());
    }

    const { sessionId, userId, message } = parsedBody.data;

    let history: { role: string; content: string }[] = [];
    const activeSessionId = sessionId || `session_${Date.now()}`;
    const sessionRef = adminDb.collection(COLLECTIONS.FAQ_SESSIONS).doc(activeSessionId);

    // Fetch previous history if session exists
    if (sessionId) {
      const sessionDoc = await sessionRef.get();
      if (sessionDoc.exists) {
        const data = sessionDoc.data();
        if (data?.messages) {
          history = data.messages.slice(-GEMINI_CONFIG.MAX_HISTORY_MESSAGES);
        }
      }
    }

    // Call Gemini service
    const result = await answerFAQ(message, history);

    // Persist conversation to Firestore
    const newMessageList = [
      ...history,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: result.answer, timestamp: new Date().toISOString() },
    ];

    await sessionRef.set(
      {
        userId,
        messages: newMessageList,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    logger.info('FAQ answered successfully', { sessionId: activeSessionId, confidence: result.confidence });

    return NextResponse.json({ ...result, sessionId: activeSessionId });

  } catch (error: unknown) {
    return handleApiError(error, 'FAQ Chat API');
  }
}
