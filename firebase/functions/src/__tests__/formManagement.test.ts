import fft from "firebase-functions-test";

const testEnv = fft();

const mockBatchCommit = jest.fn().mockResolvedValue([]);
const mockBatchDelete = jest.fn();
const mockBatchSet = jest.fn();

const mockBatch = jest.fn().mockReturnValue({
  delete: mockBatchDelete,
  set: mockBatchSet,
  commit: mockBatchCommit,
});

const mockRequestGet = jest.fn().mockResolvedValue({
  exists: true,
  data: () => ({ status: "draft" }),
});

jest.mock("../config/db", () => ({
  DATABASE_ID: "datacollectionportal",
  db: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: mockRequestGet,
      }),
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue([]),
      }),
    }),
    batch: mockBatch,
  },
}));

jest.mock("firebase-admin", () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn().mockReturnValue("TIMESTAMP"),
    },
  },
}));

import { saveRequestFields } from "../formManagement";

describe("Form Management Cloud Functions (Gen 2)", () => {
  let wrappedSaveRequestFields: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedSaveRequestFields = testEnv.wrap(saveRequestFields);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  it("throws unauthenticated if context.auth is missing", async () => {
    await expect(
      wrappedSaveRequestFields({ requestId: "r1", fields: [] }, { auth: null }),
    ).rejects.toThrow(/User must be authenticated/i);
  });

  it("throws permission-denied if user is REP", async () => {
    await expect(
      wrappedSaveRequestFields(
        { requestId: "r1", fields: [] },
        { auth: { uid: "u1", token: { role: "REP" } } },
      ),
    ).rejects.toThrow(/Only admins or supervisors/i);
  });

  it("throws invalid-argument if fields is not an array", async () => {
    await expect(
      wrappedSaveRequestFields(
        { requestId: "r1", fields: "invalid" },
        { auth: { uid: "a1", token: { role: "ADMIN" } } },
      ),
    ).rejects.toThrow(/requestId and a fields array are required/i);
  });

  it("saves fields successfully for draft request", async () => {
    const res = await wrappedSaveRequestFields(
      {
        requestId: "r1",
        fields: [{ fieldId: "f1", labelAr: "الحقل 1", fieldType: "text" }],
      },
      { auth: { uid: "a1", token: { role: "ADMIN" } } },
    );

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(mockBatchCommit).toHaveBeenCalled();
  });
});
