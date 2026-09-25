import React from "react";
import { Branch, Region, User, RecordItem } from "../../../types";
import { Building2, Users, Edit2, Trash2 } from "lucide-react";
import i18n from "../../../i18n";

interface RegionsListViewProps {
  lang: string;
  filteredRegions: Region[];
  branches: Branch[];
  users: User[];
  records: RecordItem[];
  onOpenEditRegion: (r: Region) => void;
  onDeleteRegion: (r: Region) => void;
}

export const RegionsListView: React.FC<RegionsListViewProps> = ({
  lang,
  filteredRegions,
  branches,
  users,
  records,
  onOpenEditRegion,
  onDeleteRegion,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-start">
                {i18n.t("auto.regionNo")}
              </th>
              <th className="px-4 py-3 text-start">
                {i18n.t("auto.regionName")}
              </th>
              <th className="px-4 py-3 text-start">
                {i18n.t("auto.parentBranch")}
              </th>
              <th className="px-4 py-3 text-start">
                {i18n.t("auto.assignedRep")}
              </th>
              <th className="px-4 py-3 text-start">
                {i18n.t("auto.customerRecords")}
              </th>
              <th className="px-4 py-3 text-center">
                {i18n.t("auto.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRegions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  {i18n.t("auto.noMatchingRegionsFound")}
                </td>
              </tr>
            ) : (
              filteredRegions.map((r) => {
                const branch = branches.find((b) => b.branchId === r.branchId);
                const assignedRep = users.find(
                  (u) =>
                    u.regionNo === r.regionNo ||
                    (u.allowedRegionNos &&
                      u.allowedRegionNos.includes(r.regionNo)),
                );
                const regRecords = records.filter(
                  (rec) => rec.regionNo === r.regionNo,
                );

                return (
                  <tr
                    key={r.regionId}
                    className="hover:bg-slate-50/80 transition-all"
                  >
                    <td className="px-4 py-3.5 font-mono font-extrabold text-purple-900">
                      #{r.regionNo}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900">
                        {lang === "ar" ? r.regionNameAr : r.regionNameEn}
                      </div>
                      {r.regionNameEn && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          {r.regionNameEn}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[11px]">
                        <Building2 className="w-3.5 h-3.5 text-purple-700" />
                        <span>
                          {branch
                            ? lang === "ar"
                              ? branch.branchNameAr
                              : branch.branchNameEn
                            : r.branchId}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {assignedRep ? (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-slate-800">
                            {assignedRep.userNameAr}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          {i18n.t("auto.unassigned")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-slate-800">
                        {regRecords.length}
                      </span>{" "}
                      <span className="text-[10px] text-slate-400">
                        {i18n.t("auto.records")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenEditRegion(r)}
                          className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                          title={i18n.t("auto.edit")}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRegion(r)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          title={i18n.t("auto.delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
