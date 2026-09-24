import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SupervisorGridView } from "../components/admin/supervisor-matrix/SupervisorGridView";
import { AddSupervisorModal } from "../components/admin/supervisor-matrix/AddSupervisorModal";
import { User, Region, Branch } from "../types";

describe("Supervisor Matrix Presentation Components", () => {
  const mockBranches: Branch[] = [
    {
      branchId: "b-1",
      branchNameAr: "فرع الرياض",
      branchNameEn: "Riyadh Branch",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockRegions: Region[] = [
    {
      regionId: "r-1",
      regionNo: "101",
      regionNameAr: "شمال الرياض",
      regionNameEn: "North Riyadh",
      branchId: "b-1",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockSupervisors: User[] = [
    {
      userId: "sup-1",
      userNo: "SUP-01",
      userNameAr: "أحمد المشرف",
      userNameEn: "Ahmed Supervisor",
      role: "SUPERVISOR",
      branchId: "b-1",
      regionNo: "101",
      allowedRegionNos: ["101"],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as User,
  ];

  describe("SupervisorGridView", () => {
    it("renders cross-matrix table and toggles region supervision", () => {
      const onToggle = vi.fn();

      render(
        <SupervisorGridView
          supervisors={mockSupervisors}
          regions={mockRegions}
          lang="ar"
          onToggleRegion={onToggle}
        />,
      );

      expect(
        screen.getByText("جدول التقاطع (المشرفين × المناطق الميدانية)"),
      ).toBeDefined();
      expect(screen.getByText("أحمد المشرف")).toBeDefined();
      expect(screen.getByText("101")).toBeDefined();

      const checkIcon = screen
        .getByText("أحمد المشرف")
        .closest("tr")
        ?.querySelector("td:nth-child(3)");
      if (checkIcon) {
        fireEvent.click(checkIcon);
        expect(onToggle).toHaveBeenCalledWith(mockSupervisors[0], "101");
      }
    });

    it("renders in English properly", () => {
      render(
        <SupervisorGridView
          supervisors={mockSupervisors}
          regions={mockRegions}
          lang="en"
          onToggleRegion={vi.fn()}
        />,
      );

      expect(
        screen.getByText("Cross Matrix (Supervisors × Field Zones)"),
      ).toBeDefined();
    });
  });

  describe("AddSupervisorModal", () => {
    it("does not render when isOpen is false", () => {
      const { container } = render(
        <AddSupervisorModal
          isOpen={false}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          branches={mockBranches}
          lang="ar"
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders form, fills inputs, and submits new supervisor data", () => {
      const onSubmit = vi.fn();
      const onClose = vi.fn();

      render(
        <AddSupervisorModal
          isOpen={true}
          onClose={onClose}
          onSubmit={onSubmit}
          branches={mockBranches}
          lang="ar"
        />,
      );

      expect(screen.getByText("إضافة مشرف ميداني جديد")).toBeDefined();

      const nameArInput = screen.getByPlaceholderText(
        "مثال: م. عبدالله القحطاني",
      );
      const userNoInput = screen.getByPlaceholderText("مثال: SUP-101");
      const mobileInput = screen.getByPlaceholderText("05XXXXXXXX");

      fireEvent.change(nameArInput, { target: { value: "فهد العتيبي" } });
      fireEvent.change(userNoInput, { target: { value: "SUP-05" } });
      fireEvent.change(mobileInput, { target: { value: "0555555555" } });

      const submitBtn = screen.getByText("إضافة المشرف");
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalledWith({
        userNameAr: "فهد العتيبي",
        userNameEn: "",
        userNo: "SUP-05",
        branchId: "b-1",
        mobile: "0555555555",
      });
    });
  });
});
