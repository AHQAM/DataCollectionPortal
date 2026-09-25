import React from "react";
import { X } from "lucide-react";
import { UserRole, Branch, Region } from "../../../types";
import i18n from "../../../i18n";

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "ar" | "en";
  branches: Branch[];
  regions: Region[];

  newRole: UserRole;
  setNewRole: (val: UserRole) => void;
  newRegionNo: string;
  setNewRegionNo: (val: string) => void;
  newRepNo: string;
  setNewRepNo: (val: string) => void;
  newRepNameAr: string;
  setNewRepNameAr: (val: string) => void;
  newRepNameEn: string;
  setNewRepNameEn: (val: string) => void;
  newBranchId: string;
  setNewBranchId: (val: string) => void;
  newAllowedRegions: string[];
  setNewAllowedRegions: (val: string[]) => void;
  newPermissions: {
    canManageUsers: boolean;
    canManageRequests: boolean;
    canManageRegions: boolean;
    canViewAllBranches: boolean;
  };
  setNewPermissions: (val: any) => void;

  onSubmit: (e: React.FormEvent) => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  lang,
  branches,
  regions,
  newRole,
  setNewRole,
  newRegionNo,
  setNewRegionNo,
  newRepNo,
  setNewRepNo,
  newRepNameAr,
  setNewRepNameAr,
  newRepNameEn,
  setNewRepNameEn,
  newBranchId,
  setNewBranchId,
  newAllowedRegions,
  setNewAllowedRegions,
  newPermissions,
  setNewPermissions,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="font-extrabold text-sm text-slate-900">
            {i18n.t("auto.createNewUserAccount")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {i18n.t("auto.role")}
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              >
                <option value="REP">
                  {i18n.t("auto.fieldUserDataCollector")}
                </option>
                <option value="SUPERVISOR">
                  {i18n.t("auto.branchSupervisor")}
                </option>
                <option value="ADMIN">
                  {i18n.t("auto.systemAdmin")}
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {i18n.t("auto.branch")}
              </label>
              <select
                value={newBranchId}
                onChange={(e) => setNewBranchId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              >
                {branches.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {lang === "ar" ? b.branchNameAr : b.branchNameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {lang === "ar"
                  ? newRole === "REP"
                    ? "رقم المنطقة (اسم الدخول)"
                    : "البريد الإلكتروني (اسم الدخول)"
                  : newRole === "REP"
                    ? "Primary Region No"
                    : "Email Address"}
              </label>
              <input
                type={newRole === "REP" ? "text" : "email"}
                value={newRegionNo}
                onChange={(e) => {
                  setNewRegionNo(e.target.value);
                  if (newRole === "REP") {
                    setNewRepNo(`REP-${e.target.value}`);
                    setNewAllowedRegions([e.target.value]);
                  }
                }}
                placeholder={
                  newRole === "REP" ? "مثال: 109" : "email@example.com"
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
                required
              />
            </div>

            {newRole === "REP" && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {i18n.t("auto.userNo")}
                </label>
                <input
                  type="text"
                  value={newRepNo}
                  onChange={(e) => setNewRepNo(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.userNameArabic")}
            </label>
            <input
              type="text"
              value={newRepNameAr}
              onChange={(e) => setNewRepNameAr(e.target.value)}
              placeholder="مثال: عبد الرحمن المجيدي"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.userNameEnglish")}
            </label>
            <input
              type="text"
              value={newRepNameEn}
              onChange={(e) => setNewRepNameEn(e.target.value)}
              placeholder="e.g. Abdulrahman Al-Majeedi"
              className="w-full h-10 px-3 rounded-xl border border-slate-300"
            />
          </div>

          {/* Multi-Region Assignment Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.authorizedRegions")}
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-32 overflow-y-auto">
              {regions.map((reg) => {
                const isChecked = newAllowedRegions.includes(reg.regionNo);
                return (
                  <label
                    key={reg.regionNo}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                      isChecked
                        ? "bg-purple-900 text-white border-purple-900"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewAllowedRegions([
                            ...newAllowedRegions,
                            reg.regionNo,
                          ]);
                        } else {
                          setNewAllowedRegions(
                            newAllowedRegions.filter((r) => r !== reg.regionNo),
                          );
                        }
                      }}
                      className="hidden"
                    />
                    #{reg.regionNo}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Granular Permissions for Supervisor */}
          {newRole === "SUPERVISOR" && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-700 mb-2">
                {i18n.t("auto.supervisorGranularPermissions")}
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPermissions.canManageUsers}
                    onChange={(e) =>
                      setNewPermissions({
                        ...newPermissions,
                        canManageUsers: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                  />
                  {i18n.t("auto.manageUsersReps")}
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPermissions.canManageRequests}
                    onChange={(e) =>
                      setNewPermissions({
                        ...newPermissions,
                        canManageRequests: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                  />
                  {i18n.t("auto.manageRequestsForms")}
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPermissions.canManageRegions}
                    onChange={(e) =>
                      setNewPermissions({
                        ...newPermissions,
                        canManageRegions: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                  />
                  {i18n.t("auto.manageRegionsAssignments")}
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPermissions.canViewAllBranches}
                    onChange={(e) =>
                      setNewPermissions({
                        ...newPermissions,
                        canViewAllBranches: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-700 rounded border-slate-300 focus:ring-purple-600"
                  />
                  {i18n.t("auto.viewAllBranchesData")}
                </label>
              </div>
            </div>
          )}

          <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 space-y-1">
            <span className="font-bold">ملاحظات الأمان الإلزامية:</span>
            <div>• يتم إنشاء كلمة مرور مؤقتة وفريدة للحساب الجديد.</div>
            <div>• الحساب مفروض عليه تغيير كلمة المرور فور أول تسجيل دخول.</div>
            <div>
              • سيتم ربط الحساب تلقائياً بأول هاتف يتم تسجيل الدخول منه.
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              {i18n.t("auto.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 h-10 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold"
            >
              {i18n.t("auto.createUser")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
