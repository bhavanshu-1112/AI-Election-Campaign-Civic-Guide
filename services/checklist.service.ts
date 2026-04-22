import { adminDb } from '../lib/firebase-admin';
import { UserChecklist } from '../types';

export const getUserChecklist = async (userId: string): Promise<UserChecklist> => {
  try {
    const docRef = adminDb.collection('user_checklists').doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Return default if not exists
      return {
        userId,
        isRegistered: false,
        hasValidId: false,
        knowsPollingBooth: false,
        knowsVotingDate: false,
      };
    }
    
    return doc.data() as UserChecklist;
  } catch (error) {
    console.error("Error fetching user checklist:", error);
    throw new Error("Failed to fetch checklist data.");
  }
};

export const updateUserChecklist = async (userId: string, updateData: Partial<UserChecklist>): Promise<UserChecklist> => {
    try {
        const docRef = adminDb.collection('user_checklists').doc(userId);
        
        await docRef.set({
            ...updateData,
            updatedAt: new Date().toISOString()
        }, { merge: true });
        
        return await getUserChecklist(userId); 
    } catch (error) {
        console.error("Error updating checklist:", error);
        throw new Error("Failed to update checklist.");
    }
}
