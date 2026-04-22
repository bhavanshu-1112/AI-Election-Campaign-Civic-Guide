export interface User {
  id?: string;
  name: string;
  location: { state: string; city: string };
  age: number;
  isFirstTimeVoter: boolean;
  role: "voter" | "candidate";
  createdAt?: string | Date;
}

export interface ElectionStage {
  id?: string;
  title: string;
  description: string;
  order: number;
  deadline: string | Date | null;
  requiredDocuments: string[];
  tips: string[];
}

export interface UserChecklist {
  userId: string;
  isRegistered: boolean;
  hasValidId: boolean;
  knowsPollingBooth: boolean;
  knowsVotingDate: boolean;
  updatedAt?: string | Date;
}

export interface FAQSession {
  sessionId?: string;
  userId: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string | Date;
  }>;
  createdAt?: string | Date;
}

export interface AICache {
  query: string;
  response: object;
  createdAt: string | Date;
  expiresAt: string | Date;
}

// Responses generated specifically by Gemini services

export interface VoterJourneyStep {
  order: number;
  title: string;
  description: string;
  deadline: string;
  documents: string[];
  tips: string[];
}

export interface VoterJourneyResponse {
  steps: VoterJourneyStep[];
  summary: string;
  urgentActions: string[];
}

export interface FAQResponse {
  answer: string;
  confidence: number;
  sources: string[];
  disclaimer: string;
  isElectionRelated: boolean;
}

export interface MythVerificationResponse {
  verdict: "TRUE" | "FALSE" | "PARTIALLY_TRUE" | "UNVERIFIED";
  explanation: string;
  confidence: number;
  referenceSource: string;
  disclaimer: string;
}
