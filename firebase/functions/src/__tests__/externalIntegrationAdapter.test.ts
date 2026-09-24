import fft from "firebase-functions-test";

const testEnv = fft();

const mockGet = jest.fn().mockResolvedValue({
  exists: true,
  data: () => ({ id: "req-1", title: "Test Request" }),
});

jest.mock("../config/db", () => ({
  DATABASE_ID: "datacollectionportal",
  db: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: mockGet,
      }),
    }),
  },
}));

import { exportDataToExternalSystem } from "../externalIntegrationAdapter";

describe("External Integration Adapter Cloud Functions (Gen 2)", () => {
  let wrappedExport: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedExport = testEnv.wrap(exportDataToExternalSystem);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  it("throws unauthenticated if context.auth is missing", async () => {
    await expect(
      wrappedExport(
        { requestId: "req-1", targetSystem: "SAP" },
        { auth: null },
      ),
    ).rejects.toThrow(/User must be authenticated/i);
  });

  it("throws permission-denied if user is not Admin", async () => {
    await expect(
      wrappedExport(
        { requestId: "req-1", targetSystem: "SAP" },
        { auth: { uid: "u1", token: { role: "Rep" } } },
      ),
    ).rejects.toThrow(/Only Admins can export data/i);
  });

  it("throws invalid-argument if targetSystem is missing", async () => {
    await expect(
      wrappedExport(
        { requestId: "req-1" },
        { auth: { uid: "a1", token: { role: "Admin" } } },
      ),
    ).rejects.toThrow(/requestId and targetSystem are required/i);
  });

  it("executes export stub successfully for Admin", async () => {
    const res = await wrappedExport(
      { requestId: "req-1", targetSystem: "SAP" },
      { auth: { uid: "a1", token: { role: "Admin" } } },
    );

    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.message).toContain("Stub: Export process initiated");
  });
});
