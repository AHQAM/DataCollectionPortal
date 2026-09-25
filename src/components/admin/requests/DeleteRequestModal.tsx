import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { RequestItem } from "../../../types";

interface DeleteRequestModalProps {
  request: RequestItem | null;
  onClose: () => void;
  onConfirm: (requestId: string) => void;
  lang: "ar" | "en";
  isDeleting: boolean;
}

export const DeleteRequestModal: React.FC<DeleteRequestModalProps> = ({
  request,
  onClose,
  onConfirm,
  lang,
  isDeleting,
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-sm text-slate-900 text-center mb-1">
          {lang === "ar" ? "تأكيد حذف الطلب بالكامل" : "Confirm Delete Request"}
        </h3>
        <p className="text-xs text-slate-500 text-center mb-4">
          {lang === "ar"
            ? `هل أنت متأكد من رغبتك في حذف "${request.titleAr}" (${request.requestCode}) وجميع التكليفات والحقول والسجلات التابعة له؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete "${request.titleEn}" (${request.requestCode}) and all associated assignments, fields, and records? This action cannot be undone.`}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-50"
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(request.requestId)}
            disabled={isDeleting}
            className="flex-1 h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{lang === "ar" ? "نعم، احذف نهائياً" : "Yes, Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
