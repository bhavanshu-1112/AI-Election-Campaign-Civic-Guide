import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyMyth } from '../../../../services/mythbuster.service';

const mythSchema = z.object({
  claim: z.string().min(5, 'Claim must be at least 5 characters').max(500, 'Claim must not exceed 500 characters'),
  userId: z.string().optional() // Could be anonymous depending on auth level
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsedBody = mythSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { claim } = parsedBody.data;
    const result = await verifyMyth(claim);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Myth API Error:", error);
    return NextResponse.json(
      { error: 'Failed to verify claim.' },
      { status: 500 }
    );
  }
}
