import "@testing-library/jest-dom/vitest";
import i18n from "./i18n";
import { beforeEach } from "vitest";

beforeEach(async () => {
  if (i18n.language !== "ar") {
    await i18n.changeLanguage("ar");
  }
});

// Polyfill window.matchMedia for JSDOM
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
