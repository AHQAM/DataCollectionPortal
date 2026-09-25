import React from "react";
import { User, Region } from "../../../types";
import { Check } from "lucide-react";
import i18n from "../../../i18n";

interface SupervisorGridViewProps {
  supervisors: User[];
  regions: Region[];
  lang: "ar" | "en";
  onToggleRegion: (supervisor: User, regionNo: string) => void;
}

export const SupervisorGridView: React.FC<SupervisorGridViewProps> = ({
  supervisors,
  regions,
  lang,
  onToggleRegion,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-black text-slate-900">
          {i18n.t("auto.crossMatrixSupervisorsField")}
        </span>
        <span className="text-[11px] text-slate-500 font-medium">
          {i18n.t("auto.clickAnyCellTo")}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
              <th className="p-3 text-start sticky start-0 bg-slate-100 z-10 min-w-[200px]">
                {i18n.t("auto.supervisor")}
              </th>
              <th className="p-3 text-center min-w-[90px]">
                {i18n.t("auto.totalZones")}
              </th>
              {regions.map((reg) => (
                <th
                  key={reg.regionId}
                  className="p-2 text-center min-w-[80px] border-s border-slate-200"
                >
                  <div className="font-mono text-purple-900 font-bold">
                    {reg.regionNo}
                  </div>
                  <div
                    className="text-[10px] text-slate-500 font-normal truncate max-w-[90px] mx-auto"
                    title={reg.regionNameAr}
                  >
                    {reg.regionNameAr}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {supervisors.map((sup) => {
              const allowed = new Set(sup.allowedRegionNos || []);

              return (
                <tr
                  key={sup.userId}
                  className="hover:bg-purple-50/20 transition-colors"
                >
                  <td className="p-3 font-bold text-slate-900 sticky start-0 bg-white shadow-xs z-10">
                    <div>{sup.userNameAr}</div>
                    <div className="text-[10px] font-mono text-slate-400 font-normal">
                      {sup.userNo || sup.username}
                    </div>
                  </td>
                  <td className="p-3 text-center font-black text-purple-900 font-mono">
                    {allowed.size}
                  </td>
                  {regions.map((reg) => {
                    const isSupervised = allowed.has(reg.regionNo);

                    return (
                      <td
                        key={reg.regionId}
                        onClick={() => onToggleRegion(sup, reg.regionNo)}
                        className={`p-2 text-center border-s border-slate-100 cursor-pointer transition-colors ${
                          isSupervised
                            ? "bg-purple-100/60 hover:bg-purple-200/80"
                            : "hover:bg-slate-100/60"
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          {isSupervised ? (
                            <div className="w-5 h-5 rounded bg-purple-900 text-white flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded border border-slate-300" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
