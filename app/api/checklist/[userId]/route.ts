/**
 * @fileoverview User Checklist API route.
 * Manages voter readiness checklist state in Firebase Firestore.
 * Supports both fetching and updating checklist items.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserChecklist, updateUserChecklist } from '@/services/checklist.service';
import { handleApiError, ValidationError, RateLimitError } from '@/lib/errors';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants';

/** Zod schema for checklist update validation */
const checklistSchema = z.object({
    isRegistered: z.boolean().optional(),
    hasValidId: z.boolean().optional(),
    knowsPollingBooth: z.boolean().optional(),
    knowsVotingDate: z.boolean().optional(),
});

/**
 * GET /api/checklist/[userId]
 * Retrieves the current checklist state for a user.
 */
export async function GET(req: Request, context: { params: Promise<{ userId: string }> }): Promise<NextResponse> {
    try {
        const { userId } = await context.params;
        if (!userId) {
            throw new ValidationError('User ID is required');
        }

        const data = await getUserChecklist(userId);
        return NextResponse.json(data);

    } catch (error: unknown) {
        return handleApiError(error, 'Checklist GET API');
    }
}

/**
 * POST /api/checklist/[userId]
 * Updates one or more checklist items for a user.
 */
export async function POST(req: Request, context: { params: Promise<{ userId: string }> }): Promise<NextResponse> {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(req);
        const rateCheck = checkRateLimit(clientId);
        if (!rateCheck.allowed) {
            throw new RateLimitError(ERROR_MESSAGES.RATE_LIMITED);
        }

        const { userId } = await context.params;
        if (!userId) {
            throw new ValidationError('User ID is required');
        }

        const rawBody = await req.json();
        const parsedBody = checklistSchema.safeParse(rawBody);

        if (!parsedBody.success) {
            throw new ValidationError(ERROR_MESSAGES.INVALID_INPUT, parsedBody.error.format());
        }

        const data = await updateUserChecklist(userId, parsedBody.data);
        logger.info('Checklist updated', { userId });

        return NextResponse.json(data);

    } catch (error: unknown) {
        return handleApiError(error, 'Checklist POST API');
    }
}
