const userDoc = {
  exists: true,
  data: jest.fn(),
};

const db = {
  collection: jest.fn().mockReturnValue({
    doc: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(userDoc),
    }),
  }),
};

jest.mock("../config/db", () => ({ db }));

import { verifyActiveSession } from "../config/session";

describe("Active session validation", () => {
  beforeEach(() => {
    userDoc.exists = true;
    userDoc.data.mockReset();
  });

  it("accepts a matching active session", async () => {
    userDoc.data.mockReturnValue({ isActive: true, sessionVersion: 3 });

    await expect(
      verifyActiveSession({
        auth: { uid: "user-1", token: { sessionVersion: 3 } },
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects a stale session version", async () => {
    userDoc.data.mockReturnValue({ isActive: true, sessionVersion: 4 });

    await expect(
      verifyActiveSession({
        auth: { uid: "user-1", token: { sessionVersion: 3 } },
      }),
    ).rejects.toThrow(/Session is no longer valid/i);
  });

  it("rejects an inactive account", async () => {
    userDoc.data.mockReturnValue({ isActive: false, sessionVersion: 3 });

    await expect(
      verifyActiveSession({
        auth: { uid: "user-1", token: { sessionVersion: 3 } },
      }),
    ).rejects.toThrow(/account is inactive/i);
  });
});
