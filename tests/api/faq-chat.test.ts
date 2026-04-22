/**
 * @jest-environment node
 */

import { POST } from '../../app/api/faq/chat/route';

jest.mock('../../services/faq.service', () => ({
  answerFAQ: jest.fn(),
}));

jest.mock('../../lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn().mockReturnValue('mock-timestamp'),
    },
  },
}));

jest.mock('../../lib/rate-limiter', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 19 }),
  getClientIdentifier: jest.fn().mockReturnValue('test-ip'),
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

import { answerFAQ } from '../../services/faq.service';
import { checkRateLimit } from '../../lib/rate-limiter';

describe('POST /api/faq/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with FAQ response', async () => {
    const mockResponse = {
      answer: 'You need a voter ID.',
      confidence: 90,
      sources: ['ECI'],
      disclaimer: '',
      isElectionRelated: true,
    };
    (answerFAQ as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request('http://localhost/api/faq/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'guest', message: 'What ID to vote?' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.answer).toBe('You need a voter ID.');
    expect(json.sessionId).toBeDefined();
  });

  it('should return 400 for empty message', async () => {
    const req = new Request('http://localhost/api/faq/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'guest', message: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 for missing userId', async () => {
    const req = new Request('http://localhost/api/faq/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test question' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 429 when rate limited', async () => {
    (checkRateLimit as jest.Mock).mockReturnValue({ allowed: false, remaining: 0 });

    const req = new Request('http://localhost/api/faq/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'guest', message: 'test question' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});
