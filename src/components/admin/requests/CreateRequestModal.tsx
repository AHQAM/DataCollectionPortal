import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Building, Check } from "lucide-react";
import { Branch, Region, RequestType, RequestPriority } from "../../../types";

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: Branch[];
  regions: Region[];
  lang: string;
  defaultCode: string;
  onSubmit: (data: {
    requestCode: string;
    titleAr: string;
    titleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    priority: RequestPriority;
    requestType: RequestType;
    targetEntityLabelAr?: string;
    targetEntityLabelEn?: string;
    dueAt: string;
    targetBranches: string[];
    targetRegions: string[];
    allowEditAfterSubmit: boolean;
    requireSupervisorApproval: boolean;
  }) => Promise<void>;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  branches,
  regions,
  lang,
  defaultCode,
  onSubmit,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  const [newTitleAr, setNewTitleAr] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newDescAr, setNewDescAr] = useState("");
  const [newDescEn, setNewDescEn] = useState("");
  const [newPriority, setNewPriority] = useState<RequestPriority>("Normal");
  const [newType, setNewType] = useState<RequestType>("per_record");
  const [newTargetEntityLabelAr, setNewTargetEntityLabelAr] = useState("");
  const [newTargetEntityLabelEn, setNewTargetEntityLabelEn] = useState("");
  const [newDueAt, setNewDueAt] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  );
  const [newAllowEdit, setNewAllowEdit] = useState(true);
  const [newRequireSupervisor, setNewRequireSupervisor] = useState(false);
  const [newTargetScope, setNewTargetScope] = useState<"ALL" | "SPECIFIC">(
    "ALL",
  );
  const [newSelectedBranchIds, setNewSelectedBranchIds] = useState<string[]>(
    [],
  );
  const [newSelectedRegionNos, setNewSelectedRegionNos] = useState<string[]>(
    [],
  );

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitleAr.trim()) return;

    await onSubmit({
      requestCode: defaultCode,
      titleAr: newTitleAr.trim(),
      titleEn: newTitleEn.trim() || newTitleAr.trim(),
      descriptionAr: newDescAr,
      descriptionEn: newDescEn || newDescAr,
      priority: newPriority,
      requestType: newType,
      targetEntityLabelAr: newTargetEntityLabelAr.trim() || undefined,
      targetEntityLabelEn: newTargetEntityLabelEn.trim() || undefined,
      dueAt: newDueAt,
      targetBranches: newTargetScope === "ALL" ? [] : newSelectedBranchIds,
      targetRegions: newTargetScope === "ALL" ? [] : newSelectedRegionNos,
      allowEditAfterSubmit: newAllowEdit,
      requireSupervisorApproval: newRequireSupervisor,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="font-extrabold text-sm text-slate-900">
            {t("requests.createModalTitle", { lng: currentLang })}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t("requests.requestCodeLabel", { lng: currentLang })}
              </label>
              <input
                type="text"
                value={defaultCode}
                disabled
                className="w-full h-10 px-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-slate-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t("requests.priorityLabel", { lng: currentLang })}
              </label>
              <select
                value={newPriority}
                onChange={(e) =>
                  setNewPriority(e.target.value as RequestPriority)
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              >
                <option value="low">
                  {t("requests.priorityLow", { lng: currentLang })}
                </option>
                <option value="medium">
                  {t("requests.priorityMedium", { lng: currentLang })}
                </option>
                <option value="high">
                  {t("requests.priorityHigh", { lng: currentLang })}
                </option>
                <option value="urgent">
                  {t("requests.priorityUrgent", { lng: currentLang })}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t("requests.titleArLabel", { lng: currentLang })} *
            </label>
            <input
              type="text"
              value={newTitleAr}
              onChange={(e) => setNewTitleAr(e.target.value)}
              placeholder={t("requests.titleArPlaceholder", {
                lng: currentLang,
              })}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t("requests.titleEnLabel", { lng: currentLang })}
            </label>
            <input
              type="text"
              value={newTitleEn}
              onChange={(e) => setNewTitleEn(e.target.value)}
              placeholder={t("requests.titleEnPlaceholder", {
                lng: currentLang,
              })}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t("requests.requestTypeLabel", { lng: currentLang })}
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as RequestType)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300"
              >
                <option value="per_record">
                  {t("requests.typePerRecord", { lng: currentLang })}
                </option>
                <option value="per_rep">
                  {t("requests.typePerRep", { lng: currentLang })}
                </option>
                <option value="per_region">
                  {t("requests.typePerRegion", { lng: currentLang })}
                </option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t("requests.dueDateLabel", { lng: currentLang })}
              </label>
              <input
                type="date"
                value={newDueAt}
                onChange={(e) => setNewDueAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t("requests.targetEntityLabelAr", { lng: currentLang })}
              </label>
              <input
                type="text"
                value={newTargetEntityLabelAr}
                onChange={(e) => setNewTargetEntityLabelAr(e.target.value)}
                placeholder={t("requests.targetEntityLabelArPlaceholder", {
                  lng: currentLang,
                })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t("requests.targetEntityLabelEn", { lng: currentLang })}
              </label>
              <input
                type="text"
                value={newTargetEntityLabelEn}
                onChange={(e) => setNewTargetEntityLabelEn(e.target.value)}
                placeholder={t("requests.targetEntityLabelEnPlaceholder", {
                  lng: currentLang,
                })}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t("requests.instructionsArLabel", { lng: currentLang })}
            </label>
            <textarea
              rows={2}
              value={newDescAr}
              onChange={(e) => setNewDescAr(e.target.value)}
              placeholder={t("requests.instructionsArPlaceholder", {
                lng: currentLang,
              })}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          {/* Target Scope Selection */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-extrabold text-purple-950">
                <Building className="w-4 h-4 text-purple-700" />
                <span>
                  {t("requests.targetBranchesAndZones", { lng: currentLang })}
                </span>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                  <input
                    type="radio"
                    name="newTargetScope"
                    checked={newTargetScope === "ALL"}
                    onChange={() => setNewTargetScope("ALL")}
                    className="text-purple-900"
                  />
                  <span>
                    {t("requests.allBranchesAndZones", { lng: currentLang })}
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                  <input
                    type="radio"
                    name="newTargetScope"
                    checked={newTargetScope === "SPECIFIC"}
                    onChange={() => setNewTargetScope("SPECIFIC")}
                    className="text-purple-900"
                  />
                  <span>
                    {t("requests.specificBranches", { lng: currentLang })}
                  </span>
                </label>
              </div>
            </div>

            {newTargetScope === "SPECIFIC" && (
              <div className="space-y-2 pt-2 border-t border-purple-200/60 animate-in fade-in">
                <div>
                  <div className="font-bold text-slate-600 text-[11px] mb-1">
                    {t("requests.selectTargetBranches", { lng: currentLang })}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {branches.map((b) => {
                      const isSelected = newSelectedBranchIds.includes(
                        b.branchId,
                      );
                      return (
                        <button
                          key={b.branchId}
                          type="button"
                          onClick={() => {
                            setNewSelectedBranchIds((prev) =>
                              isSelected
                                ? prev.filter((id) => id !== b.branchId)
                                : [...prev, b.branchId],
                            );
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border ${
                            isSelected
                              ? "bg-purple-900 text-white border-purple-900 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          <span>
                            {currentLang === "ar"
                              ? b.branchNameAr
                              : b.branchNameEn || b.branchNameAr}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {newSelectedBranchIds.length > 0 && (
                  <div className="pt-1">
                    <div className="font-bold text-slate-600 text-[11px] mb-1">
                      {t("requests.regionsInSelectedBranches", {
                        lng: currentLang,
                      })}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                      {regions
                        .filter((r) =>
                          newSelectedBranchIds.includes(r.branchId),
                        )
                        .map((r) => {
                          const isRegSelected = newSelectedRegionNos.includes(
                            r.regionNo,
                          );
                          return (
                            <button
                              key={r.regionNo}
                              type="button"
                              onClick={() => {
                                setNewSelectedRegionNos((prev) =>
                                  isRegSelected
                                    ? prev.filter((no) => no !== r.regionNo)
                                    : [...prev, r.regionNo],
                                );
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer border ${
                                isRegSelected
                                  ? "bg-purple-700 text-white border-purple-700"
                                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {r.regionNo} -{" "}
                              {currentLang === "ar"
                                ? r.regionNameAr
                                : r.regionNameEn || r.regionNameAr}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={newAllowEdit}
                onChange={(e) => setNewAllowEdit(e.target.checked)}
                className="rounded text-purple-900"
              />
              <span>
                {t("requests.allowEditAfterSubmit", { lng: currentLang })}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={newRequireSupervisor}
                onChange={(e) => setNewRequireSupervisor(e.target.checked)}
                className="rounded text-purple-900"
              />
              <span>
                {t("requests.requireSupervisorApproval", { lng: currentLang })}
              </span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              {t("requests.cancel", { lng: currentLang })}
            </button>
            <button
              type="submit"
              className="flex-2 h-10 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold"
            >
              {t("requests.createAndOpenFormBuilder", { lng: currentLang })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
