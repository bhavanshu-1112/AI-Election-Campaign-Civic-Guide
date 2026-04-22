/**
 * @jest-environment node
 */

import { generateVoterJourney } from '../../services/voter.service';
import { geminiClient } from '../../lib/gemini';
import { User, VoterJourneyResponse } from '../../types';

// Mock the gemini client
jest.mock('../../lib/gemini', () => ({
  geminiClient: {
    models: {
      generateContent: jest.fn(),
    },
  },
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('generateVoterJourney Service', () => {
    
  beforeEach(() => {
     jest.clearAllMocks();
  });

  it('should generate and strictly parse a valid voter journey JSON from Gemini', async () => {
    
    const mockUser: User = {
        name: 'Rahul',
        location: { state: 'Maharashtra', city: 'Mumbai' },
        age: 21,
        isFirstTimeVoter: true,
        role: 'voter'
    };

    const mockApiResponse: VoterJourneyResponse = {
        steps: [
            { order: 1, title: 'Check Name on Roll', description: 'desc', deadline: 'Soon', documents: [], tips: [] }
        ],
        summary: 'Your journey summary',
        urgentActions: []
    };

    // Setup mock return
    (geminiClient.models.generateContent as jest.Mock).mockResolvedValue({
        text: JSON.stringify(mockApiResponse)
    });

    const result = await generateVoterJourney(mockUser);
    
    expect(geminiClient.models.generateContent).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockApiResponse);
    expect(result.summary).toBe('Your journey summary');
  });

  it('should throw an error if Gemini returns null text', async () => {
    const mockUser: User = {
        name: 'Anita',
        location: { state: 'Delhi', city: 'Delhi' },
        age: 35,
        isFirstTimeVoter: false,
        role: 'voter'
    };

    (geminiClient.models.generateContent as jest.Mock).mockResolvedValue({
        text: null
    });

    await expect(generateVoterJourney(mockUser)).rejects.toThrow();
  });

  it('should throw AIServiceError when Gemini SDK fails', async () => {
    const mockUser: User = {
        name: 'Test',
        location: { state: 'UP', city: 'Lucknow' },
        age: 25,
        isFirstTimeVoter: true,
        role: 'voter'
    };

    (geminiClient.models.generateContent as jest.Mock).mockRejectedValue(new Error('SDK Error'));

    await expect(generateVoterJourney(mockUser)).rejects.toThrow();
  });

  it('should throw when Gemini returns malformed JSON', async () => {
    const mockUser: User = {
        name: 'Test',
        location: { state: 'UP', city: 'Lucknow' },
        age: 25,
        isFirstTimeVoter: true,
        role: 'voter'
    };

    (geminiClient.models.generateContent as jest.Mock).mockResolvedValue({
        text: 'not valid json {{{'
    });

    await expect(generateVoterJourney(mockUser)).rejects.toThrow();
  });
});
