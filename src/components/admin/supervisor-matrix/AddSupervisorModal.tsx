import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Branch } from "../../../types";
import { UserPlus, X } from "lucide-react";

interface AddSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    userNameAr: string;
    userNameEn: string;
    userNo: string;
    branchId: string;
    mobile: string;
  }) => void;
  branches: Branch[];
  lang: "ar" | "en";
}

export const AddSupervisorModal: React.FC<AddSupervisorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  branches,
  lang,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang =
    (lang as "ar" | "en") || (i18n.language as "ar" | "en") || "ar";

  const [newSupNameAr, setNewSupNameAr] = useState("");
  const [newSupNameEn, setNewSupNameEn] = useState("");
  const [newSupNo, setNewSupNo] = useState("");
  const [newSupBranchId, setNewSupBranchId] = useState(
    branches[0]?.branchId || "",
  );
  const [newSupMobile, setNewSupMobile] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      userNameAr: newSupNameAr,
      userNameEn: newSupNameEn,
      userNo: newSupNo,
      branchId: newSupBranchId || branches[0]?.branchId || "",
      mobile: newSupMobile,
    });
    setNewSupNameAr("");
    setNewSupNameEn("");
    setNewSupNo("");
    setNewSupMobile("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-900" />
            <span>{t("supervisors.modal.title", { lng: currentLang })}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t("supervisors.modal.nameAr", { lng: currentLang })} *
            </label>
            <input
              type="text"
              value={newSupNameAr}
              onChange={(e) => setNewSupNameAr(e.target.value)}
              placeholder={t("supervisors.modal.nameArPlaceholder", {
                lng: currentLang,
              })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t("supervisors.modal.userNo", { lng: currentLang })} *
            </label>
            <input
              type="text"
              value={newSupNo}
              onChange={(e) => setNewSupNo(e.target.value)}
              placeholder={t("supervisors.modal.userNoPlaceholder", {
                lng: currentLang,
              })}
              required
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t("supervisors.modal.branch", { lng: currentLang })} *
            </label>
            <select
              value={newSupBranchId || branches[0]?.branchId || ""}
              onChange={(e) => setNewSupBranchId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold bg-white"
            >
              {branches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {currentLang === "ar" ? b.branchNameAr : b.branchNameEn} (
                  {b.branchId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {t("supervisors.modal.mobile", { lng: currentLang })}
            </label>
            <input
              type="tel"
              value={newSupMobile}
              onChange={(e) => setNewSupMobile(e.target.value)}
              placeholder={t("supervisors.modal.mobilePlaceholder", {
                lng: currentLang,
              })}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              {t("supervisors.modal.cancel", { lng: currentLang })}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black shadow-sm transition-all cursor-pointer"
            >
              {t("supervisors.modal.submit", { lng: currentLang })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
