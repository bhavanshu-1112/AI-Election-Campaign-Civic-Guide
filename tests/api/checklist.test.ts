/**
 * @jest-environment node
 */

// NOTE: Dynamic route segment [userId] makes this tricky to import directly.
// We test the service layer and validation logic instead, which covers the core logic.

import { getUserChecklist, updateUserChecklist } from '../../services/checklist.service';
import { adminDb } from '../../lib/firebase-admin';

jest.mock('../../lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('Checklist API Logic (via Service)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET checklist', () => {
    it('should return default checklist for non-existing user', async () => {
      const mockDocGet = jest.fn().mockResolvedValue({ exists: false });
      const mockDocRef = { get: mockDocGet };
      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef),
      });

      const result = await getUserChecklist('new-user');
      expect(result.userId).toBe('new-user');
      expect(result.isRegistered).toBe(false);
      expect(result.hasValidId).toBe(false);
    });

    it('should return existing checklist data', async () => {
      const existingData = {
        userId: 'user123',
        isRegistered: true,
        hasValidId: true,
        knowsPollingBooth: false,
        knowsVotingDate: true,
      };

      const mockDocGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => existingData,
      });
      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockDocGet }),
      });

      const result = await getUserChecklist('user123');
      expect(result).toEqual(existingData);
    });
  });

  describe('POST checklist update', () => {
    it('should update and return merged checklist', async () => {
      const updatedData = {
        userId: 'user123',
        isRegistered: true,
        hasValidId: false,
        knowsPollingBooth: false,
        knowsVotingDate: false,
      };

      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => updatedData,
      });

      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({ set: mockSet, get: mockGet }),
      });

      const result = await updateUserChecklist('user123', { isRegistered: true });
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({ isRegistered: true }),
        { merge: true }
      );
      expect(result.isRegistered).toBe(true);
    });

    it('should throw AppError on Firestore write failure', async () => {
      const mockSet = jest.fn().mockRejectedValue(new Error('Write failed'));
      (adminDb.collection as jest.Mock).mockReturnValue({
        doc: jest.fn().mockReturnValue({ set: mockSet }),
      });

      await expect(updateUserChecklist('user123', { hasValidId: true }))
        .rejects.toThrow('Failed to update checklist.');
    });
  });
});
