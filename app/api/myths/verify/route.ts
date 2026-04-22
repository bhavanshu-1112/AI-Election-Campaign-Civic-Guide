/**
 * @fileoverview Myth Verification API route.
 * Fact-checks election-related claims using Google Gemini AI.
 * Protected by rate limiting and enhanced with response caching.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyMyth } from '@/services/mythbuster.service';
import { handleApiError, ValidationError, RateLimitError } from '@/lib/errors';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { getCachedResponse, setCachedResponse, generateCacheKey } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { VALIDATION, ERROR_MESSAGES } from '@/lib/constants';
import { MythVerificationResponse } from '@/types';

/** Zod schema for myth verification request validation */
const mythSchema = z.object({
  claim: z.string().min(VALIDATION.CLAIM_MIN_LENGTH, 'Claim must be at least 5 characters').max(VALIDATION.CLAIM_MAX_LENGTH, 'Claim must not exceed 500 characters'),
  userId: z.string().optional(),
});

/**
 * POST /api/myths/verify
 * Accepts an election-related claim and returns a fact-check verdict.
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
    const parsedBody = mythSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT, parsedBody.error.format());
    }

    const { claim } = parsedBody.data;

    // Check cache — myth verdicts are highly cacheable
    const cacheKey = generateCacheKey(`myth-verify-${claim}`);
    const cached = await getCachedResponse<MythVerificationResponse>(cacheKey);
    if (cached) {
      logger.info('Returning cached myth verification');
      return NextResponse.json(cached);
    }

    // Verify via Gemini
    const result = await verifyMyth(claim);

    // Cache the verdict
    await setCachedResponse(cacheKey, claim, result);

    logger.info('Myth verified successfully', { verdict: result.verdict, confidence: result.confidence });

    return NextResponse.json(result);

  } catch (error: unknown) {
    return handleApiError(error, 'Myth Verify API');
  }
}
