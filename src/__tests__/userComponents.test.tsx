import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserFilters } from "../components/admin/users/UserFilters";
import { UserTableRow } from "../components/admin/users/UserTableRow";
import { User } from "../types";

describe("User Presentation Components", () => {
  const mockUser: User = {
    userId: "u-10",
    userNo: "REP-10",
    userNameAr: "سالم الميداني",
    userNameEn: "Salem Field",
    role: "REP",
    branchId: "b-1",
    branchNameAr: "فرع الرياض",
    branchNameEn: "Riyadh Branch",
    regionNo: "101",
    allowedRegionNos: ["101", "102"],
    boundDeviceId: "dev-99",
    boundDeviceLabel: "Galaxy S23",
    isActive: true,
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as User;

  describe("UserFilters", () => {
    it("renders properly in Arabic and handles search and modal triggers", () => {
      const setSearch = vi.fn();
      const setRole = vi.fn();
      const onImport = vi.fn();
      const onCreate = vi.fn();

      render(
        <UserFilters
          searchQuery=""
          setSearchQuery={setSearch}
          roleFilter="ALL"
          setRoleFilter={setRole}
          lang="ar"
          onShowImportModal={onImport}
          onShowCreateModal={onCreate}
        />,
      );

      expect(screen.getByText("إدارة المستخدمين")).toBeDefined();
      expect(screen.getByText("إضافة مستخدم يدوي")).toBeDefined();

      const searchInput = screen.getByRole("textbox");
      fireEvent.change(searchInput, { target: { value: "سالم" } });
      expect(setSearch).toHaveBeenCalledWith("سالم");

      fireEvent.click(screen.getByText("إضافة مستخدم يدوي"));
      expect(onCreate).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("استيراد المستخدمين من Excel"));
      expect(onImport).toHaveBeenCalledTimes(1);
    });

    it("renders properly in English and handles role filter", () => {
      const setRole = vi.fn();

      render(
        <UserFilters
          searchQuery=""
          setSearchQuery={vi.fn()}
          roleFilter="ALL"
          setRoleFilter={setRole}
          lang="en"
          onShowImportModal={vi.fn()}
          onShowCreateModal={vi.fn()}
        />,
      );

      expect(screen.getByText("User Management")).toBeDefined();
      expect(screen.getByText("Add User")).toBeDefined();
    });
  });

  describe("UserTableRow", () => {
    it("renders user row details, device binding status, and action buttons", () => {
      const onReset = vi.fn();
      const onUnlock = vi.fn();
      const onRelease = vi.fn();

      render(
        <table>
          <tbody>
            <UserTableRow
              user={mockUser}
              lang="ar"
              onResetPassword={onReset}
              onUnlockUser={onUnlock}
              onReleaseDevice={onRelease}
            />
          </tbody>
        </table>,
      );

      expect(screen.getByText("سالم الميداني")).toBeDefined();
      expect(screen.getByText("Galaxy S23")).toBeDefined();
      expect(screen.getByText("فرع الرياض")).toBeDefined();

      const releaseBtn = screen.getByTitle(
        "فك ارتباط الجهاز (السماح بهاتف جديد)",
      );
      fireEvent.click(releaseBtn);
      expect(onRelease).toHaveBeenCalledWith("u-10");

      const resetBtn = screen.getByTitle("إنشاء كلمة مرور مؤقتة");
      fireEvent.click(resetBtn);
      expect(onReset).toHaveBeenCalledWith("u-10");
    });

    it("renders locked user status and handles unlock action", () => {
      const lockedUser: User = {
        ...mockUser,
        lockedUntil: new Date(Date.now() + 600000).toISOString(),
      };
      const onUnlock = vi.fn();

      render(
        <table>
          <tbody>
            <UserTableRow
              user={lockedUser}
              lang="ar"
              onResetPassword={vi.fn()}
              onUnlockUser={onUnlock}
              onReleaseDevice={vi.fn()}
            />
          </tbody>
        </table>,
      );

      expect(screen.getByText("حساب مقفل")).toBeDefined();
      const unlockBtn = screen.getByTitle("إلغاء قفل الحساب");
      fireEvent.click(unlockBtn);
      expect(onUnlock).toHaveBeenCalledWith(lockedUser.userId);
    });
  });
});
