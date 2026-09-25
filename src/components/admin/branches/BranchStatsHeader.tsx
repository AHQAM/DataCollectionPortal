import React from "react";
import { Branch, Region, User, RecordItem } from "../../../types";
import i18n from "../../../i18n";

interface BranchStatsHeaderProps {
  lang: string;
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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] text-slate-500 font-bold">
          {i18n.t("auto.totalBranches")}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1">
          {branches.length}
        </div>
        <div className="text-[10px] text-purple-700 font-semibold mt-1">
          {branches.filter((b) => b.isActive).length} {i18n.t("auto.active")}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] text-slate-500 font-bold">
          {i18n.t("auto.fieldRegions")}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1">
          {regions.length}
        </div>
        <div className="text-[10px] text-emerald-700 font-semibold mt-1">
          {regions.filter((r) => r.isActive).length} {i18n.t("auto.covered")}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] text-slate-500 font-bold">
          {i18n.t("auto.supervisorsUsers")}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1">
          {users.length}
        </div>
        <div className="text-[10px] text-slate-400 font-semibold mt-1">
          {users.filter((u) => u.role === "REP").length}{" "}
          {i18n.t("auto.fieldUsers")}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="text-[11px] text-slate-500 font-bold">
          {i18n.t("auto.dataRecords")}
        </div>
        <div className="text-2xl font-black text-slate-900 mt-1">
          {records.length}
        </div>
        <div className="text-[10px] text-blue-700 font-semibold mt-1">
          {records.filter((r) => r.recordStatus === "Completed").length}{" "}
          {i18n.t("auto.completed1")}
        </div>
      </div>
    </div>
  );
};
