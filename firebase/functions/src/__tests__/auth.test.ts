import { hashPassword, verifyPassword } from "../auth";
import { authenticateWithRegionPassword } from "../auth";
import { assertLoginAllowed } from "../config/loginRateLimit";
import fft from "firebase-functions-test";

const testEnv = fft();

jest.mock("../config/db", () => {
  const transaction = {
    get: jest.fn(),
    set: jest.fn(),
  };
  return {
    db: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          delete: jest.fn(),
        })),
      })),
      runTransaction: jest.fn(async (callback: any) => callback(transaction)),
    },
    __transaction: transaction,
  };
});

import { db } from "../config/db";

describe("Auth Module - Password Hashing", () => {
  it("should hash a password and verify it correctly", async () => {
    const plainText = "mySecurePassword123";

    // Hash
    const hash = await hashPassword(plainText);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plainText);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt hash format

    // Verify correct password
    const isMatch = await verifyPassword(plainText, hash);
    expect(isMatch).toBe(true);

    // Verify incorrect password
    const isNotMatch = await verifyPassword("wrongpassword", hash);
    expect(isNotMatch).toBe(false);
  });

  describe("Authentication input validation", () => {
    const wrappedAuthenticate = testEnv.wrap(authenticateWithRegionPassword);

    afterAll(() => {
      testEnv.cleanup();
    });

    it("rejects missing login fields", async () => {
      await expect(
        wrappedAuthenticate({}, { auth: null }),
      ).rejects.toThrow(/Missing required fields/i);
    });

    it("rejects invalid login field types", async () => {
      await expect(
        wrappedAuthenticate(
          {
            regionNo: 101,
            password: "valid-password",
            installationDeviceId: "device-1",
          },
          { auth: null },
        ),
      ).rejects.toThrow(/Invalid input types/i);
    });

    it("rejects oversized or blank login fields", async () => {
      await expect(
        wrappedAuthenticate(
          {
            regionNo: " ".repeat(129),
            password: "valid-password",
            installationDeviceId: "device-1",
          },
          { auth: null },
        ),
      ).rejects.toThrow(/Invalid login fields/i);

      await expect(
        wrappedAuthenticate(
          {
            regionNo: "101",
            password: "valid-password",
            installationDeviceId: "d".repeat(257),
          },
          { auth: null },
        ),
      ).rejects.toThrow(/Invalid login fields/i);
    });

    it("rejects oversized passwords", async () => {
      await expect(
        wrappedAuthenticate(
          {
            regionNo: "101",
            password: "p".repeat(129),
            installationDeviceId: "device-1",
          },
          { auth: null },
        ),
      ).rejects.toThrow(/Password exceeds maximum length/i);
    });
  });

  describe("Login rate limiting", () => {
    it("rejects the eleventh attempt in a ten-minute window", async () => {
      const transaction = (jest.requireMock("../config/db") as any).__transaction;
      transaction.get.mockResolvedValue({
        exists: true,
        data: () => ({ attempts: 10, windowStartedAt: Date.now() }),
      });

      await expect(assertLoginAllowed("rep-1", "device-1")).rejects.toThrow(
        /Too many login attempts/i,
      );
      expect(db.runTransaction).toHaveBeenCalled();
    });
  });
});
