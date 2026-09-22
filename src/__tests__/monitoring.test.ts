import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  monitoring,
  captureException,
  initMonitoring,
} from "../utils/monitoring";

describe("Monitoring & Telemetry Service", () => {
  beforeEach(() => {
    monitoring.clearErrors();
    vi.restoreAllMocks();
  });

  it("initializes without crashing and sets up listeners", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    initMonitoring();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "error",
      expect.any(Function),
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "unhandledrejection",
      expect.any(Function),
    );
  });

  it("captures Error instances and stores in buffer", () => {
    const testError = new Error("Test operational error");
    captureException(testError, { userId: "user-123", screen: "Dashboard" });

    const errors = monitoring.getRecentErrors();
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe("Test operational error");
    expect(errors[0].context).toEqual({
      userId: "user-123",
      screen: "Dashboard",
    });
  });

  it("handles non-Error objects gracefully", () => {
    captureException("String error message", { extra: 42 });

    const errors = monitoring.getRecentErrors();
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe("String error message");
    expect(errors[0].context).toEqual({ extra: 42 });
  });

  it("clears error buffer on demand", () => {
    captureException(new Error("Err 1"));
    captureException(new Error("Err 2"));
    expect(monitoring.getRecentErrors().length).toBe(2);

    monitoring.clearErrors();
    expect(monitoring.getRecentErrors().length).toBe(0);
  });
});
