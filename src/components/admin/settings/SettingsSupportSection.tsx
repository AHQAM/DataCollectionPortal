import React from "react";
import { useTranslation } from "react-i18next";
import { PhoneCall } from "lucide-react";

interface SettingsSupportSectionProps {
  lang: "ar" | "en";
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
}

export const SettingsSupportSection: React.FC<SettingsSupportSectionProps> = ({
  lang,
  phone,
  setPhone,
  email,
  setEmail,
  whatsapp,
  setWhatsapp,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-xs font-extrabold text-purple-950 pb-2 border-b border-slate-100">
        <PhoneCall className="w-4 h-4 text-purple-700" />
        <span>{t("settings.support.title", { lng: currentLang })}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {t("settings.support.phone", { lng: currentLang })}
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {t("settings.support.email", { lng: currentLang })}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            {t("settings.support.whatsapp", { lng: currentLang })}
          </label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
