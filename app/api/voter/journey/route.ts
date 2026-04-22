import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateVoterJourney } from '../../../../services/voter.service';
import { User } from '../../../../types';

// Strict input validation
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  location: z.object({
    state: z.string().min(1, 'State is required'),
    city: z.string().min(1, 'City is required'),
  }),
  age: z.coerce.number().min(18, 'Must be 18 or older to vote in India').max(120),
  isFirstTimeVoter: z.boolean(),
  role: z.enum(['voter', 'candidate']),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsedBody = userSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const result = await generateVoterJourney(parsedBody.data as User);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Voter Journey API Error:", error);
    return NextResponse.json(
      { error: 'Failed to generate voter journey.' },
      { status: 500 }
    );
  }
}
