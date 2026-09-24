import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "../components/ErrorBoundary";

vi.mock("../utils/monitoring", () => ({
  captureException: vi.fn(),
}));

import { captureException } from "../utils/monitoring";

const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Simulated rendering crash");
  }
  return <div>Normal Content</div>;
};

describe("ErrorBoundary Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Normal Content")).toBeInTheDocument();
  });

  it("catches child crash, invokes captureException, and renders default recovery UI", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("عذراً، حدث خطأ غير متوقع")).toBeInTheDocument();
    expect(screen.getByText("Simulated rendering crash")).toBeInTheDocument();
    expect(screen.getByText("تحديث الصفحة")).toBeInTheDocument();
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it("renders custom fallback node when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom Error View</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Custom Error View")).toBeInTheDocument();
    expect(
      screen.queryByText("عذراً، حدث خطأ غير متوقع"),
    ).not.toBeInTheDocument();
  });
});
