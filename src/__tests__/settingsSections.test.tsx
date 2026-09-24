import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsSecuritySection } from "../components/admin/settings/SettingsSecuritySection";
import { SettingsSupportSection } from "../components/admin/settings/SettingsSupportSection";

describe("Settings Presentational Sections", () => {
  describe("SettingsSecuritySection", () => {
    it("renders policy fields in Arabic and updates values", () => {
      const setMaxFailed = vi.fn();
      const setLockout = vi.fn();

      render(
        <SettingsSecuritySection
          lang="ar"
          maxFailedAttempts={3}
          setMaxFailedAttempts={setMaxFailed}
          lockoutDurationMinutes={15}
          setLockoutDurationMinutes={setLockout}
        />,
      );

      expect(
        screen.getByText("سياسة كلمات المرور وقفل الحسابات (القسم 5)"),
      ).toBeDefined();

      const numberInputs = screen.getAllByRole("spinbutton");
      fireEvent.change(numberInputs[0], { target: { value: "5" } });
      expect(setMaxFailed).toHaveBeenCalledWith(5);

      fireEvent.change(numberInputs[1], { target: { value: "30" } });
      expect(setLockout).toHaveBeenCalledWith(30);
    });

    it("renders policy fields in English", () => {
      render(
        <SettingsSecuritySection
          lang="en"
          maxFailedAttempts={3}
          setMaxFailedAttempts={vi.fn()}
          lockoutDurationMinutes={15}
          setLockoutDurationMinutes={vi.fn()}
        />,
      );

      expect(
        screen.getByText("Password & Lockout Security Policy"),
      ).toBeDefined();
      expect(
        screen.getByText("Max Failed Attempts Before Lockout"),
      ).toBeDefined();
    });
  });

  describe("SettingsSupportSection", () => {
    it("renders support contacts and updates phone, email, whatsapp", () => {
      const setPhone = vi.fn();
      const setEmail = vi.fn();
      const setWhatsapp = vi.fn();

      render(
        <SettingsSupportSection
          lang="ar"
          phone="920000000"
          setPhone={setPhone}
          email="support@al-naqeeb.com"
          setEmail={setEmail}
          whatsapp="0500000000"
          setWhatsapp={setWhatsapp}
        />,
      );

      expect(
        screen.getByText("قنوات التواصل والدعم الفني للمناديب"),
      ).toBeDefined();

      const inputs = screen.getAllByRole("textbox");
      fireEvent.change(inputs[0], { target: { value: "920011111" } });
      expect(setPhone).toHaveBeenCalledWith("920011111");

      fireEvent.change(inputs[1], { target: { value: "tech@al-naqeeb.com" } });
      expect(setEmail).toHaveBeenCalledWith("tech@al-naqeeb.com");

      fireEvent.change(inputs[2], { target: { value: "0555555555" } });
      expect(setWhatsapp).toHaveBeenCalledWith("0555555555");
    });
  });
});
