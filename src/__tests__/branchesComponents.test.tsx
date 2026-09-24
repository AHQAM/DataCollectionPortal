import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BranchesHeader } from "../components/admin/branches/BranchesHeader";
import { BranchStatsHeader } from "../components/admin/branches/BranchStatsHeader";
import { BranchesTabsAndFilters } from "../components/admin/branches/BranchesTabsAndFilters";
import { BranchesListView } from "../components/admin/branches/BranchesListView";
import { RegionsListView } from "../components/admin/branches/RegionsListView";
import { BranchModal } from "../components/admin/modals/BranchModal";
import { RegionModal } from "../components/admin/modals/RegionModal";
import { Branch, Region, User, RecordItem } from "../types";

describe("Branches & Regions Presentation Components", () => {
  const mockBranches: Branch[] = [
    {
      branchId: "b-1",
      branchNameAr: "فرع الرياض",
      branchNameEn: "Riyadh Branch",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      branchId: "b-2",
      branchNameAr: "فرع جدة",
      branchNameEn: "Jeddah Branch",
      isActive: false,
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
    {
      regionId: "r-2",
      regionNo: "102",
      regionNameAr: "جنوب الرياض",
      regionNameEn: "South Riyadh",
      branchId: "b-1",
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockUsers: User[] = [
    {
      userId: "u-1",
      userNo: "REP-1",
      userNameAr: "سالم",
      userNameEn: "Salem",
      role: "REP",
      branchId: "b-1",
      regionNo: "101",
      allowedRegionNos: ["101"],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as User,
    {
      userId: "u-2",
      userNo: "SUP-1",
      userNameAr: "أحمد",
      userNameEn: "Ahmed",
      role: "SUPERVISOR",
      branchId: "b-1",
      regionNo: "101",
      allowedRegionNos: ["101"],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as User,
  ];

  const mockRecords: RecordItem[] = [
    {
      recordId: "rec-1",
      requestId: "req-1",
      branchId: "b-1",
      regionNo: "101",
      recordStatus: "Completed",
      targetId: "T-1",
      targetName: "متجر 1",
      completionPercent: 100,
      rawData: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as RecordItem,
  ];

  describe("BranchesHeader", () => {
    it("renders correctly in Arabic with branches tab and triggers callbacks", () => {
      const onOpenExcel = vi.fn();
      const onAddBranch = vi.fn();
      const onAddRegion = vi.fn();

      render(
        <BranchesHeader
          lang="ar"
          activeTab="branches"
          onOpenExcelModal={onOpenExcel}
          onOpenAddBranch={onAddBranch}
          onOpenAddRegion={onAddRegion}
        />,
      );

      expect(screen.getByText("إدارة الفروع والمناطق الميدانية")).toBeDefined();
      expect(screen.getByText("إضافة فرع جديد")).toBeDefined();

      fireEvent.click(screen.getByText("استيراد الفروع والمناطق من Excel"));
      expect(onOpenExcel).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("إضافة فرع جديد"));
      expect(onAddBranch).toHaveBeenCalledTimes(1);
    });

    it("renders correctly in English with regions tab and triggers add region", () => {
      const onOpenExcel = vi.fn();
      const onAddBranch = vi.fn();
      const onAddRegion = vi.fn();

      render(
        <BranchesHeader
          lang="en"
          activeTab="regions"
          onOpenExcelModal={onOpenExcel}
          onOpenAddBranch={onAddBranch}
          onOpenAddRegion={onAddRegion}
        />,
      );

      expect(screen.getByText("Branches & Regions Management")).toBeDefined();
      expect(screen.getByText("New Region")).toBeDefined();

      fireEvent.click(screen.getByText("New Region"));
      expect(onAddRegion).toHaveBeenCalledTimes(1);
    });
  });

  describe("BranchStatsHeader", () => {
    it("renders statistical summaries accurately in Arabic and English", () => {
      const { rerender } = render(
        <BranchStatsHeader
          lang="ar"
          branches={mockBranches}
          regions={mockRegions}
          users={mockUsers}
          records={mockRecords}
        />,
      );

      expect(screen.getByText("إجمالي الفروع")).toBeDefined();
      expect(screen.getByText("المناطق الميدانية")).toBeDefined();
      expect(screen.getByText("المشرفين والمستخدمين")).toBeDefined();
      expect(screen.getByText("سجلات البيانات")).toBeDefined();

      rerender(
        <BranchStatsHeader
          lang="en"
          branches={mockBranches}
          regions={mockRegions}
          users={mockUsers}
          records={mockRecords}
        />,
      );

      expect(screen.getByText("Total Branches")).toBeDefined();
      expect(screen.getByText("Field Regions")).toBeDefined();
    });
  });

  describe("BranchesTabsAndFilters", () => {
    it("handles tab switching and search/filter changes", () => {
      const setActiveTab = vi.fn();
      const setSelectedBranchId = vi.fn();
      const setSearchQuery = vi.fn();

      render(
        <BranchesTabsAndFilters
          lang="ar"
          activeTab="branches"
          setActiveTab={setActiveTab}
          branches={mockBranches}
          regions={mockRegions}
          selectedBranchId=""
          setSelectedBranchId={setSelectedBranchId}
          searchQuery=""
          setSearchQuery={setSearchQuery}
        />,
      );

      const searchInput = screen.getByRole("textbox");
      fireEvent.change(searchInput, { target: { value: "رياض" } });
      expect(setSearchQuery).toHaveBeenCalledWith("رياض");
    });
  });

  describe("BranchesListView", () => {
    it("renders empty state when no branches are passed", () => {
      render(
        <BranchesListView
          lang="ar"
          branches={[]}
          regions={[]}
          users={[]}
          onOpenEditBranch={vi.fn()}
          onDeleteBranch={vi.fn()}
          onSelectBranchAndSwitchToRegions={vi.fn()}
          onOpenAddRegion={vi.fn()}
        />,
      );

      expect(screen.getByText("لا توجد فروع مطابقة للبحث")).toBeDefined();
    });

    it("renders branch cards and triggers edit/delete/addRegion callbacks", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const onSelect = vi.fn();
      const onAddRegion = vi.fn();

      render(
        <BranchesListView
          lang="ar"
          branches={mockBranches}
          regions={mockRegions}
          users={mockUsers}
          onOpenEditBranch={onEdit}
          onDeleteBranch={onDelete}
          onSelectBranchAndSwitchToRegions={onSelect}
          onOpenAddRegion={onAddRegion}
        />,
      );

      expect(screen.getByText("فرع الرياض")).toBeDefined();
      expect(screen.getByText("فرع جدة")).toBeDefined();

      const editButtons = screen.getAllByTitle("تعديل");
      fireEvent.click(editButtons[0]);
      expect(onEdit).toHaveBeenCalledWith(mockBranches[0]);

      const branchCard = screen.getByText("فرع الرياض").closest(".bg-white")!;
      const deleteBtn = branchCard.querySelector(
        "button:nth-child(2)",
      ) as HTMLButtonElement;
      if (deleteBtn) {
        fireEvent.click(deleteBtn);
        expect(onDelete).toHaveBeenCalledWith(mockBranches[0]);
      }
    });
  });

  describe("RegionsListView", () => {
    it("renders empty state and handles region actions", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      const { rerender } = render(
        <RegionsListView
          lang="ar"
          filteredRegions={[]}
          branches={mockBranches}
          users={mockUsers}
          records={mockRecords}
          onOpenEditRegion={onEdit}
          onDeleteRegion={onDelete}
        />,
      );

      expect(
        screen.getByText("لا توجد مناطق مطابقة لمعايير البحث"),
      ).toBeDefined();

      rerender(
        <RegionsListView
          lang="ar"
          filteredRegions={mockRegions}
          branches={mockBranches}
          users={mockUsers}
          records={mockRecords}
          onOpenEditRegion={onEdit}
          onDeleteRegion={onDelete}
        />,
      );

      expect(screen.getByText("شمال الرياض")).toBeDefined();
      const editButtons = screen.getAllByTitle("تعديل");
      fireEvent.click(editButtons[0]);
      expect(onEdit).toHaveBeenCalledWith(mockRegions[0]);

      const deleteButtons = screen.getAllByTitle("حذف");
      fireEvent.click(deleteButtons[0]);
      expect(onDelete).toHaveBeenCalledWith(mockRegions[0]);
    });
  });

  describe("BranchModal", () => {
    it("does not render when showModal is false", () => {
      const { container } = render(
        <BranchModal
          lang="ar"
          showModal={false}
          editingBranch={null}
          branchCode=""
          setBranchCode={vi.fn()}
          branchNameAr=""
          setBranchNameAr={vi.fn()}
          branchNameEn=""
          setBranchNameEn={vi.fn()}
          alertError={null}
          handleSaveBranch={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders form, shows errors, and handles submit and close", () => {
      const handleSave = vi.fn((e) => e.preventDefault());
      const onClose = vi.fn();
      const setCode = vi.fn();

      render(
        <BranchModal
          lang="ar"
          showModal={true}
          editingBranch={null}
          branchCode="RYD"
          setBranchCode={setCode}
          branchNameAr="الرياض"
          setBranchNameAr={vi.fn()}
          branchNameEn="Riyadh"
          setBranchNameEn={vi.fn()}
          alertError="كود الفرع مستخدم مسبقاً"
          handleSaveBranch={handleSave}
          onClose={onClose}
        />,
      );

      expect(screen.getByText("إضافة فرع جديد")).toBeDefined();
      expect(screen.getByText("كود الفرع مستخدم مسبقاً")).toBeDefined();

      const form = screen.getByText("حفظ الفرع").closest("form")!;
      fireEvent.submit(form);
      expect(handleSave).toHaveBeenCalled();

      const closeButtons = screen.getAllByRole("button");
      fireEvent.click(closeButtons[0]); // top X button
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("RegionModal", () => {
    it("does not render when showModal is false", () => {
      const { container } = render(
        <RegionModal
          lang="ar"
          showModal={false}
          editingRegion={null}
          regionNo=""
          setRegionNo={vi.fn()}
          regionNameAr=""
          setRegionNameAr={vi.fn()}
          regionNameEn=""
          setRegionNameEn={vi.fn()}
          regionBranchId=""
          setRegionBranchId={vi.fn()}
          branches={mockBranches}
          alertError={null}
          handleSaveRegion={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders edit state and triggers callbacks", () => {
      const handleSave = vi.fn((e) => e.preventDefault());
      const onClose = vi.fn();

      render(
        <RegionModal
          lang="ar"
          showModal={true}
          editingRegion={mockRegions[0]}
          regionNo="101"
          setRegionNo={vi.fn()}
          regionNameAr="شمال الرياض"
          setRegionNameAr={vi.fn()}
          regionNameEn="North Riyadh"
          setRegionNameEn={vi.fn()}
          regionBranchId="b-1"
          setRegionBranchId={vi.fn()}
          branches={mockBranches}
          alertError="رقم المنطقة مستخدم مسبقاً"
          handleSaveRegion={handleSave}
          onClose={onClose}
        />,
      );

      expect(screen.getByText("تعديل بيانات المنطقة")).toBeDefined();
      expect(screen.getByText("رقم المنطقة مستخدم مسبقاً")).toBeDefined();

      const saveBtn = screen.getByText("حفظ المنطقة");
      fireEvent.click(saveBtn);
      expect(handleSave).toHaveBeenCalled();
    });
  });
});
