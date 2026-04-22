import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client using the standard Google Gen AI SDK
export const geminiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
});
