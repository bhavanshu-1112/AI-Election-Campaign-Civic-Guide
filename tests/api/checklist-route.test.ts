/**
 * @jest-environment node
 */

import { GET, POST } from '../../app/api/checklist/[userId]/route';

jest.mock('../../services/checklist.service', () => ({
  getUserChecklist: jest.fn(),
  updateUserChecklist: jest.fn(),
}));

jest.mock('../../lib/cache', () => ({
  generateCacheKey: jest.fn().mockReturnValue('mock-checklist-key'),
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

import { getUserChecklist, updateUserChecklist } from '../../services/checklist.service';
import { getCachedResponse } from '../../lib/cache';
import { checkRateLimit } from '../../lib/rate-limiter';

function makeContext(userId: string) {
  return { params: Promise.resolve({ userId }) };
}

describe('Checklist Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/checklist/[userId]', () => {
    it('should return 200 with checklist data', async () => {
      const mockData = {
        userId: 'user1',
        isRegistered: true,
        hasValidId: false,
        knowsPollingBooth: false,
        knowsVotingDate: false,
      };
      (getUserChecklist as jest.Mock).mockResolvedValue(mockData);

      const req = new Request('http://localhost/api/checklist/user1');
      const res = await GET(req, makeContext('user1'));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.userId).toBe('user1');
      expect(json.isRegistered).toBe(true);
    });

    it('should return cached response if available', async () => {
      const cachedData = {
        userId: 'user1',
        isRegistered: true,
        hasValidId: true,
        knowsPollingBooth: true,
        knowsVotingDate: true,
      };
      (getCachedResponse as jest.Mock).mockResolvedValue(cachedData);

      const req = new Request('http://localhost/api/checklist/user1');
      const res = await GET(req, makeContext('user1'));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.isRegistered).toBe(true);
      expect(getUserChecklist).not.toHaveBeenCalled();
    });

    it('should return 400 for empty userId', async () => {
      const req = new Request('http://localhost/api/checklist/');
      const res = await GET(req, makeContext(''));
      expect(res.status).toBe(400);
    });

    it('should return 500 on service error', async () => {
      (getCachedResponse as jest.Mock).mockResolvedValue(null);
      (getUserChecklist as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = new Request('http://localhost/api/checklist/user1');
      const res = await GET(req, makeContext('user1'));
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/checklist/[userId]', () => {
    it('should return 200 with updated checklist', async () => {
      const updatedData = {
        userId: 'user1',
        isRegistered: true,
        hasValidId: false,
        knowsPollingBooth: false,
        knowsVotingDate: false,
      };
      (updateUserChecklist as jest.Mock).mockResolvedValue(updatedData);

      const req = new Request('http://localhost/api/checklist/user1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRegistered: true }),
      });
      const res = await POST(req, makeContext('user1'));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.isRegistered).toBe(true);
    });

    it('should return 400 for invalid body', async () => {
      const req = new Request('http://localhost/api/checklist/user1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRegistered: 'not-a-boolean' }),
      });
      const res = await POST(req, makeContext('user1'));
      expect(res.status).toBe(400);
    });

    it('should return 400 for empty userId', async () => {
      const req = new Request('http://localhost/api/checklist/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRegistered: true }),
      });
      const res = await POST(req, makeContext(''));
      expect(res.status).toBe(400);
    });

    it('should return 429 when rate limited', async () => {
      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: false, remaining: 0 });

      const req = new Request('http://localhost/api/checklist/user1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRegistered: true }),
      });
      const res = await POST(req, makeContext('user1'));
      expect(res.status).toBe(429);
    });

    it('should return 500 on service error', async () => {
      (checkRateLimit as jest.Mock).mockReturnValue({ allowed: true, remaining: 19 });
      (updateUserChecklist as jest.Mock).mockRejectedValue(new Error('DB error'));

      const req = new Request('http://localhost/api/checklist/user1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasValidId: true }),
      });
      const res = await POST(req, makeContext('user1'));
      expect(res.status).toBe(500);
    });
  });
});
