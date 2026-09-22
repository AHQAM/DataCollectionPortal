import fft from "firebase-functions-test";

const testEnv = fft();

jest.mock("../config/db", () => ({
  DATABASE_ID: "datacollectionportal",
  db: {
    collection: jest.fn(),
  },
}));

jest.mock("firebase-admin", () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  firestore: jest.fn(),
  messaging: () => ({
    sendEach: jest.fn().mockResolvedValue({ responses: [] }),
  }),
}));

import { sendBroadcastNotification } from "../notificationService";

describe("Notification Service Cloud Functions", () => {
  let wrappedSendBroadcast: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedSendBroadcast = testEnv.wrap(sendBroadcastNotification);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  describe("sendBroadcastNotification", () => {
    it("throws permission-denied if user is not ADMIN or SUPERVISOR", async () => {
      await expect(
        wrappedSendBroadcast(
          { titleAr: "تنبيه", titleEn: "Alert", bodyAr: "نص", bodyEn: "Text" },
          { auth: { uid: "u1", token: { role: "REP" } } },
        ),
      ).rejects.toThrow(/Only admins or supervisors can send broadcasts/i);
    });

    it("throws invalid-argument if title or body is missing", async () => {
      await expect(
        wrappedSendBroadcast(
          { titleAr: "" },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/Missing title or body/i);
    });
  });
});
