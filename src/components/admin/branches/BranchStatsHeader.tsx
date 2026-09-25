import React from "react";
import { useTranslation } from "react-i18next";
import { Branch, Region, User, RecordItem } from "../../../types";

interface BranchStatsHeaderProps {
  lang?: string;
  branches: Branch[];
  regions: Region[];
  users: User[];
  records: RecordItem[];
}

export const BranchStatsHeader: React.FC<BranchStatsHeaderProps> = ({
  lang,
  branches,
  regions,
  users,
  records,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] text-slate-500 font-bold">
          {t("branches.totalBranches", { lng: currentLang })}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1">
          {branches.length}
        </div>
        <div className="text-[10px] text-purple-700 font-semibold mt-1">
          {branches.filter((b) => b.isActive).length}{" "}
          {t("branches.activeBranchesUnit", { lng: currentLang })}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] text-slate-500 font-bold">
          {t("branches.fieldRegions", { lng: currentLang })}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1">
          {regions.length}
        </div>
        <div className="text-[10px] text-emerald-700 font-semibold mt-1">
          {regions.filter((r) => r.isActive).length}{" "}
          {t("branches.coveredRegionsUnit", { lng: currentLang })}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] text-slate-500 font-bold">
          {t("branches.supervisorsAndUsers", { lng: currentLang })}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1">
          {users.length}
        </div>
        <div className="text-[10px] text-slate-400 font-semibold mt-1">
          {users.filter((u) => u.role === "REP").length}{" "}
          {t("branches.fieldUsersUnit", { lng: currentLang })}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] text-slate-500 font-bold">
          {t("branches.dataRecords", { lng: currentLang })}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1">
          {records.length}
        </div>
        <div className="text-[10px] text-blue-700 font-semibold mt-1">
          {records.filter((r) => r.recordStatus === "Completed").length}{" "}
          {t("branches.completedRecordsUnit", { lng: currentLang })}
        </div>
      </div>
    </div>
  );
};
