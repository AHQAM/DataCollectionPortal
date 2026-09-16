/**
 * seed_test_user.js
 * 
 * Script to create a test user directly in Firestore (bypasses admin auth check).
 * Run ONCE to bootstrap the first user.
 * 
 * Usage: node seed_test_user.js
 */

const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// Initialize with application default credentials or service account
// Make sure you've run: firebase login (or set GOOGLE_APPLICATION_CREDENTIALS)
admin.initializeApp({
  // Will auto-detect from firebase login credentials or GOOGLE_APPLICATION_CREDENTIALS env var
});

const db = admin.firestore();

async function seedTestUser() {
  const BCRYPT_SALT_ROUNDS = 12;

  // ---- Change these values as needed ----
  const TEST_USER = {
    username:    "101",           // رقم المنطقة / Region No used to login
    regionNo:    "101",
    repNameAr:   "مستخدم تجريبي",
    repNameEn:   "Test User",
    role:        "REP",           // "REP" or "SUPERVISOR"
    branchId:    "BRANCH-001",
    password:    "1234",          // Initial password (mustChangePassword = true)
    allowedRegionNos: ["101"],
  };
  // ----------------------------------------

  console.log(`\nCreating test user: ${TEST_USER.username} ...`);

  // Check if already exists
  const existing = await db
    .collection("users")
    .where("username", "==", TEST_USER.username)
    .limit(1)
    .get();

  if (!existing.empty) {
    console.log(`✅ User "${TEST_USER.username}" already exists (id: ${existing.docs[0].id})`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(TEST_USER.password, BCRYPT_SALT_ROUNDS);
  const userId = `USER-${uuidv4().substring(0, 8).toUpperCase()}`;

  const newUser = {
    userId,
    username:             TEST_USER.username,
    regionNo:             TEST_USER.regionNo,
    allowedRegionNos:     TEST_USER.allowedRegionNos,
    repNo:                TEST_USER.regionNo,
    repNameAr:            TEST_USER.repNameAr,
    repNameEn:            TEST_USER.repNameEn,
    email:                null,
    mobile:               null,
    branchId:             TEST_USER.branchId,
    role:                 TEST_USER.role,
    passwordHash,
    mustChangePassword:   true,   // Will be forced to change on first login
    isActive:             true,
    failedLoginCount:     0,
    lockedUntil:          null,
    lastLoginAt:          null,
    passwordChangedAt:    null,
    sessionVersion:       1,
    deviceBindingStatus:  "UNBOUND",
    boundDeviceIdHash:    null,
    boundDevicePlatform:  null,
    boundDeviceLabel:     null,
    maxAllowedDevices:    1,
    fcmToken:             null,
    fcmTokenUpdatedAt:    null,
    createdAt:            admin.firestore.FieldValue.serverTimestamp(),
    updatedAt:            admin.firestore.FieldValue.serverTimestamp(),
    deletedAt:            null,
    deletedBy:            null,
  };

  await db.collection("users").doc(userId).set(newUser);

  console.log(`\n✅ Test user created successfully!`);
  console.log(`   ID:       ${userId}`);
  console.log(`   Username: ${TEST_USER.username}  (this is the "Region No" field in the login screen)`);
  console.log(`   Password: ${TEST_USER.password}  (will be forced to change on first login)`);
  console.log(`   Role:     ${TEST_USER.role}`);

  process.exit(0);
}

seedTestUser().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
