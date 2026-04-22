import { NextResponse } from 'next/server';
import { z } from 'zod';
import { answerFAQ } from '../../../../services/faq.service';
import { adminDb } from '../../../../lib/firebase-admin';
import * as admin from 'firebase-admin';

const faqSchema = z.object({
  sessionId: z.string().optional(),
  userId: z.string(),
  message: z.string().min(2, 'Message too short').max(500, 'Message too long'),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsedBody = faqSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, userId, message } = parsedBody.data;

    let history: {role: string, content: string}[] = [];
    const activeSessionId = sessionId || `session_${Date.now()}`;
    const sessionRef = adminDb.collection('faq_sessions').doc(activeSessionId);

    // Fetch previous history if session exists
    if (sessionId) {
      const sessionDoc = await sessionRef.get();
      if (sessionDoc.exists) {
        const data = sessionDoc.data();
        if (data && data.messages) {
            // Get last 10 messages max
            history = data.messages.slice(-10);
        }
      }
    }

    // Call service to get response
    const result = await answerFAQ(message, history);

    // Save back to DB
    const newMessageList = [
      ...history, 
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: result.answer, timestamp: new Date().toISOString() }
    ];

    await sessionRef.set({
      userId,
      messages: newMessageList,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return NextResponse.json({ ...result, sessionId: activeSessionId });

  } catch (error: any) {
    console.error("FAQ API Error:", error);
    return NextResponse.json(
      { error: 'Failed to process chat message.' },
      { status: 500 }
    );
  }
}
