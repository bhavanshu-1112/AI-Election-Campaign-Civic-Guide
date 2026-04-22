import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserChecklist, updateUserChecklist } from '../../../../services/checklist.service';

const checklistSchema = z.object({
    isRegistered: z.boolean().optional(),
    hasValidId: z.boolean().optional(),
    knowsPollingBooth: z.boolean().optional(),
    knowsVotingDate: z.boolean().optional(),
});

export async function GET(req: Request, context: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await context.params;
        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        const data = await getUserChecklist(userId);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Checklist GET API Error:", error);
        return NextResponse.json({ error: 'Failed to get checklist.' }, { status: 500 });
    }
}

export async function POST(req: Request, context: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await context.params;
        if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

        const rawBody = await req.json();
        const parsedBody = checklistSchema.safeParse(rawBody);

        if (!parsedBody.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsedBody.error.format() },
                { status: 400 }
            );
        }

        const data = await updateUserChecklist(userId, parsedBody.data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Checklist POST API Error:", error);
        return NextResponse.json({ error: 'Failed to update checklist.' }, { status: 500 });
    }
}
