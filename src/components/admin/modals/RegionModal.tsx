import React from "react";
import { MapPin, X, AlertTriangle } from "lucide-react";
import { Region, Branch } from "../../../types";
import i18n from "../../../i18n";

interface RegionModalProps {
  lang: string;
  showModal: boolean;
  editingRegion: Region | null;
  regionNo: string;
  setRegionNo: (val: string) => void;
  regionNameAr: string;
  setRegionNameAr: (val: string) => void;
  regionNameEn: string;
  setRegionNameEn: (val: string) => void;
  regionBranchId: string;
  setRegionBranchId: (val: string) => void;
  branches: Branch[];
  alertError: string | null;
  handleSaveRegion: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const RegionModal: React.FC<RegionModalProps> = ({
  lang,
  showModal,
  editingRegion,
  regionNo,
  setRegionNo,
  regionNameAr,
  setRegionNameAr,
  regionNameEn,
  setRegionNameEn,
  regionBranchId,
  setRegionBranchId,
  branches,
  alertError,
  handleSaveRegion,
  onClose,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {editingRegion
                ? i18n.t("auto.editRegion")
                : i18n.t("auto.newFieldRegion")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {alertError && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{alertError}</span>
          </div>
        )}

        <form onSubmit={handleSaveRegion} className="space-y-3.5 mt-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.parentBranch")} *
            </label>
            <select
              value={regionBranchId}
              onChange={(e) => setRegionBranchId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              required
            >
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {lang === "ar" ? b.branchNameAr : b.branchNameEn} (
                  {b.branchId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.regionNumber")}{" "}
              *
            </label>
            <input
              type="text"
              value={regionNo}
              onChange={(e) => setRegionNo(e.target.value)}
              placeholder="مثال: 110 أو 201"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {i18n.t("auto.usedByFieldUser")}
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.regionNameArabic")}{" "}
              *
            </label>
            <input
              type="text"
              value={regionNameAr}
              onChange={(e) => setRegionNameAr(e.target.value)}
              placeholder="مثال: شمال الرياض - النرجس والياسمين"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.regionNameEnglish")}
            </label>
            <input
              type="text"
              value={regionNameEn}
              onChange={(e) => setRegionNameEn(e.target.value)}
              placeholder="e.g. North Riyadh - Narjis & Yasmin"
              className="w-full h-10 px-3 rounded-xl border border-slate-300"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              {i18n.t("auto.cancel")}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-extrabold shadow-sm transition-all cursor-pointer"
            >
              {i18n.t("auto.saveRegion")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
