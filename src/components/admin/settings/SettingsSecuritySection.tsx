import React from "react";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";

interface SettingsSecuritySectionProps {
  lang: "ar" | "en";
  maxFailedAttempts: number;
  setMaxFailedAttempts: (v: number) => void;
  lockoutDurationMinutes: number;
  setLockoutDurationMinutes: (v: number) => void;
}

export const SettingsSecuritySection: React.FC<
  SettingsSecuritySectionProps
> = ({
  lang,
  maxFailedAttempts,
  setMaxFailedAttempts,
  lockoutDurationMinutes,
  setLockoutDurationMinutes,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-xs font-extrabold text-purple-950 pb-2 border-b border-slate-100">
        <Shield className="w-4 h-4 text-purple-700" />
        <span>{t("settings.security.title", { lng: currentLang })}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {t("settings.security.maxFailed", { lng: currentLang })}
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={maxFailedAttempts}
            onChange={(e) => setMaxFailedAttempts(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            {t("settings.security.maxFailedHelp", { lng: currentLang })}
          </span>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {t("settings.security.lockoutDuration", { lng: currentLang })}
          </label>
          <input
            type="number"
            min={5}
            max={120}
            value={lockoutDurationMinutes}
            onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">
            {t("settings.security.lockoutDurationHelp", { lng: currentLang })}
          </span>
        </div>
      </div>

      <div className="p-3 bg-purple-50/70 rounded-xl text-xs space-y-1 text-purple-950">
        <div className="font-bold">
          {t("settings.security.rulesTitle", { lng: currentLang })}
        </div>
        <div className="text-[11px] text-slate-600">
          {t("settings.security.rule1", { lng: currentLang })}
        </div>
        <div className="text-[11px] text-slate-600">
          {t("settings.security.rule2", { lng: currentLang })}
        </div>
        <div className="text-[11px] text-slate-600">
          {t("settings.security.rule3", { lng: currentLang })}
        </div>
        <div className="text-[11px] text-slate-600">
          {t("settings.security.rule4", { lng: currentLang })}
        </div>
      </div>
    </div>
  );
};
