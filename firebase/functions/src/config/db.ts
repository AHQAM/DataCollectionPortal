import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const isStaging =
  process.env.GCLOUD_PROJECT === "datacollectionportal-staging" ||
  process.env.FIREBASE_CONFIG?.includes("datacollectionportal-staging");

export const DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ||
  (isStaging ? "(default)" : "datacollectionportal");

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export const db =
  DATABASE_ID === "(default)" ? getFirestore() : getFirestore(DATABASE_ID);
