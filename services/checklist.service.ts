/**
 * @fileoverview Checklist Service.
 * Manages voter readiness checklist data in Firebase Firestore.
 * Provides CRUD operations for tracking election preparation progress.
 */

import { adminDb } from '@/lib/firebase-admin';
import { UserChecklist } from '@/types';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { COLLECTIONS, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Retrieves a user's checklist from Firestore.
 * Returns a default empty checklist if no document exists.
 *
 * @param userId - The unique identifier for the user
 * @returns The user's checklist data
 * @throws {AppError} When Firestore read fails
 */
export const getUserChecklist = async (userId: string): Promise<UserChecklist> => {
  try {
    const docRef = adminDb.collection(COLLECTIONS.USER_CHECKLISTS).doc(userId);
    const doc = await docRef.get();

    if (!doc.exists) {
      logger.debug(`No checklist found for user ${userId}, returning defaults`);
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
    logger.error(ERROR_MESSAGES.CHECKLIST_FETCH_FAILED, error);
    throw new AppError(ERROR_MESSAGES.CHECKLIST_FETCH_FAILED, 500);
  }
};

/**
 * Updates a user's checklist in Firestore with merge semantics.
 * Only the provided fields are overwritten; others are preserved.
 *
 * @param userId - The unique identifier for the user
 * @param updateData - Partial checklist data to merge
 * @returns The complete updated checklist
 * @throws {AppError} When Firestore write fails
 */
export const updateUserChecklist = async (
  userId: string,
  updateData: Partial<UserChecklist>
): Promise<UserChecklist> => {
  try {
    const docRef = adminDb.collection(COLLECTIONS.USER_CHECKLISTS).doc(userId);

    await docRef.set(
      {
        ...updateData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    logger.info(`Checklist updated for user ${userId}`);
    return await getUserChecklist(userId);
  } catch (error) {
    logger.error(ERROR_MESSAGES.CHECKLIST_UPDATE_FAILED, error);
    throw new AppError(ERROR_MESSAGES.CHECKLIST_UPDATE_FAILED, 500);
  }
};
