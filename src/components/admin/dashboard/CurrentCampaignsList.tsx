import React from "react";
import { useTranslation } from "react-i18next";
import { Clock, ArrowUpRight } from "lucide-react";
import { RequestItem } from "../../../types";

interface CurrentCampaignsListProps {
  lang?: "ar" | "en";
  onNavigate: (module: string) => void;
  requests: RequestItem[];
}

export const CurrentCampaignsList: React.FC<CurrentCampaignsListProps> = ({
  lang,
  onNavigate,
  requests,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = lang || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700" />
            <span>{t("dashboard.currentCampaigns", { lng: currentLang })}</span>
          </h2>
          <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
            {requests.length}
          </span>
        </div>

        <div className="space-y-3">
          {requests.slice(0, 3).map((req) => (
            <div
              key={req.requestId}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/70"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-bold text-xs text-slate-800 line-clamp-1">
                  {currentLang === "ar" ? req.titleAr : req.titleEn}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    req.status === "Published"
                      ? "bg-emerald-100 text-emerald-800"
                      : req.status === "Archived"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                <span className="font-mono text-purple-700">
                  {req.requestCode}
                </span>
                <span>
                  {t("dashboard.due", { lng: currentLang })}
                  {new Date(req.dueAt).toLocaleDateString(
                    currentLang === "ar" ? "ar-SA" : "en-US",
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4">
        <button
          onClick={() => onNavigate("requests")}
          className="w-full h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{t("dashboard.manageAllRequests", { lng: currentLang })}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
