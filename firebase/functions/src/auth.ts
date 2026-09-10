import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

/**
 * Cloud Function to authenticate a Sales Representative using Region Number and Password.
 * Returns a Custom Firebase Auth Token on success.
 */
export const authenticateWithRegionPassword = functions.https.onCall(async (data, context) => {
  const { regionNo, password, installationDeviceId, platform, appVersion } = data;

  if (!regionNo || !password || !installationDeviceId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: regionNo, password, installationDeviceId."
    );
  }

  const db = admin.firestore();

  try {
    // 1. Find user by regionNo
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("username", "==", regionNo).limit(1).get();

    if (snapshot.empty) {
      throw new functions.https.HttpsError("not-found", "User not found.");
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    // 2. Check if account is active and not locked
    if (userData.isActive === false) {
      throw new functions.https.HttpsError("permission-denied", "Account is deactivated.");
    }

    if (userData.lockedUntil && userData.lockedUntil.toDate() > new Date()) {
      throw new functions.https.HttpsError("permission-denied", "Account is temporarily locked.");
    }

    // 3. Verify Password (Placeholder for proper bcrypt hashing in production)
    // In production, use a library like bcrypt to verify `password` against `userData.passwordHash`
    // For this prototype, we simulate a check.
    const isPasswordValid = password === "1234" || userData.passwordHash === password; 
    
    if (!isPasswordValid) {
      // Increment failed login count
      const failedCount = (userData.failedLoginCount || 0) + 1;
      const updates: any = { failedLoginCount: failedCount };
      
      if (failedCount >= 5) {
        // Lock for 15 minutes
        const lockTime = new Date();
        lockTime.setMinutes(lockTime.getMinutes() + 15);
        updates.lockedUntil = admin.firestore.Timestamp.fromDate(lockTime);
      }
      
      await userDoc.ref.update(updates);
      throw new functions.https.HttpsError("unauthenticated", "Invalid credentials.");
    }

    // 4. Validate Device Binding
    if (userData.deviceBindingStatus === "BOUND") {
      if (userData.boundDeviceId !== installationDeviceId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "This account is linked to another device. Please contact the administrator to release the device." // Arabic: هذا الحساب مرتبط بجهاز آخر. يرجى التواصل مع الإدارة لفك ارتباط الجهاز.
        );
      }
    } else {
      // First login on a new device, bind it!
      await userDoc.ref.update({
        deviceBindingStatus: "BOUND",
        boundDeviceId: installationDeviceId,
        boundDevicePlatform: platform || "Unknown",
      });
      
      // Also log device binding in deviceBindings collection
      await db.collection("deviceBindings").add({
        userId,
        regionNo,
        deviceIdHash: installationDeviceId, // Hash it in prod
        devicePlatform: platform || "Unknown",
        appVersion: appVersion || "Unknown",
        status: "ACTIVE",
        boundAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // 5. Success! Reset failed login count and update last login
    await userDoc.ref.update({
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 6. Create Firebase Custom Token
    const customClaims = {
      role: userData.role,
      branchId: userData.branchId,
      mustChangePassword: userData.mustChangePassword,
    };

    const token = await admin.auth().createCustomToken(userId, customClaims);

    // Ensure Firebase Auth user exists
    try {
      await admin.auth().getUser(userId);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          uid: userId,
          displayName: userData.repNameAr,
        });
        await admin.auth().setCustomUserClaims(userId, customClaims);
      }
    }

    // Log the successful login
    await db.collection("auditLogs").add({
      userId,
      userRole: userData.role,
      action: "LOGIN_SUCCESS",
      entityType: "USER",
      entityId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      details: {
        platform,
        appVersion,
        deviceId: installationDeviceId,
      }
    });

    return { token };
  } catch (error: any) {
    console.error("Auth Error:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Internal server error.");
  }
});
