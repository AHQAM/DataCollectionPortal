import * as functions from "firebase-functions";

/**
 * Verifies that the incoming callable function context contains a valid Firebase App Check token.
 * Only strictly enforces when ENFORCE_APP_CHECK is set to "true" in the environment,
 * preventing breaking development/staging while allowing zero-trust enforcement in production.
 */
export const verifyAppCheck = (context: functions.https.CallableContext) => {
  if (process.env.ENFORCE_APP_CHECK === "true" && !context.app) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "App Check verification failed. The request originated from an unauthorized client.",
    );
  }
};
