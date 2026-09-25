import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, FilePlus, Settings } from "lucide-react";

interface DashboardBannerProps {
  lang?: "ar" | "en";
  onNavigate: (module: string) => void;
}

export const DashboardBanner: React.FC<DashboardBannerProps> = ({
  lang,
  onNavigate,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = lang || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="bg-gradient-to-r from-[#2d0a3d] to-[#4a1264] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-800">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-700/80 text-purple-200 border border-purple-500/30">
          {t("dashboard.title", { lng: currentLang })}
        </span>
        <h1 className="text-xl md:text-2xl font-extrabold mt-1">
          {t("dashboard.subtitle", { lng: currentLang })}
        </h1>
        <p className="text-xs text-purple-200/90 mt-1 max-w-xl">
          {t("dashboard.desc", { lng: currentLang })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-10">
        <button
          type="button"
          onClick={() => onNavigate("branches")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          <Building2 className="w-4 h-4" />
          <span>{t("dashboard.branches", { lng: currentLang })}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("requests")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>{t("dashboard.newRequest", { lng: currentLang })}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("settings")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
          title={t("dashboard.settingsTitle", { lng: currentLang })}
        >
          <Settings className="w-4 h-4" />
          <span>{t("dashboard.settings", { lng: currentLang })}</span>
        </button>
      </div>
    </div>
  );
};
