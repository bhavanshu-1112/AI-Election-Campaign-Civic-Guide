/**
 * @jest-environment node
 */

import { getUserChecklist, updateUserChecklist } from '../../services/checklist.service';
import { adminDb } from '../../lib/firebase-admin';

// Mock Firebase Admin
jest.mock('../../lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('Checklist Service', () => {
    
  const mockDocId = 'user123';
  
  beforeEach(() => {
     jest.clearAllMocks();
  });

  it('should return default checklist if user doc does not exist', async () => {
      const mockDocGet = jest.fn().mockResolvedValue({
         exists: false
      });

      const mockDocRef = { get: mockDocGet };
      (adminDb.collection as jest.Mock).mockReturnValue({
         doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const result = await getUserChecklist(mockDocId);
      
      expect(result).toEqual({
        userId: mockDocId,
        isRegistered: false,
        hasValidId: false,
        knowsPollingBooth: false,
        knowsVotingDate: false,
      });
  });

  it('should return fetched checklist if exists', async () => {
    const existingData = {
        userId: mockDocId,
        isRegistered: true,
        hasValidId: true,
        knowsPollingBooth: false,
        knowsVotingDate: false,
    };

    const mockDocGet = jest.fn().mockResolvedValue({
       exists: true,
       data: () => existingData
    });

    const mockDocRef = { get: mockDocGet };
    (adminDb.collection as jest.Mock).mockReturnValue({
       doc: jest.fn().mockReturnValue(mockDocRef)
    });

    const result = await getUserChecklist(mockDocId);
    
    expect(result).toEqual(existingData);
  });

  it('should throw AppError on Firestore read failure', async () => {
    const mockDocGet = jest.fn().mockRejectedValue(new Error('Firestore error'));
    const mockDocRef = { get: mockDocGet };
    (adminDb.collection as jest.Mock).mockReturnValue({
       doc: jest.fn().mockReturnValue(mockDocRef)
    });

    await expect(getUserChecklist(mockDocId)).rejects.toThrow('Failed to fetch checklist data.');
  });

  it('should update checklist with merge semantics', async () => {
    const updatedData = {
        userId: mockDocId,
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
       doc: jest.fn().mockReturnValue({ set: mockSet, get: mockGet })
    });

    const result = await updateUserChecklist(mockDocId, { isRegistered: true });
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ isRegistered: true }),
      { merge: true }
    );
    expect(result.isRegistered).toBe(true);
  });
});
