import { describe, it, expect, vi } from "vitest";
import {
  auth,
  db,
  functions,
  storage,
  initAppCheck,
  connectEmulators,
} from "../firebase";
import * as firebaseAuth from "firebase/auth";
import * as firebaseFirestore from "firebase/firestore";
import * as firebaseFunctions from "firebase/functions";
import * as firebaseStorage from "firebase/storage";

describe("Firebase Initialization Module", () => {
  it("exports core Firebase service instances", () => {
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
    expect(functions).toBeDefined();
    expect(storage).toBeDefined();
  });

  it("handles connectEmulators gracefully without throwing", () => {
    expect(() => connectEmulators()).not.toThrow();
  });

  it("initAppCheck handles missing keys safely", async () => {
    const result = await initAppCheck();
    // In test environment without explicit recaptcha site key env set, it safely returns null or initialized instance
    expect(result === null || typeof result === "object").toBe(true);
  });
});
