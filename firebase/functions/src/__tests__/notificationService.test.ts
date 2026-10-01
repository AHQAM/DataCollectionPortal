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

import {
  sendBroadcastNotification,
  sendNotificationInternal,
} from "../notificationService";
import { db } from "../config/db";

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

    it("rejects invalid audiences and oversized content", async () => {
      await expect(
        wrappedSendBroadcast(
          {
            targetAudience: "EVERYONE",
            titleAr: "تنبيه",
            titleEn: "Alert",
            bodyAr: "نص",
            bodyEn: "Text",
          },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/Invalid target audience/i);

      await expect(
        wrappedSendBroadcast(
          {
            titleAr: "x".repeat(5001),
            titleEn: "Alert",
            bodyAr: "نص",
            bodyEn: "Text",
          },
          { auth: { uid: "admin1", token: { role: "ADMIN" } } },
        ),
      ).rejects.toThrow(/content is too long/i);
    });

    it("stores a notification and sends all valid user tokens", async () => {
      const set = jest.fn().mockResolvedValue(undefined);
      const get = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          preferredLanguage: "en",
          fcmToken: "token-1",
          fcmTokens: ["token-1", "token-2", ""],
        }),
      });
      (db.collection as jest.Mock).mockImplementation((name: string) => ({
        doc: jest.fn().mockReturnValue({
          id: "notification-1",
          set,
          get,
          update: jest.fn(),
        }),
        get,
      }));

      await sendNotificationInternal(
        "user-1",
        "عنوان",
        "Title",
        "نص",
        "Body",
        { requestId: 42, empty: null },
      );

      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          data: { requestId: "42" },
        }),
      );
    });
  });
});
