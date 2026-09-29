import React from "react";

/**
 * Enhanced React.lazy wrapper that handles dynamic import failures,
 * stale chunk hashes following new deployments, and safe named/default export resolution.
 *
 * If a chunk fails to load or returns an unexpected response (such as an SPA fallback HTML
 * after a new deployment has replaced older hashed chunk files), this wrapper automatically
 * reloads the page once to retrieve the latest HTML and asset references.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<any>,
  exportName?: string,
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    const retryKey = `chunk_retry_${exportName || "default"}`;

    try {
      const module = await factory();
      const Component = exportName
        ? (module?.[exportName] ?? module?.default)
        : (module?.default ?? module);

      if (!Component) {
        throw new Error(
          `Module component "${exportName || "default"}" was not found in the dynamically loaded chunk.`,
        );
      }

      try {
        sessionStorage.removeItem(retryKey);
      } catch {
        // Safe fallback in restricted environments / private browsing
      }

      return { default: Component };
    } catch (err: any) {
      let isReloaded = false;
      try {
        isReloaded = !!sessionStorage.getItem(retryKey);
      } catch {
        // Safe fallback
      }

      const errorMessage = String(err?.message || err || "");
      const isChunkOrDeployError =
        errorMessage.includes("Failed to fetch dynamically imported module") ||
        errorMessage.includes("Cannot read properties of undefined") ||
        errorMessage.includes("Loading chunk") ||
        errorMessage.includes("not found in the dynamically loaded chunk") ||
        errorMessage.includes("MIME type") ||
        err?.name === "ChunkLoadError";

      if (
        !isReloaded &&
        isChunkOrDeployError &&
        typeof window !== "undefined"
      ) {
        try {
          sessionStorage.setItem(retryKey, "true");
        } catch {
          // Safe fallback
        }
        window.location.reload();
        // Return a never-resolving promise so React doesn't render an error screen while reloading
        return new Promise<{ default: T }>(() => {});
      }

      throw err;
    }
  });
}
