import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthPortal } from "../components/common/AuthPortal";
import { useAuthStore } from "../stores/authStore";
import { useUIStore } from "../stores/uiStore";

describe("AuthPortal Component", () => {
  beforeEach(() => {
    useUIStore.setState({ lang: "ar", dir: "rtl" });
  });

  it("renders login form elements in Arabic and toggles language", () => {
    render(<AuthPortal />);

    expect(screen.getByText("بوابة جمع البيانات الميدانية")).toBeDefined();
    expect(screen.getByText("البريد الإلكتروني")).toBeDefined();
    expect(screen.getByText("كلمة المرور")).toBeDefined();

    // Toggle language
    const langBtn = screen.getByText("English");
    fireEvent.click(langBtn);

    expect(useUIStore.getState().lang).toBe("en");
    expect(screen.getByText("Field Data Collection Portal")).toBeDefined();
    expect(screen.getByText("Email Address")).toBeDefined();
  });

  it("shows error if email or password are empty upon submit", async () => {
    render(<AuthPortal />);

    const form = screen.getByText("تسجيل الدخول").closest("form")!;
    fireEvent.submit(form);

    expect(screen.getByText("يرجى إدخال البريد الإلكتروني")).toBeDefined();
  });

  it("calls login and handles failure message", async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      success: false,
      messageAr: "بيانات الاعتماد غير صحيحة",
      messageEn: "Invalid credentials",
    });

    useAuthStore.setState({ login: mockLogin });

    render(<AuthPortal />);

    const emailInput = screen.getByPlaceholderText("أدخل البريد الإلكتروني");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

    const submitBtn = screen.getByText("تسجيل الدخول");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@test.com", "wrongpass");
      expect(screen.getByText("بيانات الاعتماد غير صحيحة")).toBeDefined();
    });
  });

  it("handles successful login call", async () => {
    const mockLogin = vi.fn().mockResolvedValue({
      success: true,
      mustChangePassword: false,
    });

    useAuthStore.setState({ login: mockLogin });

    render(<AuthPortal />);

    const emailInput = screen.getByPlaceholderText("أدخل البريد الإلكتروني");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "admin@al-naqeeb.com" } });
    fireEvent.change(passwordInput, { target: { value: "correctpass" } });

    const submitBtn = screen.getByText("تسجيل الدخول");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "admin@al-naqeeb.com",
        "correctpass",
      );
    });
  });
});
