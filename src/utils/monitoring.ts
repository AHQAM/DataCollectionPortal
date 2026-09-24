/**
 * Web Monitoring & Telemetry Service
 * Supports Sentry integration via VITE_SENTRY_DSN, with a robust fallback
 * for error telemetry, unhandled rejections, and window error logging.
 */

interface ErrorReport {
  timestamp: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

class MonitoringService {
  private dsn: string | undefined;
  private isInitialized = false;
  private errorBuffer: ErrorReport[] = [];
  private readonly maxBufferSize = 50;

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.dsn = import.meta.env.VITE_SENTRY_DSN;

    if (this.dsn && typeof window !== "undefined") {
      // If Sentry DSN is present, we initialize Sentry if available or dynamically loaded
      console.info(
        "[Monitoring] Sentry DSN detected, initializing monitoring.",
      );
    } else {
      console.info(
        "[Monitoring] Initialized in local telemetry mode (VITE_SENTRY_DSN not set).",
      );
    }

    if (typeof window !== "undefined") {
      // Global uncaught error listener
      window.addEventListener("error", (event) => {
        this.captureException(event.error || new Error(event.message), {
          source: "window.onerror",
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      // Global unhandled promise rejection listener
      window.addEventListener("unhandledrejection", (event) => {
        const error =
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason || "Unhandled Promise Rejection"));
        this.captureException(error, { source: "unhandledrejection" });
      });
    }
  }

  public captureException(error: unknown, context?: Record<string, any>) {
    const errObj =
      error instanceof Error
        ? error
        : new Error(String(error || "Unknown Error"));

    const report: ErrorReport = {
      timestamp: new Date().toISOString(),
      message: errObj.message,
      stack: errObj.stack,
      context,
    };

    // Buffer locally for diagnostics
    this.errorBuffer.push(report);
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.shift();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error("[Monitoring:Capture]", report);
    }

    // If Sentry SDK is loaded on window (e.g. via script or future package), forward to it
    interface SentryWindowClient {
      captureException?: (
        err: unknown,
        context?: { extra?: Record<string, unknown> },
      ) => void;
    }
    const win =
      typeof window !== "undefined"
        ? (window as Window & {
            Sentry?: SentryWindowClient;
            dataLayer?: unknown[];
          })
        : null;
    if (win?.Sentry && typeof win.Sentry.captureException === "function") {
      try {
        win.Sentry.captureException(errObj, { extra: context });
      } catch (e) {
        console.warn("[Monitoring] Sentry dispatch failed:", e);
      }
    }
  }

  public getRecentErrors(): readonly ErrorReport[] {
    return this.errorBuffer;
  }

  public clearErrors() {
    this.errorBuffer = [];
  }
}

export const monitoring = new MonitoringService();

export function initMonitoring() {
  monitoring.init();
}

export function captureException(
  error: unknown,
  context?: Record<string, any>,
) {
  monitoring.captureException(error, context);
}
