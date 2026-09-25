import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Branch, Region } from "../../types";
import { CheckCircle2 } from "lucide-react";

import { BranchModal } from "./modals/BranchModal";
import { RegionModal } from "./modals/RegionModal";
import { ExcelImportModal } from "./modals/ExcelImportModal";
import { BranchStatsHeader } from "./branches/BranchStatsHeader";
import { BranchesListView } from "./branches/BranchesListView";
import { RegionsListView } from "./branches/RegionsListView";
import { BranchesHeader } from "./branches/BranchesHeader";
import { BranchesTabsAndFilters } from "./branches/BranchesTabsAndFilters";

import { useBranchesExcelImport } from "../../hooks/useBranchesExcelImport";

export const AdminBranches: React.FC = () => {
  const {
    lang,
    branches,
    regions,
    users,
    records,
    createBranch,
    updateBranch,
    deleteBranch,
    createRegion,
    updateRegion,
    deleteRegion,
    importBranchesAndRegions,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"branches" | "regions">(
    "branches",
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchCode, setBranchCode] = useState("");
  const [branchNameAr, setBranchNameAr] = useState("");
  const [branchNameEn, setBranchNameEn] = useState("");

  const [showRegionModal, setShowRegionModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [regionNo, setRegionNo] = useState("");
  const [regionNameAr, setRegionNameAr] = useState("");
  const [regionNameEn, setRegionNameEn] = useState("");
  const [regionBranchId, setRegionBranchId] = useState("");

  const [alertError, setAlertError] = useState<string | null>(null);

  const {
    showExcelModal,
    setShowExcelModal,
    parsedBranches,
    setParsedBranches,
    parsedRegions,
    setParsedRegions,
    importMode,
    setImportMode,
    excelFileName,
    setExcelFileName,
    excelParseError,
    setExcelParseError,
    successMessage,
    setSuccessMessage,
    handleDownloadTemplate,
    handleFileUpload,
    handleConfirmImport,
  } = useBranchesExcelImport(lang, importBranchesAndRegions);

  // Branch handlers
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchCode(`BR-${Math.floor(100 + Math.random() * 900)}`);
    setBranchNameAr("");
    setBranchNameEn("");
    setShowBranchModal(true);
    setAlertError(null);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchCode(b.branchId);
    setBranchNameAr(b.branchNameAr);
    setBranchNameEn(b.branchNameEn);
    setShowBranchModal(true);
    setAlertError(null);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchNameAr.trim()) {
      setAlertError(
        t("auto.pleaseEnterBranchArabic"),
      );
      return;
    }

    try {
      if (editingBranch) {
        await updateBranch(editingBranch.branchId, {
          branchNameAr: branchNameAr.trim(),
          branchNameEn: branchNameEn.trim() || branchNameAr.trim(),
        });
        setSuccessMessage(
          t("auto.branchUpdatedSuccessfully"),
        );
      } else {
        const code = branchCode.trim().toUpperCase();
        if (branches.some((b) => b.branchId === code)) {
          setAlertError(
            t("auto.branchIdAlreadyExists"),
          );
          return;
        }
        await createBranch({
          branchId: code,
          branchNameAr: branchNameAr.trim(),
          branchNameEn: branchNameEn.trim() || branchNameAr.trim(),
        });
        setSuccessMessage(
          t("auto.newBranchCreatedSuccessfully"),
        );
      }
    } catch (err) {
      console.error(err);
      setAlertError(
        t("auto.errorSavingBranch"),
      );
      return;
    }

    setShowBranchModal(false);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDeleteBranch = async (b: Branch) => {
    if (
      window.confirm(
        lang === "ar"
          ? `هل أنت متأكد من حذف ${b.branchNameAr}؟`
          : `Delete branch ${b.branchNameEn}?`,
      )
    ) {
      const res = await deleteBranch(b.branchId);
      if (!res.success) {
        alert(res.message || "Cannot delete");
      } else {
        setSuccessMessage(
          t("auto.branchDeleted"),
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Region handlers
  const handleOpenAddRegion = (presetBranchId?: string) => {
    setEditingRegion(null);
    setRegionNo("");
    setRegionNameAr("");
    setRegionNameEn("");
    setRegionBranchId(presetBranchId || branches[0]?.branchId || "");
    setShowRegionModal(true);
    setAlertError(null);
  };

  const handleOpenEditRegion = (r: Region) => {
    setEditingRegion(r);
    setRegionNo(r.regionNo);
    setRegionNameAr(r.regionNameAr);
    setRegionNameEn(r.regionNameEn);
    setRegionBranchId(r.branchId);
    setShowRegionModal(true);
    setAlertError(null);
  };

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionNo.trim() || !regionNameAr.trim() || !regionBranchId) {
      setAlertError(
        t("auto.pleaseFillAllRequired"),
      );
      return;
    }

    const cleanNo = regionNo.trim();

    try {
      if (editingRegion) {
        await updateRegion(editingRegion.regionId, {
          regionNo: cleanNo,
          regionNameAr: regionNameAr.trim(),
          regionNameEn: regionNameEn.trim() || regionNameAr.trim(),
          branchId: regionBranchId,
        });
        setSuccessMessage(
          t("auto.regionUpdatedSuccessfully"),
        );
      } else {
        if (regions.some((r) => r.regionNo === cleanNo)) {
          setAlertError(
            t("auto.regionNumberAlreadyExists"),
          );
          return;
        }
        await createRegion({
          regionId: `REG-${cleanNo}`,
          regionNo: cleanNo,
          regionNameAr: regionNameAr.trim(),
          regionNameEn: regionNameEn.trim() || regionNameAr.trim(),
          branchId: regionBranchId,
        });
        setSuccessMessage(
          t("auto.newRegionCreatedSuccessfully"),
        );
      }
    } catch (err) {
      console.error(err);
      setAlertError(
        t("auto.errorSavingRegion"),
      );
      return;
    }

    setShowRegionModal(false);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDeleteRegion = async (r: Region) => {
    if (
      window.confirm(
        lang === "ar"
          ? `هل أنت متأكد من حذف منطقة ${r.regionNameAr} (#${r.regionNo})؟`
          : `Delete region ${r.regionNameEn}?`,
      )
    ) {
      const res = await deleteRegion(r.regionId);
      if (!res.success) {
        alert(res.message || "Cannot delete region");
      } else {
        setSuccessMessage(t("auto.regionDeleted"));
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Filtered lists
  const filteredBranches = branches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.branchNameAr.toLowerCase().includes(q) ||
      b.branchNameEn.toLowerCase().includes(q) ||
      b.branchId.toLowerCase().includes(q)
    );
  });

  const filteredRegions = regions.filter((r) => {
    if (selectedBranchId !== "ALL" && r.branchId !== selectedBranchId)
      return false;
    const q = searchQuery.toLowerCase();
    return (
      r.regionNo.includes(q) ||
      r.regionNameAr.toLowerCase().includes(q) ||
      r.regionNameEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <BranchesHeader
        lang={lang}
        activeTab={activeTab}
        onOpenExcelModal={() => {
          setShowExcelModal(true);
          setExcelParseError(null);
        }}
        onOpenAddBranch={handleOpenAddBranch}
        onOpenAddRegion={() =>
          handleOpenAddRegion(
            selectedBranchId !== "ALL" ? selectedBranchId : undefined,
          )
        }
      />

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <BranchStatsHeader
        lang={lang}
        branches={branches}
        regions={regions}
        users={users}
        records={records}
      />

      <BranchesTabsAndFilters
        lang={lang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        branches={branches}
        regions={regions}
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {activeTab === "branches" ? (
        <BranchesListView
          lang={lang}
          branches={filteredBranches}
          regions={regions}
          users={users}
          onOpenEditBranch={handleOpenEditBranch}
          onDeleteBranch={handleDeleteBranch}
          onSelectBranchAndSwitchToRegions={(bId) => {
            setSelectedBranchId(bId);
            setActiveTab("regions");
          }}
          onOpenAddRegion={handleOpenAddRegion}
        />
      ) : (
        <RegionsListView
          lang={lang}
          filteredRegions={filteredRegions}
          branches={branches}
          users={users}
          records={records}
          onOpenEditRegion={handleOpenEditRegion}
          onDeleteRegion={handleDeleteRegion}
        />
      )}

      <BranchModal
        lang={lang}
        showModal={showBranchModal}
        editingBranch={editingBranch}
        branchCode={branchCode}
        setBranchCode={setBranchCode}
        branchNameAr={branchNameAr}
        setBranchNameAr={setBranchNameAr}
        branchNameEn={branchNameEn}
        setBranchNameEn={setBranchNameEn}
        alertError={alertError}
        handleSaveBranch={handleSaveBranch}
        onClose={() => setShowBranchModal(false)}
      />

      <RegionModal
        lang={lang}
        showModal={showRegionModal}
        editingRegion={editingRegion}
        regionNo={regionNo}
        setRegionNo={setRegionNo}
        regionNameAr={regionNameAr}
        setRegionNameAr={setRegionNameAr}
        regionNameEn={regionNameEn}
        setRegionNameEn={setRegionNameEn}
        regionBranchId={regionBranchId}
        setRegionBranchId={setRegionBranchId}
        branches={branches}
        alertError={alertError}
        handleSaveRegion={handleSaveRegion}
        onClose={() => setShowRegionModal(false)}
      />

      <ExcelImportModal
        lang={lang}
        showModal={showExcelModal}
        parsedBranches={parsedBranches}
        setParsedBranches={setParsedBranches}
        parsedRegions={parsedRegions}
        setParsedRegions={setParsedRegions}
        importMode={importMode}
        setImportMode={setImportMode}
        excelFileName={excelFileName}
        setExcelFileName={setExcelFileName}
        excelParseError={excelParseError}
        setExcelParseError={setExcelParseError}
        handleDownloadTemplate={handleDownloadTemplate}
        handleFileUpload={handleFileUpload}
        handleConfirmImport={handleConfirmImport}
        onClose={() => {
          setShowExcelModal(false);
          setParsedBranches([]);
          setParsedRegions([]);
          setExcelFileName("");
          setExcelParseError(null);
        }}
      />
    </div>
  );
};
