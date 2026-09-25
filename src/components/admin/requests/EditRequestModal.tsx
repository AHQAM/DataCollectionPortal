import React, { useState, useEffect } from "react";
import { X, Edit, Building, Check } from "lucide-react";
import { RequestItem, Branch, Region, RequestPriority } from "../../../types";
import i18n from "../../../i18n";

interface EditRequestModalProps {
  request: RequestItem | null;
  onClose: () => void;
  branches: Branch[];
  regions: Region[];
  lang: string;
  onSubmit: (requestId: string, updates: Partial<RequestItem>) => Promise<void>;
}

export const EditRequestModal: React.FC<EditRequestModalProps> = ({
  request,
  onClose,
  branches,
  regions,
  lang,
  onSubmit,
}) => {
  const [editTitleAr, setEditTitleAr] = useState("");
  const [editTitleEn, setEditTitleEn] = useState("");
  const [editDescAr, setEditDescAr] = useState("");
  const [editPriority, setEditPriority] = useState<RequestPriority>("Normal");
  const [editDueAt, setEditDueAt] = useState("");
  const [editTargetEntityLabelAr, setEditTargetEntityLabelAr] = useState("");
  const [editTargetEntityLabelEn, setEditTargetEntityLabelEn] = useState("");
  const [editTargetScope, setEditTargetScope] = useState<"ALL" | "SPECIFIC">(
    "ALL",
  );
  const [editSelectedBranchIds, setEditSelectedBranchIds] = useState<string[]>(
    [],
  );
  const [editSelectedRegionNos, setEditSelectedRegionNos] = useState<string[]>(
    [],
  );

  useEffect(() => {
    if (request) {
      setEditTitleAr(request.titleAr || "");
      setEditTitleEn(request.titleEn || "");
      setEditDescAr(request.descriptionAr || "");
      setEditPriority(request.priority || "Normal");
      setEditDueAt(request.dueAt ? request.dueAt.split("T")[0] : "");
      setEditTargetEntityLabelAr(request.targetEntityLabelAr || "");
      setEditTargetEntityLabelEn(request.targetEntityLabelEn || "");

      const tBranches = request.targetBranches || [];
      const tRegions = request.targetRegions || [];

      if (tBranches.length === 0 && tRegions.length === 0) {
        setEditTargetScope("ALL");
        setEditSelectedBranchIds([]);
        setEditSelectedRegionNos([]);
      } else {
        setEditTargetScope("SPECIFIC");
        setEditSelectedBranchIds(tBranches);
        setEditSelectedRegionNos(tRegions);
      }
    }
  }, [request]);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitleAr.trim()) return;

    await onSubmit(request.requestId, {
      titleAr: editTitleAr.trim(),
      titleEn: editTitleEn.trim() || editTitleAr.trim(),
      descriptionAr: editDescAr,
      priority: editPriority,
      targetEntityLabelAr: editTargetEntityLabelAr.trim() || undefined,
      targetEntityLabelEn: editTargetEntityLabelEn.trim() || undefined,
      dueAt: new Date(editDueAt).toISOString(),
      dueDate: editDueAt,
      targetBranches: editTargetScope === "ALL" ? [] : editSelectedBranchIds,
      targetRegions: editTargetScope === "ALL" ? [] : editSelectedRegionNos,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Edit className="w-4 h-4 text-purple-700" />
            <span>{i18n.t("auto.editRequestDetailsScope")}</span>
            <span className="text-purple-700 font-mono text-xs">
              ({request.requestCode})
            </span>
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
                {i18n.t("auto.priority")}
              </label>
              <select
                value={editPriority}
                onChange={(e) =>
                  setEditPriority(e.target.value as RequestPriority)
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              >
                <option value="low">{i18n.t("auto.low")}</option>
                <option value="medium">{i18n.t("auto.medium")}</option>
                <option value="high">{i18n.t("auto.high")}</option>
                <option value="urgent">{i18n.t("auto.urgent")}</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {i18n.t("auto.dueDate")}
              </label>
              <input
                type="date"
                value={editDueAt}
                onChange={(e) => setEditDueAt(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.requestTitleArabic")}
            </label>
            <input
              type="text"
              value={editTitleAr}
              onChange={(e) => setEditTitleAr(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.requestTitleEnglish")}
            </label>
            <input
              type="text"
              value={editTitleEn}
              onChange={(e) => setEditTitleEn(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {i18n.t("auto.targetEntityLabelArabic")}
              </label>
              <input
                type="text"
                value={editTargetEntityLabelAr}
                onChange={(e) => setEditTargetEntityLabelAr(e.target.value)}
                placeholder={i18n.t("auto.egCustomerStoreSchool")}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {i18n.t("auto.targetEntityLabelEnglish")}
              </label>
              <input
                type="text"
                value={editTargetEntityLabelEn}
                onChange={(e) => setEditTargetEntityLabelEn(e.target.value)}
                placeholder="e.g. Customer, Store, Facility..."
                className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.instructions")}
            </label>
            <textarea
              rows={2}
              value={editDescAr}
              onChange={(e) => setEditDescAr(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
          </div>

          {/* Target Scope Selection */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-extrabold text-purple-950">
                <Building className="w-4 h-4 text-purple-700" />
                <span>{i18n.t("auto.targetBranchesZones")}</span>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                  <input
                    type="radio"
                    name="editTargetScope"
                    checked={editTargetScope === "ALL"}
                    onChange={() => setEditTargetScope("ALL")}
                    className="text-purple-900"
                  />
                  <span>{i18n.t("auto.allBranches")}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700">
                  <input
                    type="radio"
                    name="editTargetScope"
                    checked={editTargetScope === "SPECIFIC"}
                    onChange={() => setEditTargetScope("SPECIFIC")}
                    className="text-purple-900"
                  />
                  <span>{i18n.t("auto.specific")}</span>
                </label>
              </div>
            </div>

            {editTargetScope === "SPECIFIC" && (
              <div className="space-y-2 pt-2 border-t border-purple-200/60 animate-in fade-in">
                <div>
                  <div className="font-bold text-slate-600 text-[11px] mb-1">
                    {i18n.t("auto.selectTargetBranches")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {branches.map((b) => {
                      const isSelected = editSelectedBranchIds.includes(
                        b.branchId,
                      );
                      return (
                        <button
                          key={b.branchId}
                          type="button"
                          onClick={() => {
                            setEditSelectedBranchIds((prev) =>
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
                            {lang === "ar" ? b.branchNameAr : b.branchNameEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {editSelectedBranchIds.length > 0 && (
                  <div className="pt-1">
                    <div className="font-bold text-slate-600 text-[11px] mb-1">
                      {i18n.t("auto.regionsInSelectedBranches")}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-white rounded-lg border border-slate-200">
                      {regions
                        .filter((r) =>
                          editSelectedBranchIds.includes(r.branchId),
                        )
                        .map((r) => {
                          const isRegSelected = editSelectedRegionNos.includes(
                            r.regionNo,
                          );
                          return (
                            <button
                              key={r.regionNo}
                              type="button"
                              onClick={() => {
                                setEditSelectedRegionNos((prev) =>
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
                              {lang === "ar" ? r.regionNameAr : r.regionNameEn}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
            >
              {i18n.t("auto.cancel")}
            </button>
            <button
              type="submit"
              className="flex-2 h-10 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold cursor-pointer shadow-md"
            >
              {i18n.t("auto.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
