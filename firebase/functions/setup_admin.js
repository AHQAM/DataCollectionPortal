const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp({
  projectId: "landsurvey-ebb3b",
});

const db = getFirestore("datacollectionportal");

async function setupAdmin() {
  try {
    const targetUid = process.env.ADMIN_SETUP_UID;
    if (!targetUid) {
      throw new Error("ADMIN_SETUP_UID must identify the intended admin user.");
    }

    // 1. List all users in Firebase Auth
    const listUsersResult = await admin.auth().listUsers();

    if (listUsersResult.users.length === 0) {
      console.log("No users found in Firebase Auth.");
      return;
    }

    const adminAuthUser = listUsersResult.users.find(
      (user) => user.uid === targetUid,
    );
    if (!adminAuthUser) {
      throw new Error(`No Firebase Auth user found for ADMIN_SETUP_UID.`);
    }
    console.log(
      `Found user: ${adminAuthUser.email} (UID: ${adminAuthUser.uid})`,
    );

    // 2. Set custom claim for ADMIN
    await admin
      .auth()
      .setCustomUserClaims(adminAuthUser.uid, { role: "ADMIN" });
    console.log(`Successfully set ADMIN custom claim for ${adminAuthUser.uid}`);

    // 3. Create or update user in Firestore
    const userDocRef = db.collection("users").doc(adminAuthUser.uid);
    await userDocRef.set(
      {
        userId: adminAuthUser.uid,
        email: adminAuthUser.email,
        nameAr: "مدير النظام",
        nameEn: "System Admin",
        role: "ADMIN",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    console.log(
      `Successfully created/updated user document in Firestore for ${adminAuthUser.uid}`,
    );
  } catch (error) {
    console.error("Error setting up admin:", error);
  }
}

setupAdmin();
