import React from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Sliders,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { RequestItem } from "../../../types";

interface FormBuilderHeaderProps {
  lang: "ar" | "en";
  dir: "rtl" | "ltr";
  currentRequest?: RequestItem;
  requestId: string;
  onBack: () => void;
  onOpenImportWizard?: (requestId: string) => void;
  handleLoadInactiveCustomersPreset: () => void;
  handleLoadGeneralSurveyPreset: () => void;
  handleLoadAssetAuditPreset: () => void;
  handleSaveAll: () => void;
  saveSuccess: boolean;
}

export const FormBuilderHeader: React.FC<FormBuilderHeaderProps> = ({
  lang,
  dir,
  currentRequest,
  requestId,
  onBack,
  onOpenImportWizard,
  handleLoadInactiveCustomersPreset,
  handleLoadGeneralSurveyPreset,
  handleLoadAssetAuditPreset,
  handleSaveAll,
  saveSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  const requestTitle =
    currentLang === "ar"
      ? currentRequest?.titleAr
      : currentRequest?.titleEn || currentRequest?.titleAr;

  return (
    <>
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all flex items-center gap-1.5 text-xs cursor-pointer"
          >
            {dir === "rtl" ? (
              <ArrowRight className="w-4 h-4" />
            ) : (
              <ArrowLeft className="w-4 h-4" />
            )}
            <span>{t("formBuilder.back", { lng: currentLang })}</span>
          </button>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-700" />
              <span>{t("formBuilder.title", { lng: currentLang })}</span>
              <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {currentRequest?.requestCode}
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 truncate">
                {requestTitle}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                <span>
                  {t("formBuilder.version", {
                    version: currentRequest?.formSchemaVersion || 1,
                    lng: currentLang,
                  })}
                </span>
              </span>
              {currentRequest?.status === "Published" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>
                    {t("formBuilder.publishedBadge", { lng: currentLang })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenImportWizard && (
            <button
              type="button"
              onClick={() => onOpenImportWizard(requestId)}
              className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title={t("formBuilder.importExcelTitle", { lng: currentLang })}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {t("formBuilder.importExcelBtn", { lng: currentLang })}
              </span>
            </button>
          )}

          <div className="relative inline-flex items-center">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value === "general")
                  handleLoadGeneralSurveyPreset();
                else if (e.target.value === "asset")
                  handleLoadAssetAuditPreset();
                else if (e.target.value === "debt")
                  handleLoadInactiveCustomersPreset();
                e.target.value = "";
              }}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all shadow-2xs cursor-pointer appearance-none pe-7"
            >
              <option value="" disabled>
                {t("formBuilder.presetPlaceholder", { lng: currentLang })}
              </option>
              <option value="general">
                {t("formBuilder.presetGeneral", { lng: currentLang })}
              </option>
              <option value="asset">
                {t("formBuilder.presetAsset", { lng: currentLang })}
              </option>
              <option value="debt">
                {t("formBuilder.presetDebt", { lng: currentLang })}
              </option>
            </select>
            <Sparkles className="w-3.5 h-3.5 text-amber-600 absolute end-2 pointer-events-none" />
          </div>

          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {t("formBuilder.saveSuccess", {
                  version: currentRequest?.formSchemaVersion || 1,
                  lng: currentLang,
                })}
              </span>
            </span>
          )}
          <button
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title={t("formBuilder.saveTooltip", { lng: currentLang })}
          >
            <Save className="w-4 h-4" />
            <span>
              {currentRequest?.status === "Published"
                ? t("formBuilder.savePublished", { lng: currentLang })
                : t("formBuilder.saveDraft", { lng: currentLang })}
            </span>
          </button>
        </div>
      </div>

      {currentRequest?.status === "Published" && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold">
              {t("formBuilder.publishedNoticeTitle", {
                version: currentRequest.formSchemaVersion || 1,
                lng: currentLang,
              })}
            </span>
            <span className="text-emerald-700 hidden sm:inline">
              — {t("formBuilder.publishedNoticeDesc", { lng: currentLang })}
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded">
            Auto-Sync Live
          </span>
        </div>
      )}
    </>
  );
};
