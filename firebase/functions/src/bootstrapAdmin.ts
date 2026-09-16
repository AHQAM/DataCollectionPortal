import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFirestore } from 'firebase-admin/firestore';
import { hashPassword } from "./auth";

export const bootstrapAdmin = functions.https.onRequest(async (req, res) => {
  const db = getFirestore('datacollectionportal');

  try {
    const userId = "ADMIN-0001";
    const username = "admin@landsurvey.com";
    const passwordHash = await hashPassword("admin123");

    // 1. Create or update user in Firestore
    const newUser = {
      userId,
      username,
      regionNo: "000",
      allowedRegionNos: ["000"],
      repNo: "ADMIN-0001",
      repNameAr: "مدير النظام",
      repNameEn: "System Admin",
      email: username,
      mobile: null,
      branchId: "MAIN-BRANCH",
      role: "ADMIN",
      passwordHash,
      mustChangePassword: true,
      isActive: true,
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: null,
      passwordChangedAt: null,
      sessionVersion: 1,
      deviceBindingStatus: "UNBOUND",
      boundDeviceIdHash: null,
      boundDevicePlatform: null,
      boundDeviceLabel: null,
      maxAllowedDevices: 5,
      fcmToken: null,
      fcmTokenUpdatedAt: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedAt: null,
      deletedBy: null,
    };

    await db.collection("users").doc(userId).set(newUser);

    // 2. Setup Firebase Auth and Custom Claims
    const customClaims = {
      role: "ADMIN",
      branchId: "MAIN-BRANCH",
      allowedRegionNos: ["000"],
      sessionVersion: 1,
      mustChangePassword: true,
    };

    try {
      await admin.auth().getUser(userId);
      await admin.auth().setCustomUserClaims(userId, customClaims);
    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        await admin.auth().createUser({
          uid: userId,
          email: username,
          password: "admin123", // They can log in via signInWithEmailAndPassword too if needed
          displayName: "System Admin",
        });
        await admin.auth().setCustomUserClaims(userId, customClaims);
      } else {
        throw e;
      }
    }

    res.status(200).send(`Admin user created/updated successfully with ID: ${userId}`);
  } catch (error: any) {
    console.error(error);
    res.status(500).send(`Error: ${error.message}`);
  }
});
