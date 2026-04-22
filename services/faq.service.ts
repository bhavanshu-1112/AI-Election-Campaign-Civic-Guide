import { geminiClient } from '../lib/gemini';
import { FAQResponse } from '../types';

export const answerFAQ = async (message: string, history: Array<{role: string, content: string}> = []): Promise<FAQResponse> => {
    
  // Format history for Gemini structured messages
  const formattedHistory = history.map(h => ({
    role: h.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: h.content }]
  }));

  const systemInstruction = `You are a helpful, unbiased election information assistant for India.
  Answer only election-related questions. For each response provide ONLY a valid JSON object matching this structure:
  {
    "answer": "string",
    "confidence": number (0-100),
    "sources": ["string"],
    "disclaimer": "string",
    "isElectionRelated": boolean
  }
  If confidence < 60, explicitly say 'Please verify with official sources.' in the disclaimer.
  If the question is not election-related, set isElectionRelated: false and politely redirect the user in the answer field.
  Never generate political opinions or favor any party/candidate. Return pure JSON without markdown tags.`;

  try {
    const chat = geminiClient.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json"
        },
        history: formattedHistory
    });

    const response = await chat.sendMessage({ message });

    if(!response.text) throw new Error("No response from Gemini.");

    const parsedJson = JSON.parse(response.text) as FAQResponse;
    return parsedJson;

  } catch (error) {
    console.error("Error answering FAQ:", error);
    throw new Error("Failed to process question. Please try again.");
  }
};
