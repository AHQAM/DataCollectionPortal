import React from "react";
import { useTranslation } from "react-i18next";
import {
  FileSpreadsheet,
  X,
  Sparkles,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Check,
} from "lucide-react";

interface ExcelImportModalProps {
  lang?: string;
  showModal: boolean;
  parsedBranches: {
    branchId: string;
    branchNameAr: string;
    branchNameEn?: string;
  }[];
  setParsedBranches: (val: any[]) => void;
  parsedRegions: {
    regionNo: string;
    regionNameAr: string;
    regionNameEn?: string;
    branchId: string;
  }[];
  setParsedRegions: (val: any[]) => void;
  importMode: "append" | "replace";
  setImportMode: (val: "append" | "replace") => void;
  excelFileName: string;
  setExcelFileName: (val: string) => void;
  excelParseError: string | null;
  setExcelParseError: (val: string | null) => void;
  handleDownloadTemplate: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConfirmImport: () => void;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  lang,
  showModal,
  parsedBranches,
  setParsedBranches,
  parsedRegions,
  setParsedRegions,
  importMode,
  setImportMode,
  excelFileName,
  setExcelFileName,
  excelParseError,
  setExcelParseError,
  handleDownloadTemplate,
  handleFileUpload,
  handleConfirmImport,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {t("branches.importModalTitle", { lng: currentLang })}
              </h3>
              <p className="text-xs text-slate-500">
                {t("branches.importModalDesc", { lng: currentLang })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>
                  {t("branches.standardTemplate", { lng: currentLang })}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                {t("branches.templateDesc", { lng: currentLang })}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {t("branches.downloadTemplate", { lng: currentLang })}
              </span>
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-all bg-slate-50/50 hover:bg-emerald-50/20">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl inline-block shadow-xs transition-all">
                {t("branches.selectExcelFile", { lng: currentLang })}
              </span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {excelFileName ? (
              <div className="mt-3 text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{excelFileName}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-2">
                {t("branches.supportsFiles", { lng: currentLang })}
              </p>
            )}
          </div>

          {excelParseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{excelParseError}</span>
            </div>
          )}

          {(parsedBranches.length > 0 || parsedRegions.length > 0) && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-900 rounded-lg text-xs font-black">
                    {t("branches.branchesDetected", {
                      count: parsedBranches.length,
                      lng: currentLang,
                    })}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-black">
                    {t("branches.regionsDetected", {
                      count: parsedRegions.length,
                      lng: currentLang,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === "append"}
                      onChange={() => setImportMode("append")}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      {t("branches.mergeOption", { lng: currentLang })}
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === "replace"}
                      onChange={() => setImportMode("replace")}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>
                      {t("branches.replaceOption", { lng: currentLang })}
                    </span>
                  </label>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-start text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-start">
                        {t("branches.branchIdLabel", { lng: currentLang })}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {t("branches.branchNameArLabel", { lng: currentLang })}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {t("branches.regionNo", { lng: currentLang })}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {t("branches.regionName", { lng: currentLang })}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRegions.slice(0, 10).map((r, i) => {
                      const branch = parsedBranches.find(
                        (b) => b.branchId === r.branchId,
                      );
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-1.5 font-mono text-purple-900 font-bold">
                            {r.branchId}
                          </td>
                          <td className="px-3 py-1.5 text-slate-800">
                            {branch?.branchNameAr || r.branchId}
                          </td>
                          <td className="px-3 py-1.5 font-mono font-bold text-slate-900">
                            {r.regionNo}
                          </td>
                          <td className="px-3 py-1.5 text-slate-600">
                            {r.regionNameAr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {parsedRegions.length > 10 && (
                <p className="text-[10px] text-slate-400 text-center">
                  {t("branches.moreRegionsInFile", {
                    count: parsedRegions.length - 10,
                    lng: currentLang,
                  })}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
          >
            {t("branches.cancel", { lng: currentLang })}
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedBranches.length === 0 && parsedRegions.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>
              {t("branches.confirmImportCount", {
                branches: parsedBranches.length,
                regions: parsedRegions.length,
                lng: currentLang,
              })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
