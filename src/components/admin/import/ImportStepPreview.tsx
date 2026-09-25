import React from "react";
import { useTranslation } from "react-i18next";
import { RequestField } from "../../../types";
import { CheckCircle2, Database, AlertTriangle } from "lucide-react";

interface Props {
  lang?: string;
  rawRowsCount: number;
  validRows: Record<string, any>[];
  invalidRows: { row: number; reasonAr: string; reasonEn: string; data: any }[];
  isImporting: boolean;
  systemColMap: Record<string, string>;
  fieldColMap: Record<string, string>;
  requestFields: RequestField[];
  onBackToStep2: () => void;
  onCommitImport: () => void;
}

export const ImportStepPreview: React.FC<Props> = ({
  lang,
  rawRowsCount,
  validRows,
  invalidRows,
  isImporting,
  systemColMap,
  fieldColMap,
  requestFields,
  onBackToStep2,
  onCommitImport,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{t("importWizard.step3.title", { lng: currentLang })}</span>
          </h2>
          <p className="text-xs text-slate-500">
            {t("importWizard.step3.subtitle", { lng: currentLang })}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onBackToStep2}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            {t("importWizard.step3.editMapping", { lng: currentLang })}
          </button>
          <button
            onClick={onCommitImport}
            disabled={validRows.length === 0 || isImporting}
            className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>
              {isImporting
                ? t("importWizard.step3.importing", { lng: currentLang })
                : t("importWizard.step3.confirmImport", {
                    count: validRows.length,
                    lng: currentLang,
                  })}
            </span>
          </button>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <span className="text-slate-500 block text-xs font-bold">
            {t("importWizard.step3.totalRows", { lng: currentLang })}
          </span>
          <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">
            {rawRowsCount}
          </span>
        </div>
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-emerald-700 block text-xs font-bold">
            {t("importWizard.step3.validRows", { lng: currentLang })}
          </span>
          <span className="text-xl font-extrabold text-emerald-800 mt-0.5 block">
            {validRows.length}
          </span>
        </div>
        <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
          <span className="text-rose-700 block text-xs font-bold">
            {t("importWizard.step3.invalidRows", { lng: currentLang })}
          </span>
          <span className="text-xl font-extrabold text-rose-800 mt-0.5 block">
            {invalidRows.length}
          </span>
        </div>
      </div>

      {/* Invalid Rows Box */}
      {invalidRows.length > 0 && (
        <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              {t("importWizard.step3.excludedSummary", {
                count: invalidRows.length,
                lng: currentLang,
              })}
            </span>
          </div>
          <div className="max-h-36 overflow-y-auto divide-y divide-rose-200/70 text-xs">
            {invalidRows.map((inv, idx) => (
              <div
                key={idx}
                className="py-1.5 flex justify-between items-center text-[11px]"
              >
                <span className="font-mono text-slate-600">
                  {t("importWizard.step3.rowNum", {
                    num: inv.row,
                    lng: currentLang,
                  })}
                </span>
                <span className="font-bold text-rose-700">
                  {currentLang === "ar" ? inv.reasonAr : inv.reasonEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Valid Rows Preview Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
        <div className="bg-slate-100 p-2.5 font-bold text-slate-800 flex items-center justify-between">
          <span>
            {t("importWizard.step3.previewTitle", { lng: currentLang })}
          </span>
          <span className="text-xs text-slate-500 font-normal">
            {t("importWizard.step3.previewCount", {
              count: Math.min(validRows.length, 5),
              lng: currentLang,
            })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px]">
              <tr>
                <th className="p-2 text-start">
                  {t("importWizard.step3.thRegion", { lng: currentLang })}
                </th>
                <th className="p-2 text-start">
                  {t("importWizard.step3.thRecordId", { lng: currentLang })}
                </th>
                <th className="p-2 text-start">
                  {t("importWizard.step3.thTarget", { lng: currentLang })}
                </th>
                {requestFields.slice(0, 4).map((f) => (
                  <th key={f.fieldId} className="p-2 text-start">
                    {currentLang === "ar" ? f.fieldLabelAr : f.fieldLabelEn}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {validRows.slice(0, 5).map((row, idx) => {
                const regVal = row[systemColMap.regionNo];
                const custNoVal =
                  row[
                    systemColMap.targetId ||
                      fieldColMap["target_id"] ||
                      fieldColMap["customer_no"]
                  ];
                const custNameVal =
                  row[
                    systemColMap.targetName ||
                      fieldColMap["target_name"] ||
                      fieldColMap["customer_name"]
                  ];

                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2">
                      <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        {regVal}
                      </span>
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-800">
                      {custNoVal}
                    </td>
                    <td className="p-2 font-semibold text-slate-900">
                      {custNameVal}
                    </td>
                    {requestFields.slice(0, 4).map((f) => {
                      const col = fieldColMap[f.fieldKey];
                      const val = col ? row[col] : row[f.fieldKey];
                      return (
                        <td key={f.fieldId} className="p-2 text-slate-600">
                          {val !== undefined &&
                          val !== null &&
                          String(val) !== "" ? (
                            <span
                              className={
                                f.isReadOnly ? "font-bold text-amber-900" : ""
                              }
                            >
                              {String(val)}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
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
    </div>
  );
};
