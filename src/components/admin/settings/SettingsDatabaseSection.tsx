import i18n from "../../../i18n";
import React from "react";
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
  setWipeBranchesAlso: (v: boolean) => void;
  setShowWipeModal: (v: boolean) => void;
  handleExportBackup: () => void;
  showResetConfirm: boolean;
  setShowResetConfirm: (v: boolean) => void;
  resetAllData: () => void;
  wipeBranchesAlso: boolean;
  showWipeModal: boolean;
  handleConfirmWipe: () => void;
}

export const SettingsDatabaseSection: React.FC<
  SettingsDatabaseSectionProps
> = ({
  lang,
  recordsLength,
  requestsLength,
  branchesLength,
  regionsLength,
  setWipeBranchesAlso,
  setShowWipeModal,
  handleExportBackup,
  showResetConfirm,
  setShowResetConfirm,
  resetAllData,
  wipeBranchesAlso,
  showWipeModal,
  handleConfirmWipe,
}) => {
  return (
    <>
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
            <Database className="w-4 h-4 text-purple-700" />
            <span>
              {i18n.t("auto.databaseManagementProductionOps")}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
            {i18n.t("auto.adminControl")}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">
              {i18n.t("auto.customerRecords")}
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {recordsLength}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">
              {i18n.t("auto.collectionRequests")}
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {requestsLength}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">
              {i18n.t("auto.registeredBranches")}
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {branchesLength}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-slate-500 text-[11px]">
              {i18n.t("auto.regionsReps")}
            </div>
            <div className="text-base font-black text-slate-800 mt-0.5">
              {regionsLength}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/80 to-amber-50/60 border border-rose-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-950 font-black text-xs">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {i18n.t("auto.wipeDemoDataStart")}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 max-w-xl leading-relaxed">
              {i18n.t("auto.purgeMockCustomerRecords")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setWipeBranchesAlso(false);
              setShowWipeModal(true);
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {i18n.t("auto.wipeDemoData")}
            </span>
          </button>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-600 text-[11px]">
            {i18n.t("auto.exportFullDatabaseBackup")}
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-700" />
            <span>
              {i18n.t("auto.exportJsonBackup")}
            </span>
          </button>
        </div>
      </div>

      {import.meta.env.DEV && (
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
            <RefreshCw className="w-4 h-4 text-slate-600" />
            <span>
              {i18n.t("auto.restoreDefaultSeedData")}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {i18n.t("auto.developmentToolRestoreMock")}
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
                {i18n.t("auto.yesRestoreSeedData")}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {i18n.t("auto.cancel")}
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
                {i18n.t("auto.restoreInitialDemoData")}
              </span>
            </button>
          )}
        </div>
      )}

      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {i18n.t("auto.wipeDemoDataFor")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                {i18n.t("auto.thisWillPurgeAll")}
              </p>
            </div>

            <div className="my-4 p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 space-y-2 text-xs">
              <div className="font-extrabold text-rose-950 flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {i18n.t("auto.purgeTestRecordsRequests")}
                </span>
              </div>
              <div className="font-extrabold text-rose-950 flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  {i18n.t("auto.preserveAdminUserSo")}
                </span>
              </div>

              <div className="pt-2 border-t border-rose-200 mt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-800 font-bold select-none">
                  <input
                    type="checkbox"
                    checked={wipeBranchesAlso}
                    onChange={(e) => setWipeBranchesAlso(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                  />
                  <span>
                    {i18n.t("auto.alsoWipeDemoBranches")}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWipeModal(false)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                {i18n.t("auto.cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmWipe}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {i18n.t("auto.confirmWipeStartClean")}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
