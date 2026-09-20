import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'datacollectionportal';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const db = getFirestore(DATABASE_ID);
