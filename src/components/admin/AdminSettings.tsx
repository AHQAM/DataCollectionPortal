import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Settings, CheckCircle2 } from "lucide-react";
import { SettingsSecuritySection } from "./settings/SettingsSecuritySection";
import { SettingsSupportSection } from "./settings/SettingsSupportSection";
import { SettingsDatabaseSection } from "./settings/SettingsDatabaseSection";

export const AdminSettings: React.FC = () => {
  const {
    lang,
    appSettings,
    updateAppSettings,
    resetAllData,
    wipeDemoDataForProduction,
    records,
    requests,
    branches,
    regions,
    users,
    t,
  } = useApp();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Wipe Demo Data Modal State
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeBranchesAlso, setWipeBranchesAlso] = useState(false);
  const [wipeSuccessMsg, setWipeSuccessMsg] = useState<string | null>(null);

  // JSON Backup export / import
  const [backupSuccessMsg, setBackupSuccessMsg] = useState<string | null>(null);

  // Local settings form state
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(
    appSettings.maxLoginAttempts ||
      appSettings.securityPolicy?.maxFailedAttempts ||
      3,
  );
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(
    appSettings.lockoutMinutes ||
      appSettings.securityPolicy?.lockoutDurationMinutes ||
      15,
  );
  const [phone, setPhone] = useState(appSettings.supportContact.phone);
  const [email, setEmail] = useState(appSettings.supportContact.email);
  const [whatsapp, setWhatsapp] = useState(appSettings.supportContact.whatsapp);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppSettings({
      maxLoginAttempts: maxFailedAttempts,
      lockoutMinutes: lockoutDurationMinutes,
      securityPolicy: {
        maxFailedAttempts,
        lockoutDurationMinutes,
      },
      supportContact: {
        phone,
        email,
        whatsapp,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmWipe = () => {
    wipeDemoDataForProduction({ wipeBranchesAndRegions: wipeBranchesAlso });
    setShowWipeModal(false);
    setWipeSuccessMsg(
      t("auto.allDemoDataWiped"),
    );
    setTimeout(() => setWipeSuccessMsg(null), 5000);
  };

  // Export full JSON database backup
  const handleExportBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      version: "2.4.0",
      system: "Field Sales Collection Hub",
      branches,
      regions,
      users,
      requests,
      records,
      settings: appSettings,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute(
      "download",
      `database_backup_${new Date().toISOString().slice(0, 10)}.json`,
    );
    dlAnchor.click();

    setBackupSuccessMsg(
      t("auto.databaseBackupDownloadedSuccessfully"),
    );
    setTimeout(() => setBackupSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-700" />
            <span>
              {t("auto.systemSettingsSecurityPolicies")}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("auto.configureAuthenticationRulesAccount")}
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {t("auto.settingsSaved")}
            </span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <SettingsSecuritySection
          lang={lang}
          maxFailedAttempts={maxFailedAttempts}
          setMaxFailedAttempts={setMaxFailedAttempts}
          lockoutDurationMinutes={lockoutDurationMinutes}
          setLockoutDurationMinutes={setLockoutDurationMinutes}
        />

        <SettingsSupportSection
          lang={lang}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          whatsapp={whatsapp}
          setWhatsapp={setWhatsapp}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer"
          >
            {t("auto.saveSystemSettings")}
          </button>
        </div>
      </form>

      {/* Success Notifications */}
      {wipeSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{wipeSuccessMsg}</span>
          </div>
          <button
            onClick={() => setWipeSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {backupSuccessMsg && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span>{backupSuccessMsg}</span>
          </div>
          <button
            onClick={() => setBackupSuccessMsg(null)}
            className="text-blue-700 hover:text-blue-900 text-xs cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <SettingsDatabaseSection
        lang={lang}
        recordsLength={records.length}
        requestsLength={requests.length}
        branchesLength={branches.length}
        regionsLength={regions.length}
        setWipeBranchesAlso={setWipeBranchesAlso}
        setShowWipeModal={setShowWipeModal}
        handleExportBackup={handleExportBackup}
        showResetConfirm={showResetConfirm}
        setShowResetConfirm={setShowResetConfirm}
        resetAllData={resetAllData}
        wipeBranchesAlso={wipeBranchesAlso}
        showWipeModal={showWipeModal}
        handleConfirmWipe={handleConfirmWipe}
      />
    </div>
  );
};
