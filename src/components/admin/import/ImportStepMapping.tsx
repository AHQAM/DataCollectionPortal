import React from "react";
import { useTranslation } from "react-i18next";
import { RequestField } from "../../../types";
import {
  FileSpreadsheet,
  Building,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface Props {
  lang?: string;
  dir?: string;
  fileName: string;
  rawRowsCount: number;
  fileHeaders: string[];
  systemColMap: Record<string, string>;
  setSystemColMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  fieldColMap: Record<string, string>;
  setFieldColMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  requestFields: RequestField[];
  onBackToStep1: () => void;
  onValidate: () => void;
}

export const ImportStepMapping: React.FC<Props> = ({
  lang,
  dir,
  fileName,
  rawRowsCount,
  fileHeaders,
  systemColMap,
  setSystemColMap,
  fieldColMap,
  setFieldColMap,
  requestFields,
  onBackToStep1,
  onValidate,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";
  const currentDir = dir || (currentLang === "ar" ? "rtl" : "ltr");

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>{t("importWizard.step2.title", { lng: currentLang })}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("importWizard.step2.summary", {
              file: fileName,
              rows: rawRowsCount,
              cols: fileHeaders.length,
              lng: currentLang,
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBackToStep1}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
          >
            {t("importWizard.step2.changeFile", { lng: currentLang })}
          </button>
          <button
            onClick={onValidate}
            className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>
              {t("importWizard.step2.nextValidate", { lng: currentLang })}
            </span>
            {currentDir === "rtl" ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Section A: Core System Routing Fields */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Building className="w-4 h-4 text-purple-700" />
          <span>{t("importWizard.step2.sectionA", { lng: currentLang })}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {/* Region No */}
          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <label className="font-extrabold text-purple-950">
                {t("importWizard.step2.regionNo", { lng: currentLang })}
              </label>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                {t("importWizard.step2.requiredForAssign", {
                  lng: currentLang,
                })}
              </span>
            </div>
            <select
              value={systemColMap.regionNo || ""}
              onChange={(e) =>
                setSystemColMap({ ...systemColMap, regionNo: e.target.value })
              }
              className="w-full h-9 px-2 rounded-lg border border-purple-300 bg-white font-mono text-xs font-bold text-slate-900"
            >
              <option value="">
                {t("importWizard.step2.selectRegionCol", { lng: currentLang })}
              </option>
              {fileHeaders.map((h) => (
                <option key={h} value={h}>
                  {t("importWizard.step2.colPrefix", {
                    name: h,
                    lng: currentLang,
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Customer / Target ID */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="font-extrabold text-slate-800">
                {t("importWizard.step2.recordKeyId", { lng: currentLang })}
              </label>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                {t("importWizard.step2.recordKeyBadge", { lng: currentLang })}
              </span>
            </div>
            <select
              value={systemColMap.targetId || ""}
              onChange={(e) =>
                setSystemColMap({ ...systemColMap, targetId: e.target.value })
              }
              className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
            >
              <option value="">
                {t("importWizard.step2.selectRecordIdCol", {
                  lng: currentLang,
                })}
              </option>
              {fileHeaders.map((h) => (
                <option key={h} value={h}>
                  {t("importWizard.step2.colPrefix", {
                    name: h,
                    lng: currentLang,
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Customer / Target Name */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1">
              <label className="font-extrabold text-slate-800">
                {t("importWizard.step2.targetName", { lng: currentLang })}
              </label>
            </div>
            <select
              value={systemColMap.targetName || ""}
              onChange={(e) =>
                setSystemColMap({
                  ...systemColMap,
                  targetName: e.target.value,
                })
              }
              className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
            >
              <option value="">
                {t("importWizard.step2.selectTargetNameCol", {
                  lng: currentLang,
                })}
              </option>
              {fileHeaders.map((h) => (
                <option key={h} value={h}>
                  {t("importWizard.step2.colPrefix", {
                    name: h,
                    lng: currentLang,
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Branch */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-1">
              {t("importWizard.step2.branchName", { lng: currentLang })}
            </label>
            <select
              value={systemColMap.branchName || ""}
              onChange={(e) =>
                setSystemColMap({ ...systemColMap, branchName: e.target.value })
              }
              className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
            >
              <option value="">
                {t("importWizard.step2.autoBranch", { lng: currentLang })}
              </option>
              {fileHeaders.map((h) => (
                <option key={h} value={h}>
                  {t("importWizard.step2.colPrefix", {
                    name: h,
                    lng: currentLang,
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Rep No */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-1">
              {t("importWizard.step2.userNo", { lng: currentLang })}
            </label>
            <select
              value={systemColMap.userNo || ""}
              onChange={(e) =>
                setSystemColMap({ ...systemColMap, userNo: e.target.value })
              }
              className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
            >
              <option value="">
                {t("importWizard.step2.autoUser", { lng: currentLang })}
              </option>
              {fileHeaders.map((h) => (
                <option key={h} value={h}>
                  {t("importWizard.step2.colPrefix", {
                    name: h,
                    lng: currentLang,
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-bold text-slate-800 mb-1">
              {t("importWizard.step2.area", { lng: currentLang })}
            </label>
            <select
              value={systemColMap.area || ""}
              onChange={(e) =>
                setSystemColMap({ ...systemColMap, area: e.target.value })
              }
              className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900"
            >
              <option value="">
                {t("importWizard.step2.ignore", { lng: currentLang })}
              </option>
              {fileHeaders.map((h) => (
                <option key={h} value={h}>
                  {t("importWizard.step2.colPrefix", {
                    name: h,
                    lng: currentLang,
                  })}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section B: Dynamic Request Form Fields */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-700" />
            <span>
              {t("importWizard.step2.sectionB", {
                count: requestFields.length,
                lng: currentLang,
              })}
            </span>
          </h3>
          <span className="text-[11px] text-slate-500">
            {t("importWizard.step2.readOnlyNotice", { lng: currentLang })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {requestFields.map((field) => (
            <div
              key={field.fieldId}
              className={`p-3 rounded-xl border transition-all ${
                field.isReadOnly
                  ? "bg-amber-50/40 border-amber-300"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-extrabold text-slate-900 truncate">
                  {currentLang === "ar"
                    ? field.fieldLabelAr
                    : field.fieldLabelEn}
                </div>
                <div className="flex gap-1">
                  {field.isReadOnly && (
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>
                        {t("importWizard.step2.readOnlyBadge", {
                          lng: currentLang,
                        })}
                      </span>
                    </span>
                  )}
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1 rounded">
                    {field.fieldType}
                  </span>
                </div>
              </div>

              <select
                value={fieldColMap[field.fieldKey] || ""}
                onChange={(e) =>
                  setFieldColMap({
                    ...fieldColMap,
                    [field.fieldKey]: e.target.value,
                  })
                }
                className="w-full h-9 px-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600"
              >
                <option value="">
                  {t("importWizard.step2.ignoreOrBlank", {
                    lng: currentLang,
                  })}
                </option>
                {fileHeaders.map((h) => (
                  <option key={h} value={h}>
                    {t("importWizard.step2.colPrefix", {
                      name: h,
                      lng: currentLang,
                    })}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
