const admin = require("firebase-admin");
const bcrypt = require("bcrypt");

const confirmation = process.env.MIGRATE_DEVICE_IDS_CONFIRM;
if (confirmation !== "I_UNDERSTAND_DEVICE_MIGRATION") {
  throw new Error(
    "Set MIGRATE_DEVICE_IDS_CONFIRM=I_UNDERSTAND_DEVICE_MIGRATION before running this migration.",
  );
}

admin.initializeApp();
const db = admin.firestore();

async function migrateCollection(collectionName, plaintextField, hashField) {
  const snapshot = await db.collection(collectionName).get();
  let migrated = 0;
  let batch = db.batch();
  let writes = 0;

  for (const doc of snapshot.docs) {
    const value = doc.data()[plaintextField];
    if (typeof value !== "string" || !value) continue;

    batch.update(doc.ref, {
      [hashField]: await bcrypt.hash(value, 12),
      [plaintextField]: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    writes += 1;
    migrated += 1;

    if (writes === 400) {
      await batch.commit();
      batch = db.batch();
      writes = 0;
    }
  }

  if (writes > 0) await batch.commit();
  console.log(`${collectionName}: migrated ${migrated} plaintext identifiers`);
}

async function main() {
  await migrateCollection("deviceBindings", "deviceId", "deviceIdHash");
  await migrateCollection("users", "boundDeviceId", "boundDeviceIdHash");
}

main().catch((error) => {
  console.error("Device identifier migration failed:", error);
  process.exitCode = 1;
});
