/**
 * @fileoverview Timeline Service.
 * Fetches election stage data from Firebase Firestore.
 * Provides ordered election timeline phases for the interactive timeline UI.
 */

import { adminDb } from '@/lib/firebase-admin';
import { ElectionStage } from '@/types';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { COLLECTIONS, ERROR_MESSAGES } from '@/lib/constants';

/**
 * Retrieves all election stages from Firestore, ordered by their sequence number.
 *
 * @returns Array of election stages sorted by order
 * @throws {AppError} When Firestore query fails
 */
export const getElectionStages = async (): Promise<ElectionStage[]> => {
  try {
    const snapshot = await adminDb.collection(COLLECTIONS.ELECTION_STAGES).orderBy('order', 'asc').get();

    if (snapshot.empty) {
      logger.info('No election stages found in Firestore');
      return [];
    }

    const stages: ElectionStage[] = [];
    snapshot.forEach((doc) => {
      stages.push({ id: doc.id, ...doc.data() } as ElectionStage);
    });

    logger.debug(`Fetched ${stages.length} election stages`);
    return stages;
  } catch (error) {
    logger.error(ERROR_MESSAGES.TIMELINE_FETCH_FAILED, error);
    throw new AppError(ERROR_MESSAGES.TIMELINE_FETCH_FAILED, 500);
  }
};
