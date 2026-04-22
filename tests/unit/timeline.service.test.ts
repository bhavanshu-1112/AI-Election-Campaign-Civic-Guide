/**
 * @jest-environment node
 */

import { getElectionStages } from '../../services/timeline.service';
import { adminDb } from '../../lib/firebase-admin';

jest.mock('../../lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('Timeline Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when no stages exist', async () => {
    const mockGet = jest.fn().mockResolvedValue({
      empty: true,
    });

    (adminDb.collection as jest.Mock).mockReturnValue({
      orderBy: jest.fn().mockReturnValue({ get: mockGet }),
    });

    const result = await getElectionStages();
    expect(result).toEqual([]);
  });

  it('should return ordered election stages from Firestore', async () => {
    const mockDocs = [
      { id: 'stage1', data: () => ({ title: 'Registration', order: 1, description: 'Register to vote', deadline: 'Before election', requiredDocuments: [], tips: [] }) },
      { id: 'stage2', data: () => ({ title: 'Voting', order: 2, description: 'Cast your vote', deadline: 'Election day', requiredDocuments: ['Voter ID'], tips: ['Go early'] }) },
    ];

    const mockSnapshot = {
      empty: false,
      forEach: (callback: (doc: typeof mockDocs[0]) => void) => mockDocs.forEach(callback),
    };

    const mockGet = jest.fn().mockResolvedValue(mockSnapshot);
    (adminDb.collection as jest.Mock).mockReturnValue({
      orderBy: jest.fn().mockReturnValue({ get: mockGet }),
    });

    const result = await getElectionStages();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('stage1');
    expect(result[0].title).toBe('Registration');
    expect(result[1].title).toBe('Voting');
  });

  it('should throw AppError when Firestore query fails', async () => {
    (adminDb.collection as jest.Mock).mockReturnValue({
      orderBy: jest.fn().mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Firestore down')),
      }),
    });

    await expect(getElectionStages()).rejects.toThrow('Failed to fetch timeline data.');
  });
});
