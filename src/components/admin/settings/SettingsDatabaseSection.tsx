import React from "react";
import { useTranslation } from "react-i18next";
import {
  Database,
  AlertOctagon,
  Trash2,
  Download,
  RefreshCw,
  Check,
} from "lucide-react";

interface SettingsDatabaseSectionProps {
  lang: "ar" | "en";
  recordsLength: number;
  requestsLength: number;
  branchesLength: number;
  regionsLength: number;
  handleExportBackup: () => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (v: boolean) => void;
  resetAllData: () => void;
}

export const SettingsDatabaseSection: React.FC<
  SettingsDatabaseSectionProps
> = ({
  lang,
  recordsLength,
  requestsLength,
  branchesLength,
  regionsLength,
  handleExportBackup,
  showResetConfirm,
  setShowResetConfirm,
  resetAllData,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <>
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
            <Database className="w-4 h-4 text-purple-700" />
            <span>{t("settings.database.title", { lng: currentLang })}</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            {t("settings.database.adminControl", { lng: currentLang })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">
              {t("settings.database.records", { lng: currentLang })}
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {recordsLength}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">
              {t("settings.database.requests", { lng: currentLang })}
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {requestsLength}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">
              {t("settings.database.branches", { lng: currentLang })}
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {branchesLength}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">
              {t("settings.database.regions", { lng: currentLang })}
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {regionsLength}
            </div>
          </div>
        </div>



        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 text-[11px]">
            {t("settings.database.backupDesc", { lng: currentLang })}
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>
              {t("settings.database.exportBackup", { lng: currentLang })}
            </span>
          </button>
        </div>
      </div>

      {import.meta.env.DEV && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span>
              {t("settings.database.devRestoreTitle", { lng: currentLang })}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {t("settings.database.devRestoreDesc", { lng: currentLang })}
          </p>

          {showResetConfirm ? (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {t("settings.database.confirmRestore", { lng: currentLang })}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {t("settings.database.cancel", { lng: currentLang })}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>
                {t("settings.database.restoreBtn", { lng: currentLang })}
              </span>
            </button>
          )}
        </div>
      )}

    </>
  );
};
