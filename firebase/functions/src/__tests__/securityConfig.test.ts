import { verifyAppCheck } from "../config/appCheck";

describe("Security configuration", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEnforceAppCheck = process.env.ENFORCE_APP_CHECK;
  const originalFunctionsEmulator = process.env.FUNCTIONS_EMULATOR;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ENFORCE_APP_CHECK = originalEnforceAppCheck;
    process.env.FUNCTIONS_EMULATOR = originalFunctionsEmulator;
  });

  it("rejects missing App Check in production", () => {
    process.env.ENFORCE_APP_CHECK = "true";
    delete process.env.FUNCTIONS_EMULATOR;

    expect(() => verifyAppCheck({})).toThrow(/App Check verification failed/i);
  });

  it("allows missing App Check in the emulator", () => {
    process.env.NODE_ENV = "production";
    process.env.FUNCTIONS_EMULATOR = "true";
    delete process.env.ENFORCE_APP_CHECK;

    expect(() => verifyAppCheck({})).not.toThrow();
  });
});
