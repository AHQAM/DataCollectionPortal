import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import { User } from "../../types";
import { ShieldCheck, Search, CheckCircle2, UserPlus } from "lucide-react";
import { SupervisorCardView } from "./supervisor-matrix/SupervisorCardView";
import { SupervisorGridView } from "./supervisor-matrix/SupervisorGridView";
import { AddSupervisorModal } from "./supervisor-matrix/AddSupervisorModal";

export const AdminSupervisorMatrix: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { lang, users, branches, regions, updateUser, createUser } = useApp();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  const [viewMode, setViewMode] = useState<"cards" | "grid">("cards");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranchFilter, setSelectedBranchFilter] =
    useState<string>("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAddSupervisorModal, setShowAddSupervisorModal] = useState(false);

  const supervisors = users.filter((u) => u.role === "SUPERVISOR");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter supervisors
  const filteredSupervisors = supervisors.filter((sup) => {
    if (
      selectedBranchFilter !== "ALL" &&
      sup.branchId !== selectedBranchFilter
    ) {
      // Also show if supervisor has any allowed region in that branch
      const hasRegionInBranch = regions.some(
        (r) =>
          r.branchId === selectedBranchFilter &&
          (sup.allowedRegionNos || []).includes(r.regionNo),
      );
      if (!hasRegionInBranch) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName =
        sup.userNameAr.toLowerCase().includes(q) ||
        (sup.userNameEn || "").toLowerCase().includes(q);
      const matchNo = (sup.userNo || "").toLowerCase().includes(q);
      const matchUsername = sup.username.toLowerCase().includes(q);
      if (!matchName && !matchNo && !matchUsername) return false;
    }
    return true;
  });

  // Toggle single region for a supervisor
  const handleToggleRegion = (supervisor: User, regionNo: string) => {
    const current = supervisor.allowedRegionNos || [];
    let updated: string[];
    if (current.includes(regionNo)) {
      updated = current.filter((r) => r !== regionNo);
    } else {
      updated = [...current, regionNo];
    }

    updateUser({ ...supervisor, allowedRegionNos: updated });
    showToast(
      t("supervisors.toastUpdated", {
        name: supervisor.userNameAr,
        lng: currentLang,
      }),
    );
  };

  // Bulk select all regions of a branch for a supervisor
  const handleSelectAllInBranch = (supervisor: User, branchId: string) => {
    const branchRegionNos = regions
      .filter((r) => r.branchId === branchId)
      .map((r) => r.regionNo);
    const current = supervisor.allowedRegionNos || [];
    const combined = Array.from(new Set([...current, ...branchRegionNos]));

    updateUser({ ...supervisor, allowedRegionNos: combined });
    showToast(
      t("supervisors.toastAssignedBranch", {
        name: supervisor.userNameAr,
        lng: currentLang,
      }),
    );
  };

  // Bulk deselect all regions of a branch for a supervisor
  const handleDeselectAllInBranch = (supervisor: User, branchId: string) => {
    const branchRegionNos = new Set(
      regions.filter((r) => r.branchId === branchId).map((r) => r.regionNo),
    );
    const current = supervisor.allowedRegionNos || [];
    const filtered = current.filter((rNo) => !branchRegionNos.has(rNo));

    updateUser({ ...supervisor, allowedRegionNos: filtered });
    showToast(
      t("supervisors.toastRemovedBranch", {
        name: supervisor.userNameAr,
        lng: currentLang,
      }),
    );
  };

  // Clear all regions for a supervisor
  const handleClearAllRegions = (supervisor: User) => {
    updateUser({ ...supervisor, allowedRegionNos: [] });
    showToast(
      t("supervisors.toastCleared", {
        name: supervisor.userNameAr,
        lng: currentLang,
      }),
    );
  };

  // Grant all regions in the entire company
  const handleGrantAllCompanyRegions = (supervisor: User) => {
    const allNos = regions.map((r) => r.regionNo);
    updateUser({ ...supervisor, allowedRegionNos: allNos });
    showToast(
      t("supervisors.toastGrantedAll", {
        name: supervisor.userNameAr,
        lng: currentLang,
      }),
    );
  };

  // Create new supervisor
  const handleCreateSupervisor = (data: {
    userNameAr: string;
    userNameEn: string;
    userNo: string;
    branchId: string;
    mobile: string;
  }) => {
    const branch = branches.find((b) => b.branchId === data.branchId);
    const generatedUsername = `sup_${data.userNo || Date.now().toString().slice(-4)}`;

    const newSupervisor: User = {
      userId: `usr_${Date.now()}`,
      username: generatedUsername,
      regionNo: "",
      allowedRegionNos: [],
      userNo: data.userNo,
      userNameAr: data.userNameAr,
      userNameEn: data.userNameEn,
      branchId: data.branchId,
      branchNameAr: branch?.branchNameAr,
      branchNameEn: branch?.branchNameEn,
      role: "SUPERVISOR",
      mobile: data.mobile,
      mustChangePassword: false,
      isActive: true,
      failedLoginCount: 0,
      sessionVersion: 1,
      deviceBindingStatus: "UNBOUND",
      maxAllowedDevices: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createUser(newSupervisor);
    setShowAddSupervisorModal(false);
    showToast(
      t("supervisors.toastCreated", {
        name: data.userNameAr,
        lng: currentLang,
      }),
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>{t("supervisors.title", { lng: currentLang })}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {t("supervisors.subtitle", { lng: currentLang })}
          </p>
        </div>

        {/* View toggles & Add Supervisor */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-purple-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("supervisors.cardsTab", { lng: currentLang })}
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-purple-950 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("supervisors.gridTab", { lng: currentLang })}
            </button>
          </div>

          <button
            onClick={() => setShowAddSupervisorModal(true)}
            className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>
              {t("supervisors.newSupervisorBtn", { lng: currentLang })}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">
            {t("supervisors.totalSupervisors", { lng: currentLang })}
          </div>
          <div className="text-2xl font-black text-purple-950 mt-1">
            {supervisors.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">
            {t("supervisors.totalBranches", { lng: currentLang })}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {branches.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">
            {t("supervisors.totalRegions", { lng: currentLang })}
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {regions.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500">
            {t("supervisors.activeZones", { lng: currentLang })}
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {new Set(supervisors.flatMap((s) => s.allowedRegionNos || [])).size}{" "}
            / {regions.length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("supervisors.searchPlaceholder", {
              lng: currentLang,
            })}
            className="w-full h-10 ps-9 pe-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">
            {t("supervisors.filterBranch", { lng: currentLang })}
          </span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-600"
          >
            <option value="ALL">
              {t("supervisors.allBranches", { lng: currentLang })}
            </option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {currentLang === "ar" ? b.branchNameAr : b.branchNameEn} (
                {b.branchId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View 1: Supervisor Cards View */}
      {viewMode === "cards" && (
        <SupervisorCardView
          supervisors={filteredSupervisors}
          branches={branches}
          regions={regions}
          lang={lang}
          onToggleRegion={handleToggleRegion}
          onSelectAllInBranch={handleSelectAllInBranch}
          onDeselectAllInBranch={handleDeselectAllInBranch}
          onClearAllRegions={handleClearAllRegions}
          onGrantAllCompanyRegions={handleGrantAllCompanyRegions}
        />
      )}

      {/* View 2: 2D Matrix Grid View */}
      {viewMode === "grid" && (
        <SupervisorGridView
          supervisors={filteredSupervisors}
          regions={regions}
          lang={lang}
          onToggleRegion={handleToggleRegion}
        />
      )}

      {/* Add Supervisor Modal */}
      <AddSupervisorModal
        isOpen={showAddSupervisorModal}
        onClose={() => setShowAddSupervisorModal(false)}
        onSubmit={handleCreateSupervisor}
        branches={branches}
        lang={lang}
      />
    </div>
  );
};
