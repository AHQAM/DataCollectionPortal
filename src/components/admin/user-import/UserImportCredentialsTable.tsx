import React from "react";
import { useTranslation } from "react-i18next";
import { ImportedCredential } from "./userImportParser";
import { CheckCircle2, Download } from "lucide-react";

interface UserImportCredentialsTableProps {
  lang?: string;
  importedCredentials: ImportedCredential[];
  onDownloadCredentialsExcel: () => void;
}

export const UserImportCredentialsTable: React.FC<
  UserImportCredentialsTableProps
> = ({ lang, importedCredentials, onDownloadCredentialsExcel }) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="p-6 overflow-y-auto space-y-5 flex-1 animate-in fade-in">
      {/* Success Header */}
      <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-extrabold text-emerald-950">
            {t("users.importSuccessTitle", { lng: currentLang })}
          </h3>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            {t("users.importSuccessDesc", {
              count: importedCredentials.length,
              lng: currentLang,
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={onDownloadCredentialsExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>
            {t("users.downloadCredentialsExcel", { lng: currentLang })}
          </span>
        </button>
      </div>

      {/* Credentials Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            {t("users.tempCredentialsSheet", { lng: currentLang })}
          </span>
          <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {t("users.mustChangePasswordNotice", { lng: currentLang })}
          </span>
        </div>
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-start w-10">#</th>
                <th className="px-3 py-2 text-start">
                  {t("users.colUserName", { lng: currentLang })}
                </th>
                <th className="px-3 py-2 text-start">
                  {t("users.colRegionNo", { lng: currentLang })}
                </th>
                <th className="px-3 py-2 text-start">
                  {t("users.colBranch", { lng: currentLang })}
                </th>
                <th className="px-3 py-2 text-start">
                  {t("users.colAssignedRegions", { lng: currentLang })}
                </th>
                <th className="px-3 py-2 text-start">
                  {t("users.colTempPassword", { lng: currentLang })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {importedCredentials.map((cred, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 font-bold text-slate-900">
                    {cred.userNameAr}
                  </td>
                  <td className="px-3 py-2 font-mono font-bold text-purple-900">
                    #{cred.username}
                  </td>
                  <td className="px-3 py-2 text-slate-600">
                    {cred.branchName || "---"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {cred.allowedRegionNos.map((reg) => (
                        <span
                          key={reg}
                          className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          #{reg}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="font-mono font-extrabold text-xs bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded border border-emerald-300 select-all">
                      {cred.password}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
