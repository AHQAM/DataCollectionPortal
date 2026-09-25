import React from "react";
import { useTranslation } from "react-i18next";
import { ParsedRepRow } from "./userImportParser";
import { Users } from "lucide-react";

interface UserImportPreviewTableProps {
  lang?: string;
  parsedRows: ParsedRepRow[];
  totalRawRows: number;
}

export const UserImportPreviewTable: React.FC<UserImportPreviewTableProps> = ({
  lang,
  parsedRows,
  totalRawRows,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  if (parsedRows.length === 0) return null;

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const existingCount = parsedRows.filter(
    (r) => r.isExisting && r.isValid,
  ).length;
  const newCount = validCount - existingCount;
  const multiRegionCount = parsedRows.filter(
    (r) => r.assignedRegions.length > 1,
  ).length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-700" />
          <span>
            {t("users.processedRowsCount", {
              total: totalRawRows,
              users: parsedRows.length,
              lng: currentLang,
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold">
          {multiRegionCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200">
              {t("users.multiRegionBadge", {
                count: multiRegionCount,
                lng: currentLang,
              })}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
            {t("users.newUsersBadge", {
              count: newCount,
              lng: currentLang,
            })}
          </span>
          {existingCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
              {t("users.updatesBadge", {
                count: existingCount,
                lng: currentLang,
              })}
            </span>
          )}
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs max-h-64 overflow-y-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2.5 text-start w-10">#</th>
              <th className="px-3 py-2.5 text-start">
                {t("users.colUserId", { lng: currentLang })}
              </th>
              <th className="px-3 py-2.5 text-start">
                {t("users.colUserName", { lng: currentLang })}
              </th>
              <th className="px-3 py-2.5 text-start">
                {t("users.colAssignedRegions", { lng: currentLang })}
              </th>
              <th className="px-3 py-2.5 text-start">
                {t("users.colBranch", { lng: currentLang })}
              </th>
              <th className="px-3 py-2.5 text-start">
                {t("users.colTempPassword", { lng: currentLang })}
              </th>
              <th className="px-3 py-2.5 text-center">
                {t("users.colStatus", { lng: currentLang })}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {parsedRows.map((row, idx) => (
              <tr
                key={idx}
                className={`hover:bg-slate-50/80 transition-colors ${
                  !row.isValid ? "bg-rose-50/40" : ""
                }`}
              >
                <td className="px-3 py-2 text-slate-400 font-mono text-[10px]">
                  {idx + 1}
                </td>

                <td className="px-3 py-2">
                  <span className="font-mono font-extrabold text-xs bg-purple-100 text-purple-900 px-2 py-0.5 rounded-lg border border-purple-200">
                    #{row.userNo || "---"}
                  </span>
                </td>

                <td className="px-3 py-2 font-bold text-slate-900">
                  {row.userName || (
                    <span className="text-rose-600 font-normal">
                      {currentLang === "ar" ? "اسم مفقود" : "Missing Name"}
                    </span>
                  )}
                </td>

                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {row.assignedRegions.map((reg) => (
                      <span
                        key={reg}
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          row.assignedRegions.length > 1
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        #{reg}
                      </span>
                    ))}
                    {row.assignedRegions.length > 1 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {currentLang === "ar"
                          ? `(${row.assignedRegions.length} مناطق)`
                          : `(${row.assignedRegions.length} regions)`}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-3 py-2 text-slate-600">{row.branchName}</td>

                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                      {currentLang === "ar"
                        ? "رمز مؤقت لمرة واحدة"
                        : "One-time temp code"}
                    </span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {currentLang === "ar" ? "تغيير إلزامي" : "Must Change"}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2 text-center">
                  {row.isValid ? (
                    row.isExisting ? (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {currentLang === "ar"
                          ? "تحديث وتوسيع مناطق"
                          : "Update & Expand"}
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {currentLang === "ar" ? "حساب جديد" : "New Account"}
                      </span>
                    )
                  ) : (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {row.validationError}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
