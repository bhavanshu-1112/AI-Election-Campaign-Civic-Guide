import { verifyMyth } from '../../services/mythbuster.service';
import { geminiClient } from '../../lib/gemini';
import { MythVerificationResponse } from '../../types';

jest.mock('../../lib/gemini', () => ({
  geminiClient: {
    models: {
      generateContent: jest.fn(),
    },
  },
}));

describe('verifyMyth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should parse myth verification response securely', async () => {
        const mockResponse: MythVerificationResponse = {
            verdict: 'FALSE',
            explanation: 'This is not true',
            confidence: 95,
            referenceSource: 'ECI Manual',
            disclaimer: 'Verify with official sources.'
        };

        (geminiClient.models.generateContent as jest.Mock).mockResolvedValue({
            text: JSON.stringify(mockResponse)
        });

        const result = await verifyMyth('Can I vote online?');
        expect(result.verdict).toBe('FALSE');
        expect(result.confidence).toBe(95);
    });

    it('should throw error if Gemini SDK fails', async () => {
        (geminiClient.models.generateContent as jest.Mock).mockRejectedValue(new Error('API Down'));

        await expect(verifyMyth('Some claim')).rejects.toThrow("Failed to verify claim. Please try again.");
    });
});
