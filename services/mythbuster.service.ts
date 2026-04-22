import { geminiClient } from '../lib/gemini';
import { MythVerificationResponse } from '../types';

export const verifyMyth = async (claim: string): Promise<MythVerificationResponse> => {
  const prompt = `You are a neutral fact-checker for election-related claims in India.
  Analyze the claim below and return ONLY valid JSON in this exact structure:
  {
    "verdict": "TRUE" | "FALSE" | "PARTIALLY_TRUE" | "UNVERIFIED",
    "explanation": "string (max 200 words)",
    "confidence": number (0-100),
    "referenceSource": "string",
    "disclaimer": "This is AI-generated analysis. Always verify with official sources."
  }
  
  Claim: "${claim}"
  
  Guidelines:
  - Never express political bias.
  - If confidence < 50, set verdict to UNVERIFIED.
  - Do not make up sources. Return accurate and factual information. Ensure the response is perfectly formatted JSON without markdown wrappers.`;

  try {
    const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    if(!response.text) throw new Error("No response from Gemini.");

    const parsedJson = JSON.parse(response.text) as MythVerificationResponse;
    return parsedJson;

  } catch (error) {
    console.error("Error verifying myth:", error);
    throw new Error("Failed to verify claim. Please try again.");
  }
};
