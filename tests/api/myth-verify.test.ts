/**
 * @jest-environment node
 */

import { POST } from '../../app/api/myths/verify/route';

jest.mock('../../services/mythbuster.service', () => ({
  verifyMyth: jest.fn(),
}));

jest.mock('../../lib/cache', () => ({
  generateCacheKey: jest.fn().mockReturnValue('mock-myth-key'),
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

import { verifyMyth } from '../../services/mythbuster.service';
import { getCachedResponse } from '../../lib/cache';
import { checkRateLimit } from '../../lib/rate-limiter';

describe('POST /api/myths/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with myth verification', async () => {
    const mockResult = {
      verdict: 'FALSE',
      explanation: 'Online voting is not available.',
      confidence: 95,
      referenceSource: 'ECI',
      disclaimer: 'AI analysis. Verify with official sources.',
    };
    (verifyMyth as jest.Mock).mockResolvedValue(mockResult);

    const req = new Request('http://localhost/api/myths/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: 'You can vote online in India' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.verdict).toBe('FALSE');
    expect(json.confidence).toBe(95);
  });

  it('should return 400 for claim that is too short', async () => {
    const req = new Request('http://localhost/api/myths/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: 'Hi' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return cached result when available', async () => {
    const cached = { verdict: 'TRUE', explanation: 'Cached', confidence: 99, referenceSource: '', disclaimer: '' };
    (getCachedResponse as jest.Mock).mockResolvedValue(cached);

    const req = new Request('http://localhost/api/myths/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: 'Some long claim here' }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(json.verdict).toBe('TRUE');
    expect(verifyMyth).not.toHaveBeenCalled();
  });

  it('should return 429 when rate limited', async () => {
    (checkRateLimit as jest.Mock).mockReturnValue({ allowed: false, remaining: 0 });

    const req = new Request('http://localhost/api/myths/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: 'Some claim about voting' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it('should return 500 when service throws', async () => {
    (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true, remaining: 19 });
    (getCachedResponse as jest.Mock).mockResolvedValue(null);
    (verifyMyth as jest.Mock).mockRejectedValue(new Error('Service failed'));

    const req = new Request('http://localhost/api/myths/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: 'A valid claim to verify' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
