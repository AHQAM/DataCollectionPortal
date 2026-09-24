import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminDashboard } from "../components/admin/AdminDashboard";
import { useDataStore } from "../stores/dataStore";
import { useUIStore } from "../stores/uiStore";
import { RequestItem, RecordItem, User } from "../types";

describe("AdminDashboard Screen", () => {
  beforeEach(() => {
    useUIStore.setState({ lang: "ar" });
    useDataStore.setState({
      branches: [
        {
          branchId: "b-1",
          branchNameAr: "فرع الرياض",
          branchNameEn: "Riyadh Branch",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      requests: [
        {
          requestId: "req-1",
          requestCode: "REQ-001",
          titleAr: "حملة المسح الميداني",
          titleEn: "Field Survey Campaign",
          status: "Published",
          targetBranches: ["b-1"],
          targetRegions: ["R-1"],
          dueAt: new Date(Date.now() + 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as RequestItem,
      ],
      records: [
        {
          recordId: "rec-1",
          requestId: "req-1",
          branchId: "b-1",
          regionNo: "R-1",
          recordStatus: "Completed",
          targetId: "T-1",
          targetName: "متجر النور",
          completionPercent: 100,
          rawData: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as RecordItem,
      ],
      users: [
        {
          userId: "u-1",
          userNo: "REP-1",
          userNameAr: "سالم",
          userNameEn: "Salem",
          role: "REP",
          branchId: "b-1",
          regionNo: "R-1",
          allowedRegionNos: ["R-1"],
          isActive: true,
          mustChangePassword: false,
          maxAllowedDevices: 1,
        } as unknown as User,
      ],
      auditLogs: [
        {
          logId: "l-1",
          userId: "u-1",
          userName: "سالم",
          userRole: "REP",
          action: "RECORD_SUBMITTED",
          entityType: "RECORD",
          entityId: "rec-1",
          createdAt: new Date().toISOString(),
        },
      ],
    });
  });

  it("renders dashboard banner, KPI cards, branch progress, campaigns, and audit activity", () => {
    const onNavigate = vi.fn();
    render(<AdminDashboard onNavigate={onNavigate} />);

    // Banner
    expect(screen.getByText("لوحة القيادة المركزية")).toBeInTheDocument();

    // KPIs
    expect(screen.getByText("الطلبات النشطة")).toBeInTheDocument();
    expect(screen.getByText("نسبة الإنجاز الكلية")).toBeInTheDocument();

    // Branch Progress
    expect(
      screen.getByText("نسبة الإنجاز وتوزيع السجلات حسب الفرع"),
    ).toBeInTheDocument();
    expect(screen.getByText("فرع الرياض")).toBeInTheDocument();

    // Campaigns
    expect(screen.getByText("حالة الحملات الحالية")).toBeInTheDocument();
    expect(screen.getByText("حملة المسح الميداني")).toBeInTheDocument();

    // Audit
    expect(
      screen.getByText("سجل العمليات والنشاط الميداني اللحظي"),
    ).toBeInTheDocument();
    expect(screen.getByText("RECORD_SUBMITTED")).toBeInTheDocument();

    // Navigation trigger
    fireEvent.click(screen.getByText("التقارير التفصيلية"));
    expect(onNavigate).toHaveBeenCalledWith("reports");
  });

  it("renders dashboard properly in English", () => {
    useUIStore.setState({ lang: "en" });
    const onNavigate = vi.fn();
    render(<AdminDashboard onNavigate={onNavigate} />);

    expect(screen.getByText("Executive Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Completion by Branch")).toBeInTheDocument();
    expect(screen.getByText("Current Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Recent Field Audit Activity")).toBeInTheDocument();
  });
});
