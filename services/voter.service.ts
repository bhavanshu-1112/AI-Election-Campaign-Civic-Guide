import { geminiClient } from '../lib/gemini';
import { User, VoterJourneyResponse } from '../types';

export const generateVoterJourney = async (userProfile: Partial<User>): Promise<VoterJourneyResponse> => {
  const prompt = `You are a neutral, factual election guide for India. Based on the user 
  profile provided, generate a personalized step-by-step voter journey. 
  
  User Profile:
  Name: ${userProfile.name}
  State: ${userProfile.location?.state}
  City: ${userProfile.location?.city}
  Age: ${userProfile.age}
  First Time Voter: ${userProfile.isFirstTimeVoter}
  Role: ${userProfile.role}

  Return ONLY a valid JSON object with this exact structure, nothing else:
  {
    "steps": [{ "order": number, "title": string, "description": string, "deadline": string, "documents": string[], "tips": string[] }],
    "summary": string,
    "urgentActions": string[]
  }
  Do not include any political opinions. If unsure, say 'Please verify 
  with official sources.' Never make up deadlines or legal requirements. Ensure the response is valid JSON format without markdown ticks outside the object.`;

  try {
    const response = await geminiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });

    if(!response.text) throw new Error("No response from Gemini.");

    const parsedJson = JSON.parse(response.text) as VoterJourneyResponse;
    return parsedJson;

  } catch (error) {
    console.error("Error generating voter journey:", error);
    throw new Error("Failed to generate personalized voter journey. Please try again.");
  }
};
