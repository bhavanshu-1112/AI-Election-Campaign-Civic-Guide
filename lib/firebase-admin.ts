/**
 * @fileoverview Firebase Admin SDK initialization for server-side operations.
 * Used by API routes for secure Firestore writes and authentication verification.
 * Supports both service account credentials and Application Default Credentials.
 */

import * as admin from 'firebase-admin';
import { logger } from './logger';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_ADMIN_SDK || '{}'
    );

    if (Object.keys(serviceAccount).length > 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      logger.info('Firebase Admin initialized with service account credentials');
    } else {
      // Fallback for environments with Application Default Credentials
      admin.initializeApp();
      logger.info('Firebase Admin initialized with default credentials');
    }
  } catch (error) {
    logger.error('Firebase admin initialization error', error);
  }
}

/** Firestore Admin instance for server-side database operations */
const adminDb = admin.firestore();

/** Firebase Auth Admin instance for token verification */
const adminAuth = admin.auth();

export { adminDb, adminAuth };
