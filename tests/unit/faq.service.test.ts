/**
 * @jest-environment node
 */

import { answerFAQ } from '../../services/faq.service';
import { geminiClient } from '../../lib/gemini';
import { FAQResponse } from '../../types';

jest.mock('../../lib/gemini', () => ({
  geminiClient: {
    chats: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../lib/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

describe('answerFAQ Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a valid FAQ response from Gemini', async () => {
    const mockResponse: FAQResponse = {
      answer: 'You need a valid EPIC card.',
      confidence: 90,
      sources: ['ECI Official Site'],
      disclaimer: 'Please verify with official sources.',
      isElectionRelated: true,
    };

    const mockSendMessage = jest.fn().mockResolvedValue({
      text: JSON.stringify(mockResponse),
    });

    (geminiClient.chats.create as jest.Mock).mockReturnValue({
      sendMessage: mockSendMessage,
    });

    const result = await answerFAQ('What ID do I need to vote?');
    expect(result).toEqual(mockResponse);
    expect(result.confidence).toBe(90);
    expect(mockSendMessage).toHaveBeenCalledWith({ message: 'What ID do I need to vote?' });
  });

  it('should pass conversation history to the chat', async () => {
    const mockResponse: FAQResponse = {
      answer: 'Follow up answer',
      confidence: 85,
      sources: [],
      disclaimer: '',
      isElectionRelated: true,
    };

    const mockSendMessage = jest.fn().mockResolvedValue({
      text: JSON.stringify(mockResponse),
    });

    (geminiClient.chats.create as jest.Mock).mockReturnValue({
      sendMessage: mockSendMessage,
    });

    const history = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ];

    await answerFAQ('Follow up question', history);
    expect(geminiClient.chats.create).toHaveBeenCalledWith(
      expect.objectContaining({
        history: [
          { role: 'user', parts: [{ text: 'Hello' }] },
          { role: 'model', parts: [{ text: 'Hi there' }] },
        ],
      })
    );
  });

  it('should throw AIServiceError when Gemini returns null text', async () => {
    const mockSendMessage = jest.fn().mockResolvedValue({ text: null });
    (geminiClient.chats.create as jest.Mock).mockReturnValue({
      sendMessage: mockSendMessage,
    });

    await expect(answerFAQ('test')).rejects.toThrow();
  });

  it('should throw AIServiceError when Gemini SDK fails', async () => {
    (geminiClient.chats.create as jest.Mock).mockImplementation(() => {
      throw new Error('SDK crash');
    });

    await expect(answerFAQ('test')).rejects.toThrow();
  });
});
