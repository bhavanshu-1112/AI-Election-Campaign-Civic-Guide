/**
 * @jest-environment node
 */

import { POST } from '../../app/api/voter/journey/route';

jest.mock('../../services/voter.service', () => ({
  generateVoterJourney: jest.fn(),
}));

jest.mock('../../lib/cache', () => ({
  generateCacheKey: jest.fn().mockReturnValue('mock-key'),
  getCachedResponse: jest.fn().mockResolvedValue(null),
  setCachedResponse: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../lib/rate-limiter', () => ({
  checkRateLimit: jest.fn().mockReturnValue({ allowed: true, remaining: 19 }),
  getClientIdentifier: jest.fn().mockReturnValue('test-ip'),
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

import { generateVoterJourney } from '../../services/voter.service';
import { getCachedResponse } from '../../lib/cache';
import { checkRateLimit } from '../../lib/rate-limiter';

describe('POST /api/voter/journey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    name: 'Rahul',
    location: { state: 'Maharashtra', city: 'Mumbai' },
    age: 21,
    isFirstTimeVoter: true,
    role: 'voter',
  };

  it('should return 200 with valid voter journey response', async () => {
    const mockResponse = { steps: [], summary: 'Test', urgentActions: [] };
    (generateVoterJourney as jest.Mock).mockResolvedValue(mockResponse);

    const req = new Request('http://localhost/api/voter/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.summary).toBe('Test');
  });

  it('should return 400 for invalid input', async () => {
    const req = new Request('http://localhost/api/voter/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 for underage user', async () => {
    const req = new Request('http://localhost/api/voter/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validPayload, age: 16 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return cached response when available', async () => {
    const cachedData = { steps: [], summary: 'Cached', urgentActions: [] };
    (getCachedResponse as jest.Mock).mockResolvedValue(cachedData);

    const req = new Request('http://localhost/api/voter/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.summary).toBe('Cached');
    expect(generateVoterJourney).not.toHaveBeenCalled();
  });

  it('should return 429 when rate limited', async () => {
    (checkRateLimit as jest.Mock).mockReturnValue({ allowed: false, remaining: 0 });

    const req = new Request('http://localhost/api/voter/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('should return 500 when service fails', async () => {
    (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true, remaining: 19 });
    (getCachedResponse as jest.Mock).mockResolvedValue(null);
    (generateVoterJourney as jest.Mock).mockRejectedValue(new Error('Gemini down'));

    const req = new Request('http://localhost/api/voter/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
