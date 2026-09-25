import React from "react";
import { useTranslation } from "react-i18next";
import { RequestItem, User } from "../../../types";
import { CheckCircle2, Smartphone } from "lucide-react";

interface Props {
  lang?: string;
  currentRequest?: RequestItem;
  importStats: { total: number; created: number } | null;
  validRows: Record<string, any>[];
  systemColMap: Record<string, string>;
  users: User[];
  quickSwitchUser: (userId: string) => void;
  onBack: () => void;
  onReset: () => void;
}

export const ImportStepSuccess: React.FC<Props> = ({
  lang,
  currentRequest,
  importStats,
  validRows,
  systemColMap,
  users,
  quickSwitchUser,
  onBack,
  onReset,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center space-y-5">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h2 className="text-lg font-extrabold text-slate-900">
        {t("importWizard.step4.title", { lng: currentLang })}
      </h2>

      <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
        {t("importWizard.step4.description", {
          count: importStats?.created || validRows.length,
          title:
            currentLang === "ar"
              ? currentRequest?.titleAr || ""
              : currentRequest?.titleEn || currentRequest?.titleAr || "",
          lng: currentLang,
        })}
      </p>

      <div className="pt-3 flex flex-wrap justify-center gap-3">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          {t("importWizard.step4.goToRequests", { lng: currentLang })}
        </button>

        {import.meta.env.DEV && (
          <button
            onClick={() => {
              const firstValidReg = validRows[0]?.[systemColMap.regionNo];
              const rep = users.find(
                (u) =>
                  u.regionNo === firstValidReg ||
                  u.allowedRegionNos?.includes(firstValidReg),
              );
              if (rep) {
                quickSwitchUser(rep.userId);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {t("importWizard.step4.previewMobile", { lng: currentLang })}
            </span>
          </button>
        )}

        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
        >
          {t("importWizard.step4.importAnother", { lng: currentLang })}
        </button>
      </div>
    </div>
  );
};
