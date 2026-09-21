"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../auth");
describe("Auth Module - Password Hashing", () => {
  it("should hash a password and verify it correctly", async () => {
    const plainText = "mySecurePassword123";
    // Hash
    const hash = await (0, auth_1.hashPassword)(plainText);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(plainText);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt hash format
    // Verify correct password
    const isMatch = await (0, auth_1.verifyPassword)(plainText, hash);
    expect(isMatch).toBe(true);
    // Verify incorrect password
    const isNotMatch = await (0, auth_1.verifyPassword)("wrongpassword", hash);
    expect(isNotMatch).toBe(false);
  });
});
//# sourceMappingURL=auth.test.js.map
