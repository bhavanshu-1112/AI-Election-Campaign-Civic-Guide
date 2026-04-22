import { adminDb } from '../lib/firebase-admin';
import { ElectionStage } from '../types';

export const getElectionStages = async (): Promise<ElectionStage[]> => {
  try {
    const snapshot = await adminDb.collection('election_stages').orderBy('order', 'asc').get();
    
    if (snapshot.empty) {
        return [];
    }
    
    const stages: ElectionStage[] = [];
    snapshot.forEach((doc) => {
      stages.push({ id: doc.id, ...doc.data() } as ElectionStage);
    });

    return stages;
  } catch (error) {
    console.error("Error fetching election stages:", error);
    throw new Error("Failed to fetch timeline data.");
  }
};
