import React from "react";
import i18n from "../../../i18n";

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "ar" | "en";
  templateNameAr: string;
  setTemplateNameAr: (name: string) => void;
  templateNameEn: string;
  setTemplateNameEn: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  lang,
  templateNameAr,
  setTemplateNameAr,
  templateNameEn,
  setTemplateNameEn,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200">
        <h3 className="font-bold text-sm text-slate-900 mb-1">
          {i18n.t("auto.saveAsRequestTemplate")}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          {i18n.t("auto.saveFieldSchemaTo")}
        </p>

        <form onSubmit={onSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.templateNameArabic")}
            </label>
            <input
              type="text"
              value={templateNameAr}
              onChange={(e) => setTemplateNameAr(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {i18n.t("auto.templateNameEnglish")}
            </label>
            <input
              type="text"
              value={templateNameEn}
              onChange={(e) => setTemplateNameEn(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-slate-300"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              {i18n.t("auto.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 h-9 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold"
            >
              {i18n.t("auto.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
