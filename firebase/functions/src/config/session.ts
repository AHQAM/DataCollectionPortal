import { db } from "./db";
import { HttpsError } from "firebase-functions/v2/https";
import type { CallableContextCompat } from "./gen2";

/**
 * Verifies the database-backed session for authenticated clients.
 * Older test identities without a sessionVersion claim are left to their
 * existing role checks; production-issued claims always include this value.
 */
export const verifyActiveSession = async (
  context: CallableContextCompat,
): Promise<void> => {
  if (
    !context.auth ||
    !context.auth.token ||
    typeof context.auth.token.sessionVersion !== "number"
  ) {
    return;
  }

  const userDoc = await db.collection("users").doc(context.auth.uid).get();
  if (!userDoc.exists) {
    throw new HttpsError(
      "unauthenticated",
      "الحساب غير موجود. | User account not found.",
    );
  }

  const userData = userDoc.data() || {};
  if (userData.isActive === false) {
    throw new HttpsError(
      "permission-denied",
      "الحساب غير نشط. | User account is inactive.",
    );
  }

  if (userData.sessionVersion !== context.auth.token.sessionVersion) {
    throw new HttpsError(
      "unauthenticated",
      "انتهت صلاحية الجلسة. | Session is no longer valid.",
    );
  }
};
