import { createHash } from "crypto";
import { HttpsError } from "./gen2";
import { db } from "./db";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function rateLimitId(identifier: string, deviceId: string): string {
  return createHash("sha256")
    .update(`${identifier.trim().toLowerCase()}:${deviceId}`)
    .digest("hex");
}

export async function assertLoginAllowed(
  identifier: string,
  deviceId: string,
): Promise<void> {
  const ref = db
    .collection("loginRateLimits")
    .doc(rateLimitId(identifier, deviceId));
  const now = Date.now();

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const state = snapshot.exists ? snapshot.data() || {} : {};
    const windowStartedAt =
      typeof state.windowStartedAt === "number" ? state.windowStartedAt : now;
    const attempts =
      now - windowStartedAt >= WINDOW_MS || !snapshot.exists
        ? 0
        : Number(state.attempts || 0);

    if (attempts >= MAX_ATTEMPTS) {
      throw new HttpsError(
        "resource-exhausted",
        "Too many login attempts. Try again later.",
      );
    }

    transaction.set(ref, {
      attempts: attempts + 1,
      windowStartedAt:
        attempts === 0 && now - windowStartedAt >= WINDOW_MS
          ? now
          : windowStartedAt,
      updatedAt: now,
    });
  });
}

export async function clearLoginRateLimit(
  identifier: string,
  deviceId: string,
): Promise<void> {
  const ref = db
    .collection("loginRateLimits")
    .doc(rateLimitId(identifier, deviceId));
  await ref.delete();
}
