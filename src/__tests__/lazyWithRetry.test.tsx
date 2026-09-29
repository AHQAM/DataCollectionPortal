import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { lazyWithRetry } from "../utils/lazyWithRetry";

describe("lazyWithRetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("loads a named export component successfully", async () => {
    const MockComponent: React.FC = () => <div>Hello Named</div>;
    const factory = vi.fn().mockResolvedValue({ MyModule: MockComponent });

    const LazyComponent = lazyWithRetry(factory, "MyModule");

    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </React.Suspense>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(await screen.findByText("Hello Named")).toBeInTheDocument();
  });

  it("loads a default export component successfully", async () => {
    const MockComponent: React.FC = () => <div>Hello Default</div>;
    const factory = vi.fn().mockResolvedValue({ default: MockComponent });

    const LazyComponent = lazyWithRetry(factory);

    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </React.Suspense>,
    );

    expect(await screen.findByText("Hello Default")).toBeInTheDocument();
  });

  it("triggers window.location.reload once on chunk load error", async () => {
    const originalReload = window.location.reload;
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, reload: reloadMock },
    });

    const factory = vi
      .fn()
      .mockRejectedValue(
        new Error("Failed to fetch dynamically imported module: test-chunk.js"),
      );

    const LazyComponent = lazyWithRetry(factory, "TestComponent");

    render(
      <React.Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </React.Suspense>,
    );

    // Wait microtask
    await vi.waitFor(() => {
      expect(reloadMock).toHaveBeenCalled();
    });

    expect(sessionStorage.getItem("chunk_retry_TestComponent")).toBe("true");

    // Restore
    window.location.reload = originalReload;
  });
});
