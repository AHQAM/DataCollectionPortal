import React from "react";
import { useTranslation } from "react-i18next";
import { Branch, Region, User } from "../../../types";
import { Building2, Edit2, Trash2, ArrowRight, Plus } from "lucide-react";

interface BranchesListViewProps {
  lang?: string;
  branches: Branch[];
  regions: Region[];
  users: User[];
  onOpenEditBranch: (b: Branch) => void;
  onDeleteBranch: (b: Branch) => void;
  onSelectBranchAndSwitchToRegions: (branchId: string) => void;
  onOpenAddRegion: (presetBranchId?: string) => void;
}

export const BranchesListView: React.FC<BranchesListViewProps> = ({
  lang,
  branches,
  regions,
  users,
  onOpenEditBranch,
  onDeleteBranch,
  onSelectBranchAndSwitchToRegions,
  onOpenAddRegion,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  if (branches.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs shadow-xs">
        {t("branches.noMatchingBranches", { lng: currentLang })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {branches.map((b) => {
        const branchRegions = regions.filter((r) => r.branchId === b.branchId);
        const branchUsers = users.filter((u) => u.branchId === b.branchId);
        const branchSupervisors = branchUsers.filter(
          (u) => u.role === "SUPERVISOR",
        );
        const branchReps = branchUsers.filter((u) => u.role === "REP");

        return (
          <div
            key={b.branchId}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 font-bold flex items-center justify-center shrink-0 border border-purple-100">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {currentLang === "ar" ? b.branchNameAr : b.branchNameEn}
                    </h3>
                    <span className="text-[10px] text-purple-700 font-mono font-bold bg-purple-50 px-1.5 py-0.5 rounded">
                      {b.branchId}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditBranch(b)}
                    className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                    title={t("branches.edit", { lng: currentLang })}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteBranch(b)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    title={t("branches.delete", { lng: currentLang })}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Branch Metrics */}
              <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    {t("branches.regions", { lng: currentLang })}
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    {branchRegions.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    {t("branches.supervisors", { lng: currentLang })}
                  </span>
                  <span className="text-xs font-black text-purple-900">
                    {branchSupervisors.length}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">
                    {t("branches.reps", { lng: currentLang })}
                  </span>
                  <span className="text-xs font-black text-slate-800">
                    {branchReps.length}
                  </span>
                </div>
              </div>

              {/* Region badges inside branch */}
              <div className="mt-3">
                <span className="text-[10px] text-slate-400 font-bold block mb-1">
                  {t("branches.assignedZones", { lng: currentLang })}
                </span>
                <div className="flex flex-wrap gap-1">
                  {branchRegions.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic">
                      {t("branches.noRegionsYet", { lng: currentLang })}
                    </span>
                  ) : (
                    branchRegions.slice(0, 4).map((r) => (
                      <span
                        key={r.regionId}
                        className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700"
                      >
                        #{r.regionNo}{" "}
                        {currentLang === "ar" ? r.regionNameAr : r.regionNameEn}
                      </span>
                    ))
                  )}
                  {branchRegions.length > 4 && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      +{branchRegions.length - 4}{" "}
                      {t("branches.more", { lng: currentLang })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onSelectBranchAndSwitchToRegions(b.branchId)}
                className="text-xs font-bold text-purple-900 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
              >
                <span>{t("branches.viewAddZones", { lng: currentLang })}</span>
                <ArrowRight
                  className={`w-3.5 h-3.5 ${currentLang === "ar" ? "rotate-180" : ""}`}
                />
              </button>

              <button
                onClick={() => onOpenAddRegion(b.branchId)}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{t("branches.addZone", { lng: currentLang })}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
