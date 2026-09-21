import { hashPassword, verifyPassword } from "../auth";

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
});
