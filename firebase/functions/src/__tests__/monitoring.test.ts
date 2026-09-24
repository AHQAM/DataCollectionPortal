import fft from "firebase-functions-test";

const testEnv = fft();

const mockCountGet = jest.fn().mockResolvedValue({
  data: () => ({ count: 10 }),
});

const mockCount = jest.fn().mockReturnValue({
  get: mockCountGet,
});

const mockWhere = jest.fn().mockReturnValue({
  count: mockCount,
});

jest.mock("../config/db", () => ({
  DATABASE_ID: "datacollectionportal",
  db: {
    collection: jest.fn().mockReturnValue({
      count: mockCount,
      where: mockWhere,
    }),
  },
}));

jest.mock("firebase-admin", () => ({
  apps: [{}],
  initializeApp: jest.fn(),
  firestore: jest.fn(),
}));

import { getSystemHealth } from "../monitoring";

describe("Monitoring Cloud Functions (Gen 2)", () => {
  let wrappedGetSystemHealth: any;

  beforeEach(() => {
    jest.clearAllMocks();
    wrappedGetSystemHealth = testEnv.wrap(getSystemHealth);
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  it("throws permission-denied if context.auth is missing", async () => {
    await expect(wrappedGetSystemHealth({}, { auth: null })).rejects.toThrow(
      /Only admins or supervisors can check system health/i,
    );
  });

  it("throws permission-denied if user is a representative", async () => {
    await expect(
      wrappedGetSystemHealth(
        {},
        { auth: { uid: "u1", token: { role: "REP" } } },
      ),
    ).rejects.toThrow(/Only admins or supervisors can check system health/i);
  });

  it("returns system metrics when invoked by ADMIN", async () => {
    const res = await wrappedGetSystemHealth(
      {},
      { auth: { uid: "admin1", token: { role: "ADMIN" } } },
    );

    expect(res).toBeDefined();
    expect(res.status).toBe("HEALTHY");
    expect(res.metrics.usersCount).toBe(10);
    expect(res.metrics.requestsCount).toBe(10);
    expect(res.timestamp).toBeDefined();
  });
});
