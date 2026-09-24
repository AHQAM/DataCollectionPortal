import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KpiCardsGrid } from "../components/admin/dashboard/KpiCardsGrid";
import { DashboardBanner } from "../components/admin/dashboard/DashboardBanner";
import { User } from "../types";

const mockUsers: User[] = [
  {
    userId: "u-1",
    userNo: "REP-1",
    userNameAr: "مندوب 1",
    userNameEn: "Rep 1",
    role: "REP",
    branchId: "b-1",
    regionNo: "R-1",
    allowedRegionNos: ["R-1"],
    isActive: true,
    mustChangePassword: false,
    maxAllowedDevices: 1,
  },
  {
    userId: "u-2",
    userNo: "REP-2",
    userNameAr: "مندوب 2",
    userNameEn: "Rep 2",
    role: "REP",
    branchId: "b-1",
    regionNo: "R-2",
    allowedRegionNos: ["R-2"],
    isActive: true,
    mustChangePassword: false,
    maxAllowedDevices: 1,
  },
] as unknown as User[];

describe("Dashboard Modular Components", () => {
  describe("KpiCardsGrid", () => {
    it("renders KPI metrics properly in Arabic", () => {
      render(
        <KpiCardsGrid
          lang="ar"
          activeRequests={5}
          draftRequests={2}
          overallPercentage={75}
          totalAssignedRecords={100}
          completedRecords={75}
          pendingRecords={25}
          users={mockUsers}
          lockedUsersCount={1}
        />,
      );

      expect(screen.getByText("الطلبات النشطة")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("نسبة الإنجاز الكلية")).toBeInTheDocument();
      expect(screen.getByText("75%")).toBeInTheDocument();
      expect(screen.getByText("إجمالي السجلات")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("75 مكتمل")).toBeInTheDocument();
      expect(screen.getByText("25 معلق")).toBeInTheDocument();
      expect(screen.getByText("1 مقفل")).toBeInTheDocument();
    });

    it("renders KPI metrics properly in English", () => {
      render(
        <KpiCardsGrid
          lang="en"
          activeRequests={12}
          draftRequests={4}
          overallPercentage={50}
          totalAssignedRecords={200}
          completedRecords={100}
          pendingRecords={100}
          users={mockUsers}
          lockedUsersCount={0}
        />,
      );

      expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
      expect(screen.getByText("Overall Completion")).toBeInTheDocument();
      expect(screen.getByText("Total Records")).toBeInTheDocument();
      expect(screen.getByText("Security & Access")).toBeInTheDocument();
      expect(screen.queryByText(/locked/i)).not.toBeInTheDocument();
    });
  });

  describe("DashboardBanner", () => {
    it("renders banner content and handles navigation in Arabic", () => {
      const onNavigate = vi.fn();
      render(<DashboardBanner lang="ar" onNavigate={onNavigate} />);

      expect(screen.getByText("لوحة القيادة المركزية")).toBeInTheDocument();
      expect(
        screen.getByText("بوابة جمع البيانات الميدانية"),
      ).toBeInTheDocument();

      fireEvent.click(screen.getByText("إدارة الفروع والمناطق"));
      expect(onNavigate).toHaveBeenCalledWith("branches");

      fireEvent.click(screen.getByText("إنشاء طلب جديد"));
      expect(onNavigate).toHaveBeenCalledWith("requests");

      fireEvent.click(screen.getByText("إعدادات النظام وقاعدة البيانات"));
      expect(onNavigate).toHaveBeenCalledWith("settings");
    });

    it("renders banner in English", () => {
      const onNavigate = vi.fn();
      render(<DashboardBanner lang="en" onNavigate={onNavigate} />);

      expect(screen.getByText("Executive Dashboard")).toBeInTheDocument();
      expect(
        screen.getByText("Dynamic Data Collection Portal"),
      ).toBeInTheDocument();
      expect(screen.getByText("Branches & Zones")).toBeInTheDocument();
      expect(screen.getByText("New Request")).toBeInTheDocument();
    });
  });
});
