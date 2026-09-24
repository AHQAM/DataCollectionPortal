import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AdminAuditLogs } from "../components/admin/AdminAuditLogs";
import { useDataStore } from "../stores/dataStore";
import { useUIStore } from "../stores/uiStore";
import { AuditLog } from "../types";

describe("AdminAuditLogs Component", () => {
  const mockLogs: AuditLog[] = [
    {
      logId: "log-1",
      userId: "u-1",
      userName: "سالم الميداني",
      userRole: "REP",
      action: "USER_LOGIN",
      entityType: "USER",
      entityId: "u-1",
      deviceId: "device-uuid-1234567890",
      detailsJson: '{"ip":"127.0.0.1"}',
      createdAt: new Date().toISOString(),
    },
    {
      logId: "log-2",
      userId: "admin-1",
      userName: "مدير النظام",
      userRole: "ADMIN",
      action: "REQUEST_PUBLISHED",
      entityType: "REQUEST",
      entityId: "req-99",
      details: { note: "Campaign started" },
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    useUIStore.setState({ lang: "ar" });
    useDataStore.setState({ auditLogs: mockLogs });
  });

  it("renders audit trail header and log rows in Arabic", () => {
    render(<AdminAuditLogs />);

    expect(
      screen.getByText("سجل التدقيق والرقابة الأمنية (Audit Trail)"),
    ).toBeDefined();
    expect(screen.getByText("سالم الميداني")).toBeDefined();
    expect(screen.getByText("مدير النظام")).toBeDefined();
    expect(screen.getAllByText("USER_LOGIN").length).toBeGreaterThan(0);
    expect(screen.getAllByText("REQUEST_PUBLISHED").length).toBeGreaterThan(0);
  });

  it("renders correctly in English", () => {
    useUIStore.setState({ lang: "en" });
    render(<AdminAuditLogs />);

    expect(screen.getByText("Security Audit Trail")).toBeDefined();
  });

  it("filters logs by search query", () => {
    render(<AdminAuditLogs />);

    const searchInput = screen.getByRole("textbox");
    fireEvent.change(searchInput, { target: { value: "سالم" } });

    expect(screen.getByText("سالم الميداني")).toBeDefined();
    expect(screen.queryByText("مدير النظام")).toBeNull();
  });

  it("filters logs by action dropdown", () => {
    render(<AdminAuditLogs />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "REQUEST_PUBLISHED" } });

    expect(screen.queryByText("سالم الميداني")).toBeNull();
    expect(screen.getByText("مدير النظام")).toBeDefined();
  });
});
