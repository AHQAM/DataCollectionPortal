import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { User, UserRole } from "../../types";
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Lock,
  Unlock,
  Smartphone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building,
  Layers,
  X,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { AdminUserImportModal } from "./AdminUserImportModal";
import { UserFilters } from "./users/UserFilters";
import { UserTableRow } from "./users/UserTableRow";
import { UserCreateModal } from "./users/UserCreateModal";

export const AdminUsers: React.FC = () => {
  const {
    lang,
    dir,
    t,
    users,
    branches,
    regions,
    deviceBindings,
    resetUserPassword,
    unlockUser,
    releaseUserDevice,
    createUser,
    updateUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New User Form State
  const [newRole, setNewRole] = useState<UserRole>("REP");
  const [newRegionNo, setNewRegionNo] = useState("");
  const [newRepNo, setNewRepNo] = useState("");
  const [newRepNameAr, setNewRepNameAr] = useState("");
  const [newRepNameEn, setNewRepNameEn] = useState("");
  const [newBranchId, setNewBranchId] = useState(branches[0]?.branchId || "");
  const [newAllowedRegions, setNewAllowedRegions] = useState<string[]>([]);
  const [newPermissions, setNewPermissions] = useState({
    canManageUsers: false,
    canManageRequests: false,
    canManageRegions: false,
    canViewAllBranches: false,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNameAr = u.userNameAr.toLowerCase().includes(q);
      const matchNameEn = (u.userNameEn || "").toLowerCase().includes(q);
      const matchReg = u.regionNo.includes(q);
      const matchRepNo = (u.userNo || "").toLowerCase().includes(q);
      if (!matchNameAr && !matchNameEn && !matchReg && !matchRepNo)
        return false;
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepNameAr.trim()) {
      alert(
        lang === "ar" ? "يرجى إدخال الاسم بالعربية" : "Arabic name is required",
      );
      return;
    }
    if (!newRegionNo.trim()) {
      alert(
        lang === "ar"
          ? "يرجى إدخال رقم المنطقة / البريد الإلكتروني"
          : "Region No. or Email is required",
      );
      return;
    }
    if (!newBranchId) {
      alert(lang === "ar" ? "يرجى اختيار الفرع" : "Please select a branch");
      return;
    }

    try {
      await createUser({
        role: newRole,
        regionNo: newRegionNo.trim(), // For REP: region number (login). For Admin/Supervisor: email.
        userNo: newRepNo.trim() || undefined,
        userNameAr: newRepNameAr.trim(),
        userNameEn: newRepNameEn.trim() || undefined,
        branchId: newBranchId,
        allowedRegionNos:
          newAllowedRegions.length > 0
            ? newAllowedRegions
            : [newRegionNo.trim()],
        permissions: newRole === "SUPERVISOR" ? newPermissions : undefined,
      });
      setShowCreateModal(false);
      showToast(
        lang === "ar"
          ? "تم إنشاء الحساب بنجاح (سيتم إصدار كلمة مرور مؤقتة)"
          : "User created. A temporary password will be issued.",
      );
      // Reset form
      setNewRegionNo("");
      setNewRepNo("");
      setNewRepNameAr("");
      setNewRepNameEn("");
      setNewAllowedRegions([]);
      setNewRole("REP");
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.details?.message ||
        err?.message ||
        (lang === "ar"
          ? "حدث خطأ أثناء إنشاء المستخدم"
          : "Error creating user");
      alert(msg);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 end-6 z-50 bg-purple-950 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-purple-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header, Search and Filters */}
      <UserFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        lang={lang}
        onShowImportModal={() => setShowImportModal(true)}
        onShowCreateModal={() => setShowCreateModal(true)}
      />

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "المستخدم" : "User"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "رقم المنطقة (اسم الدخول)" : "Region No"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "المناطق المصرحة" : "Allowed Regions"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "الفرع" : "Branch"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "الجهاز المعتمد" : "Bound Device"}
                </th>
                <th className="px-4 py-3 text-start">
                  {lang === "ar" ? "حالة الحساب" : "Account Status"}
                </th>
                <th className="px-4 py-3 text-center">
                  {lang === "ar" ? "الإجراءات الإدارية" : "Admin Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                return (
                  <UserTableRow
                    key={u.userId}
                    user={u}
                    lang={lang}
                    onResetPassword={(id) => {
                      void resetUserPassword(id).then((result) => {
                        showToast(
                          result.success
                            ? `${result.message}${result.temporaryPassword ? ` ${result.temporaryPassword}` : ""}`
                            : result.message,
                        );
                      });
                    }}
                    onUnlockUser={(id) => {
                      unlockUser(id);
                      showToast(
                        lang === "ar"
                          ? `تم إلغاء قفل الحساب`
                          : `Account unlocked`,
                      );
                    }}
                    onReleaseDevice={(id) => {
                      releaseUserDevice(id);
                      showToast(
                        lang === "ar"
                          ? `تم فك ارتباط الجهاز للحساب`
                          : `Device unlinked for account`,
                      );
                    }}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        lang={lang}
        branches={branches}
        regions={regions}
        newRole={newRole}
        setNewRole={setNewRole}
        newRegionNo={newRegionNo}
        setNewRegionNo={setNewRegionNo}
        newRepNo={newRepNo}
        setNewRepNo={setNewRepNo}
        newRepNameAr={newRepNameAr}
        setNewRepNameAr={setNewRepNameAr}
        newRepNameEn={newRepNameEn}
        setNewRepNameEn={setNewRepNameEn}
        newBranchId={newBranchId}
        setNewBranchId={setNewBranchId}
        newAllowedRegions={newAllowedRegions}
        setNewAllowedRegions={setNewAllowedRegions}
        newPermissions={newPermissions}
        setNewPermissions={setNewPermissions}
        onSubmit={handleCreateSubmit}
      />

      {/* Bulk Excel Import Modal */}
      <AdminUserImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={(count) =>
          showToast(
            lang === "ar"
              ? `تم استيراد ${count} مستخدم بنجاح (كلمات مرور مؤقتة مع إلزام التغيير فوراً)`
              : `Imported ${count} users successfully (temporary passwords, change required)`,
          )
        }
      />
    </div>
  );
};
