import * as admin from "firebase-admin";

admin.initializeApp();

// Export auth functions
export * from "./auth";
export * from "./deviceBinding";
