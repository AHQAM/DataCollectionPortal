import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFirestoreSync } from "../hooks/useFirestoreSync";
import { useAuthStore } from "../stores/authStore";
import { useDataStore } from "../stores/dataStore";
import { useUIStore } from "../stores/uiStore";
import { onSnapshot } from "firebase/firestore";

vi.mock("firebase/firestore", () => {
  return {
    collection: (db: any, path: string) => path,
    query: (collectionPath: string, ...rest: any[]) =>
      `${collectionPath}_query`,
    where: () => "where_clause",
    onSnapshot: vi.fn(),
  };
});

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

vi.mock("../firebase", () => ({
  db: {},
  auth: {},
}));

describe("useFirestoreSync Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ currentUser: null } as any);
    useDataStore.setState({
      users: [],
      requests: [],
      fields: [],
      assignments: [],
      records: [],
      recordResponses: {} as any,
      branches: [],
      regions: [],
      deviceBindings: [],
      passwordResetRequests: [],
    });
    useUIStore.setState({ notifications: [] });
  });

  it("clears all stores when currentUser is null", () => {
    useDataStore.setState({ users: [{ userId: "u1" } as any] });
    renderHook(() => useFirestoreSync());
    expect(useDataStore.getState().users).toEqual([]);
    expect(onSnapshot).not.toHaveBeenCalled();
  });

  it("sets up listeners for ADMIN and processes snapshot updates", () => {
    useAuthStore.setState({
      currentUser: { userId: "admin1", role: "ADMIN" } as any,
    });

    const unsubMock = vi.fn();
    let usersCallback: any;

    vi.mocked(onSnapshot).mockImplementation(
      ((queryRef: string, callback: Function) => {
        if (queryRef === "users") {
          usersCallback = callback;
        }
        return unsubMock;
      }) as any,
    );

    const { unmount } = renderHook(() => useFirestoreSync());

    // Should have called onSnapshot for all collections
    expect(onSnapshot).toHaveBeenCalledTimes(11);
    expect(usersCallback).toBeDefined();

    // Trigger the users callback with a mock snapshot
    const mockDoc = {
      id: "mockUser",
      data: () => ({ userId: "u2", role: "REP" }),
    };
    usersCallback({ forEach: (cb: any) => [mockDoc].forEach(cb) });

    // Verify datastore is updated
    expect(useDataStore.getState().users).toEqual([
      { userId: "u2", role: "REP" },
    ]);

    // Unmount should call unsub
    unmount();
    expect(unsubMock).toHaveBeenCalledTimes(11);
  });

  it("sets up queries for SUPERVISOR and processes record responses", () => {
    useAuthStore.setState({
      currentUser: {
        userId: "sup1",
        role: "SUPERVISOR",
        branchId: "b1",
      } as any,
    });

    let responsesCallback: any;

    vi.mocked(onSnapshot).mockImplementation(
      ((queryRef: string, callback: Function) => {
        if (queryRef.includes("responses")) {
          responsesCallback = callback;
        }
        return vi.fn();
      }) as any,
    );

    renderHook(() => useFirestoreSync());

    // Trigger responses callback
    const mockDoc = {
      id: "rec1",
      data: () => ({ recordId: "rec1", data: { q1: "yes" } }),
    };
    if (responsesCallback) {
      responsesCallback({ forEach: (cb: any) => [mockDoc].forEach(cb) });
    }

    expect(useDataStore.getState().recordResponses).toEqual({
      rec1: { q1: "yes" },
    });
  });

  it("processes deviceBindings and passwordResetRequests for ADMIN", () => {
    useAuthStore.setState({
      currentUser: { userId: "admin1", role: "ADMIN" } as any,
    });

    const callbacks: Record<string, Function> = {};
    const errorCallbacks: Record<string, Function> = {};

    vi.mocked(onSnapshot).mockImplementation(
      ((queryRef: string, callback: Function, errorCb?: Function) => {
        callbacks[queryRef] = callback;
        if (errorCb) errorCallbacks[queryRef] = errorCb;
        return vi.fn();
      }) as any,
    );

    renderHook(() => useFirestoreSync());

    // Trigger deviceBindings callback
    expect(callbacks["deviceBindings"]).toBeDefined();
    const mockBinding = {
      id: "b1",
      data: () => ({ bindingId: "bind1", userId: "u1", deviceId: "dev1" }),
    };
    callbacks["deviceBindings"]({
      forEach: (cb: any) => [mockBinding].forEach(cb),
    });
    expect(useDataStore.getState().deviceBindings).toEqual([
      { bindingId: "bind1", userId: "u1", deviceId: "dev1" },
    ]);

    // Trigger passwordResetRequests callback
    expect(callbacks["passwordResetRequests"]).toBeDefined();
    const mockReset = {
      id: "r1",
      data: () => ({ requestId: "rst1", userId: "u1", status: "PENDING" }),
    };
    callbacks["passwordResetRequests"]({
      forEach: (cb: any) => [mockReset].forEach(cb),
    });
    expect(useDataStore.getState().passwordResetRequests).toEqual([
      { requestId: "rst1", userId: "u1", status: "PENDING" },
    ]);

    // Error callbacks should log error without throwing
    const spyError = vi.spyOn(console, "error").mockImplementation(() => {});
    if (errorCallbacks["deviceBindings"]) {
      errorCallbacks["deviceBindings"](new Error("Permission denied"));
      expect(spyError).toHaveBeenCalled();
    }
    spyError.mockRestore();
  });
});
