import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePWAInstall } from "../../hooks/usePWAInstall";
import { Download, Smartphone, Share, PlusSquare, X } from "lucide-react";

interface Props {
  variant?: "banner" | "button" | "card";
  className?: string;
}

export const PWAInstallBanner: React.FC<Props> = ({
  variant = "banner",
  className = "",
}) => {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, isStandalone, isIOS, install } =
    usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as an installed PWA / standalone, suppress the prompt
  if (isInstalled || isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (isInstallable) {
      setInstalling(true);
      await install();
      setInstalling(false);
    } else {
      // Fallback for browsers that don't trigger beforeinstallprompt directly
      setShowIOSModal(true);
    }
  };

  if (variant === "button") {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer ${className}`}
          title={t("pwa.installOnDevice")}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t("pwa.installApp")}</span>
        </button>

        {showIOSModal && (
          <IOSGuideModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  if (variant === "card") {
    return (
      <>
        <div
          className={`bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-2xl shadow-md relative overflow-hidden ${className}`}
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Smartphone className="w-6 h-6 text-purple-200" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">
                  {t("pwa.mobileTitle")}
                </h3>
                <p className="text-[11px] text-purple-200 mt-0.5 max-w-[280px]">
                  {t("pwa.mobileDesc")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-purple-300 hover:text-white rounded-lg hover:bg-white/10"
              title={t("pwa.close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center gap-2 relative z-10">
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="flex-1 py-2 px-3 rounded-xl bg-white text-purple-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow hover:bg-purple-50 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-purple-900" />
              <span>
                {isIOS ? t("pwa.howToInstallIos") : t("pwa.installOnDevice")}
              </span>
            </button>
          </div>
        </div>

        {showIOSModal && (
          <IOSGuideModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }

  // Default 'banner' variant (sticky at top or bottom for mobile)
  return (
    <>
      <div
        className={`bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 text-white px-3.5 py-2.5 shadow-md flex items-center justify-between gap-2 border-b border-purple-800/60 ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
            <Smartphone className="w-4 h-4 text-purple-200" />
          </div>
          <div className="truncate">
            <div className="text-xs font-extrabold truncate">
              {t("pwa.bannerTitle")}
            </div>
            <div className="text-[10px] text-purple-200 truncate">
              {t("pwa.bannerSubtitle")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>{t("pwa.install")}</span>
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-md text-purple-300 hover:text-white hover:bg-white/10 transition-all"
            title={t("pwa.close")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIOSModal && <IOSGuideModal onClose={() => setShowIOSModal(false)} />}
    </>
  );
};

const IOSGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-slate-800 border border-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {t("pwa.mobileTitle")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs">
          <p className="text-slate-600 font-medium leading-relaxed">
            {t("pwa.iosModalDesc")}
          </p>

          <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-purple-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <span className="font-bold block text-slate-900">
                  {t("pwa.iosStep1Title")}
                </span>
                <span className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <Share className="w-3.5 h-3.5 text-blue-600 inline" />
                  <span>{t("pwa.iosStep1Desc")}</span>
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-purple-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <span className="font-bold block text-slate-900">
                  {t("pwa.iosStep2Title")}
                </span>
                <span className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <PlusSquare className="w-3.5 h-3.5 text-purple-700 inline" />
                  <span>{t("pwa.iosStep2Desc")}</span>
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <span className="font-bold block text-slate-900">
                  {t("pwa.iosStep3Title")}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {t("pwa.iosStep3Desc")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
        >
          {t("pwa.understood")}
        </button>
      </div>
    </div>
  );
};
