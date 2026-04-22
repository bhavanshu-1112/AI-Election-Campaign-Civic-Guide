/**
 * @fileoverview Voter Journey API route.
 * Generates a personalized election roadmap using Google Gemini AI.
 * Protected by rate limiting and enhanced with response caching.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateVoterJourney } from '@/services/voter.service';
import { User } from '@/types';
import { handleApiError, ValidationError, RateLimitError } from '@/lib/errors';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { getCachedResponse, setCachedResponse, generateCacheKey } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { VALIDATION, ERROR_MESSAGES } from '@/lib/constants';
import { VoterJourneyResponse } from '@/types';

/** Zod schema for strict input validation of voter profile data */
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(VALIDATION.NAME_MAX_LENGTH),
  location: z.object({
    state: z.string().min(1, 'State is required'),
    city: z.string().min(1, 'City is required'),
  }),
  age: z.coerce.number().min(VALIDATION.MIN_VOTING_AGE, 'Must be 18 or older to vote in India').max(VALIDATION.MAX_AGE),
  isFirstTimeVoter: z.boolean(),
  role: z.enum(['voter', 'candidate']),
});

/**
 * POST /api/voter/journey
 * Accepts a user profile and returns a personalized election journey.
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
    const parsedBody = userSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT, parsedBody.error.format());
    }

    // Check cache
    const cacheKey = generateCacheKey(`voter-journey-${JSON.stringify(parsedBody.data)}`);
    const cached = await getCachedResponse<VoterJourneyResponse>(cacheKey);
    if (cached) {
      logger.info('Returning cached voter journey response');
      return NextResponse.json(cached);
    }

    // Generate via Gemini
    const result = await generateVoterJourney(parsedBody.data as User);

    // Cache the result
    await setCachedResponse(cacheKey, JSON.stringify(parsedBody.data), result);

    logger.info('Voter journey generated successfully', { state: parsedBody.data.location.state });
    return NextResponse.json(result);

  } catch (error: unknown) {
    return handleApiError(error, 'Voter Journey API');
  }
}
