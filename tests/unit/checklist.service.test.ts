import { getUserChecklist, updateUserChecklist } from '../../services/checklist.service';
import { adminDb } from '../../lib/firebase-admin';

// Mock Firebase Admin Array
jest.mock('../../lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(),
  },
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

});
