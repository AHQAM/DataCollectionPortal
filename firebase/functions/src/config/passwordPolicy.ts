import { HttpsError } from "firebase-functions/v2/https";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

export const validatePassword = (password: unknown, label: string): string => {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpsError(
      "invalid-argument",
      `${label} must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }

  if (password.length > MAX_PASSWORD_LENGTH || password.trim() !== password) {
    throw new HttpsError(
      "invalid-argument",
      `${label} must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters without leading or trailing whitespace.`,
    );
  }

  return password;
};
