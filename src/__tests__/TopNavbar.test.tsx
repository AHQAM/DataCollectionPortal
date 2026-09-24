import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopNavbar } from "../components/common/TopNavbar";
import { useAuthStore } from "../stores/authStore";
import { useDataStore } from "../stores/dataStore";
import { useUIStore } from "../stores/uiStore";
import { User } from "../types";

describe("TopNavbar Component", () => {
  const adminUser = {
    userId: "admin-1",
    userNo: "ADM-001",
    userNameAr: "مدير النظام",
    userNameEn: "System Administrator",
    role: "ADMIN" as const,
    branchId: "b-1",
    regionNo: "101",
    allowedRegionNos: ["101"],
    isActive: true,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as User;

  const repUser = {
    userId: "rep-1",
    userNo: "REP-001",
    userNameAr: "مندوب تجريبي",
    userNameEn: "Test Representative",
    role: "REP" as const,
    branchId: "b-1",
    regionNo: "101",
    allowedRegionNos: ["101"],
    isActive: true,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as User;

  beforeEach(() => {
    useUIStore.setState({
      lang: "ar",
      dir: "rtl",
      notifications: [
        {
          notificationId: "n-1",
          userId: "admin-1",
          titleAr: "إشعار جديد",
          titleEn: "New Notification",
          bodyAr: "تم استلام استبيان جديد",
          bodyEn: "New survey received",
          notificationType: "NEW_REQUEST",
          channel: "PUSH",
          status: "SENT",
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
    });
    useDataStore.setState({
      users: [adminUser, repUser],
    });
    useAuthStore.setState({
      currentUser: adminUser,
      logout: vi.fn(),
      quickSwitchUser: vi.fn(),
    });
  });

  it("renders navbar header and switches language", () => {
    render(<TopNavbar />);

    expect(screen.getByText("بوابة جمع البيانات الميدانية")).toBeDefined();

    // Toggle language
    const langBtn = screen.getByText("English");
    fireEvent.click(langBtn);

    expect(useUIStore.getState().lang).toBe("en");
    expect(screen.getByText("Field Data Collection Portal")).toBeDefined();
  });

  it("shows QA Quick Role Switcher for Admin user and switches user", () => {
    const quickSwitchMock = vi.fn();
    useAuthStore.setState({ quickSwitchUser: quickSwitchMock });

    render(<TopNavbar />);

    const qaRoleBtn = screen.getByTitle("تبديل الأدوار للتجربة السريعة (QA)");
    fireEvent.click(qaRoleBtn);

    expect(
      screen.getByText("تبديل الحساب السريع لاختبار النظام"),
    ).toBeDefined();
    expect(screen.getByText("مندوب تجريبي")).toBeDefined();

    fireEvent.click(screen.getByText("مندوب تجريبي"));
    expect(quickSwitchMock).toHaveBeenCalledWith("rep-1");
  });

  it("opens broadcast notification modal when broadcast button is clicked", () => {
    render(<TopNavbar />);

    const broadcastBtn = screen.getByTitle("إرسال إشعار عام (FCM)");
    fireEvent.click(broadcastBtn);

    expect(screen.getByText("بث إشعار عام (FCM)")).toBeDefined();

    // Close modal
    const closeBtns = screen.getAllByRole("button");
    const modalClose = closeBtns.find((b) => b.querySelector("svg.lucide-x"));
    if (modalClose) {
      fireEvent.click(modalClose);
    }
  });

  it("displays notifications menu with unread badge and handles bell click", () => {
    render(<TopNavbar />);

    // Unread count badge '1'
    expect(screen.getByText("1")).toBeDefined();

    // Click bell icon
    const bellBtn = screen.getByText("1").closest("button");
    if (bellBtn) {
      fireEvent.click(bellBtn);
      expect(screen.getByText("إشعارات النظام")).toBeDefined();
      expect(screen.getByText("إشعار جديد")).toBeDefined();
      expect(screen.getByText("تم استلام استبيان جديد")).toBeDefined();
    }
  });

  it("triggers logout when logout button is clicked", () => {
    const logoutMock = vi.fn();
    useAuthStore.setState({ logout: logoutMock });

    render(<TopNavbar />);

    const logoutBtn = screen.getByTitle("تسجيل الخروج");
    fireEvent.click(logoutBtn);

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
