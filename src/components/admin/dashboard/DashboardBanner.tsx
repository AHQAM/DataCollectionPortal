import React from "react";
import { Building2, FilePlus, Settings } from "lucide-react";
import i18n from "../../../i18n";

interface DashboardBannerProps {
  lang: "ar" | "en";
  onNavigate: (module: string) => void;
}

export const DashboardBanner: React.FC<DashboardBannerProps> = ({
  lang,
  onNavigate,
}) => {
  return (
    <div className="bg-gradient-to-r from-[#2d0a3d] to-[#4a1264] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-800">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-700/80 text-purple-200 border border-purple-500/30">
          {i18n.t("auto.executiveDashboard")}
        </span>
        <h1 className="text-xl md:text-2xl font-extrabold mt-1">
          {i18n.t("auto.dynamicDataCollectionPortal")}
        </h1>
        <p className="text-xs text-purple-200/90 mt-1 max-w-xl">
          {i18n.t("auto.realtimeCampaignProgressBranch")}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-10">
        <button
          type="button"
          onClick={() => onNavigate("branches")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
        >
          <Building2 className="w-4 h-4" />
          <span>
            {i18n.t("auto.branchesZones")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("requests")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>{i18n.t("auto.newRequest")}</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("settings")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-600/50 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer"
          title={
            i18n.t("auto.systemSettingsDatabase")
          }
        >
          <Settings className="w-4 h-4" />
          <span>
            {i18n.t("auto.settingsDb")}
          </span>
        </button>
      </div>
    </div>
  );
};
