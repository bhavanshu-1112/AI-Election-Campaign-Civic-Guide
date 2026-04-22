/**
 * @jest-environment node
 */

import { checkRateLimit, getClientIdentifier } from '../../lib/rate-limiter';

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('Rate Limiter', () => {
  describe('checkRateLimit', () => {
    it('should allow first request from new identifier', () => {
      const result = checkRateLimit('new-user-1', 10, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should decrement remaining count with subsequent requests', () => {
      const id = 'counter-test-user';
      checkRateLimit(id, 10, 60000);
      checkRateLimit(id, 10, 60000);
      const result = checkRateLimit(id, 10, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(7);
    });

    it('should block when rate limit is exceeded', () => {
      const id = 'flood-user';
      for (let i = 0; i < 5; i++) {
        checkRateLimit(id, 5, 60000);
      }

      const result = checkRateLimit(id, 5, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const id = 'reset-user';
      // Use a very short window (1ms)
      checkRateLimit(id, 1, 1);

      // Wait a moment for the window to expire
      const start = Date.now();
      while (Date.now() - start < 5) {
        // Busy wait
      }

      const result = checkRateLimit(id, 1, 60000);
      expect(result.allowed).toBe(true);
    });
  });

  describe('getClientIdentifier', () => {
    it('should extract IP from X-Forwarded-For header', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      });
      const id = getClientIdentifier(req);
      expect(id).toBe('192.168.1.1');
    });

    it('should use X-Real-IP as fallback', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-real-ip': '10.0.0.5' },
      });
      const id = getClientIdentifier(req);
      expect(id).toBe('10.0.0.5');
    });

    it('should return anonymous when no IP headers present', () => {
      const req = new Request('http://localhost/api/test');
      const id = getClientIdentifier(req);
      expect(id).toBe('anonymous');
    });
  });
});
