/**
 * @jest-environment node
 */

import { generateCacheKey, getCachedResponse, setCachedResponse } from '../../lib/cache';
import { adminDb } from '../../lib/firebase-admin';

jest.mock('../../lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('Cache Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCacheKey', () => {
    it('should generate consistent hash for the same input', () => {
      const key1 = generateCacheKey('test prompt');
      const key2 = generateCacheKey('test prompt');
      expect(key1).toBe(key2);
    });

    it('should generate different hashes for different inputs', () => {
      const key1 = generateCacheKey('prompt A');
      const key2 = generateCacheKey('prompt B');
      expect(key1).not.toBe(key2);
    });

    it('should be case-insensitive', () => {
      const key1 = generateCacheKey('Test Prompt');
      const key2 = generateCacheKey('test prompt');
      expect(key1).toBe(key2);
    });

    it('should trim whitespace', () => {
      const key1 = generateCacheKey('  test  ');
      const key2 = generateCacheKey('test');
      expect(key1).toBe(key2);
    });
  });

  describe('getCachedResponse', () => {
    it('should return null on cache miss', async () => {
      const mockGet = jest.fn().mockResolvedValue({ exists: false });
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
      (adminDb.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

      const result = await getCachedResponse('nonexistent-key');
      expect(result).toBeNull();
    });

    it('should return cached data when valid', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const mockData = { response: { answer: 'cached answer' }, expiresAt: futureDate };
      
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockData,
      });
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
      (adminDb.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

      const result = await getCachedResponse('valid-key');
      expect(result).toEqual({ answer: 'cached answer' });
    });

    it('should return null and cleanup when cached entry has expired', async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      const mockDelete = jest.fn().mockResolvedValue(undefined);
      const mockData = { response: { answer: 'stale' }, expiresAt: pastDate };

      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockData,
      });
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet, delete: mockDelete });
      (adminDb.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

      const result = await getCachedResponse('expired-key');
      expect(result).toBeNull();
    });

    it('should return null on Firestore errors without throwing', async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error('Firestore error'));
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
      (adminDb.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

      const result = await getCachedResponse('error-key');
      expect(result).toBeNull();
    });
  });

  describe('setCachedResponse', () => {
    it('should write cache entry to Firestore', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({ set: mockSet });
      (adminDb.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

      await setCachedResponse('key123', 'test query', { answer: 'test' });

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test query',
          response: { answer: 'test' },
          createdAt: expect.any(String),
          expiresAt: expect.any(String),
        })
      );
    });

    it('should not throw on Firestore write failures', async () => {
      const mockSet = jest.fn().mockRejectedValue(new Error('Write failed'));
      const mockDoc = jest.fn().mockReturnValue({ set: mockSet });
      (adminDb.collection as jest.Mock).mockReturnValue({ doc: mockDoc });

      await expect(
        setCachedResponse('key123', 'query', { answer: 'test' })
      ).resolves.not.toThrow();
    });
  });
});
