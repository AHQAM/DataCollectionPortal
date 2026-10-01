import { HttpsError } from "./gen2";

interface AppCheckContext {
  app?: unknown;
}

const isEmulatorRuntime = () =>
  process.env.FUNCTIONS_EMULATOR === "true" ||
  process.env.FIREBASE_EMULATOR_HUB === "true";

const requiresAppCheck = () =>
  !isEmulatorRuntime() &&
  (process.env.ENFORCE_APP_CHECK === "true" ||
    process.env.NODE_ENV === "production");

/**
 * Verifies that the incoming callable function context contains a valid Firebase App Check token.
 */
export const verifyAppCheck = (context: AppCheckContext) => {
  if (requiresAppCheck() && !context?.app) {
    throw new HttpsError(
      "failed-precondition",
      "App Check verification failed. The request originated from an unauthorized client.",
    );
  }
};

export const isAppCheckRequired = requiresAppCheck;
