import React from 'react';
import { Building2, X, AlertTriangle } from 'lucide-react';
import { Branch } from '../../../types';

interface BranchModalProps {
  lang: string;
  showModal: boolean;
  editingBranch: Branch | null;
  branchCode: string;
  setBranchCode: (val: string) => void;
  branchNameAr: string;
  setBranchNameAr: (val: string) => void;
  branchNameEn: string;
  setBranchNameEn: (val: string) => void;
  alertError: string | null;
  handleSaveBranch: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const BranchModal: React.FC<BranchModalProps> = ({
  lang,
  showModal,
  editingBranch,
  branchCode,
  setBranchCode,
  branchNameAr,
  setBranchNameAr,
  branchNameEn,
  setBranchNameEn,
  alertError,
  handleSaveBranch,
  onClose,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">
              {editingBranch
                ? lang === 'ar' ? 'تعديل بيانات الفرع' : 'Edit Branch'
                : lang === 'ar' ? 'إضافة فرع جديد' : 'New Branch'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {alertError && (
          <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{alertError}</span>
          </div>
        )}

        <form onSubmit={handleSaveBranch} className="space-y-3.5 mt-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'ar' ? 'رمز الفرع (Branch ID)' : 'Branch ID'}
            </label>
            <input
              type="text"
              disabled={!!editingBranch}
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              placeholder="مثال: BR-RYD"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-mono font-bold uppercase disabled:bg-slate-100"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'ar' ? 'اسم الفرع (باللغة العربية)' : 'Branch Name (Arabic)'} *
            </label>
            <input
              type="text"
              value={branchNameAr}
              onChange={(e) => setBranchNameAr(e.target.value)}
              placeholder="مثال: فرع المنطقة الجنوبية (أبها وخميس مشيط)"
              className="w-full h-10 px-3 rounded-xl border border-slate-300 font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {lang === 'ar' ? 'اسم الفرع (باللغة الإنجليزية)' : 'Branch Name (English)'}
            </label>
            <input
              type="text"
              value={branchNameEn}
              onChange={(e) => setBranchNameEn(e.target.value)}
              placeholder="e.g. Southern Region Branch (Abha)"
              className="w-full h-10 px-3 rounded-xl border border-slate-300"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-extrabold shadow-sm transition-all cursor-pointer"
            >
              {lang === 'ar' ? 'حفظ الفرع' : 'Save Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
