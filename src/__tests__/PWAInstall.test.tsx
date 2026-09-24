import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  renderHook,
  act,
} from "@testing-library/react";
import { PWAInstallBanner } from "../components/common/PWAInstallBanner";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { useUIStore } from "../stores/uiStore";

describe("PWA Install System", () => {
  beforeEach(() => {
    useUIStore.setState({ lang: "ar" });
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  describe("usePWAInstall Hook", () => {
    it("initializes with default values and responds to beforeinstallprompt and appinstalled", () => {
      const { result } = renderHook(() => usePWAInstall());

      expect(result.current.isInstalled).toBe(false);
      expect(result.current.isStandalone).toBe(false);
      expect(result.current.isInstallable).toBe(false);

      // Simulate beforeinstallprompt event
      const promptMock = vi.fn().mockResolvedValue(undefined);
      const fakeEvent = new Event("beforeinstallprompt") as any;
      fakeEvent.prompt = promptMock;
      fakeEvent.userChoice = Promise.resolve({
        outcome: "accepted",
        platform: "web",
      });

      act(() => {
        window.dispatchEvent(fakeEvent);
      });

      expect(result.current.isInstallable).toBe(true);

      // Trigger install()
      act(() => {
        result.current.install();
      });
      expect(promptMock).toHaveBeenCalled();

      // Simulate appinstalled event
      act(() => {
        window.dispatchEvent(new Event("appinstalled"));
      });

      expect(result.current.isInstalled).toBe(true);
      expect(result.current.isStandalone).toBe(true);
    });
  });

  describe("PWAInstallBanner Component", () => {
    it("renders nothing if app is already standalone or installed", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(display-mode: standalone)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(<PWAInstallBanner variant="banner" />);
      expect(container.firstChild).toBeNull();
    });

    it("renders banner variant and allows dismissing", () => {
      render(<PWAInstallBanner variant="banner" />);

      expect(
        screen.getByText("تطبيق جمع البيانات الميداني (PWA)"),
      ).toBeDefined();

      const dismissBtn = screen.getByTitle("إغلاق");
      fireEvent.click(dismissBtn);

      expect(
        screen.queryByText("تطبيق جمع البيانات الميداني (PWA)"),
      ).toBeNull();
    });

    it("renders button variant in Arabic and English", () => {
      const { rerender } = render(<PWAInstallBanner variant="button" />);
      expect(screen.getByText("تثبيت التطبيق")).toBeDefined();

      useUIStore.setState({ lang: "en" });
      rerender(<PWAInstallBanner variant="button" />);
      expect(screen.getByText("Install App")).toBeDefined();
    });

    it("renders card variant properly", () => {
      render(<PWAInstallBanner variant="card" />);
      expect(screen.getByText("تثبيت التطبيق على الجوال")).toBeDefined();
    });
  });
});
