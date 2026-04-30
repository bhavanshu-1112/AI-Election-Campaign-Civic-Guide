/**
 * @jest-environment node
 */

import { verifyMyth } from '../../services/mythbuster.service';
import { geminiClient } from '../../lib/gemini';
import { MythVerificationResponse } from '../../types';

jest.mock('../../lib/gemini', () => ({
  geminiClient: {
    models: {
      generateContent: jest.fn(),
    },
  },
  geminiRequestConfig: {
    safetySettings: [],
    responseMimeType: 'application/json',
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
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

        await expect(verifyMyth('Some claim')).rejects.toThrow();
    });

    it('should throw when Gemini returns null text', async () => {
        (geminiClient.models.generateContent as jest.Mock).mockResolvedValue({
            text: null
        });

        await expect(verifyMyth('Test claim')).rejects.toThrow();
    });

    it('should handle PARTIALLY_TRUE verdict', async () => {
        const mockResponse: MythVerificationResponse = {
            verdict: 'PARTIALLY_TRUE',
            explanation: 'Some context is missing',
            confidence: 65,
            referenceSource: 'General knowledge',
            disclaimer: 'Verify with official sources.'
        };

        (geminiClient.models.generateContent as jest.Mock).mockResolvedValue({
            text: JSON.stringify(mockResponse)
        });

        const result = await verifyMyth('EVM machines can be hacked');
        expect(result.verdict).toBe('PARTIALLY_TRUE');
        expect(result.confidence).toBe(65);
    });
});
