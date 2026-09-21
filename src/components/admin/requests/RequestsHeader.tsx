import React from "react";
import { FileSpreadsheet, FilePlus } from "lucide-react";

interface RequestsHeaderProps {
  lang: "ar" | "en";
  onOpenImportWizard: (requestId: string) => void;
  onOpenCreateModal: () => void;
}

export const RequestsHeader: React.FC<RequestsHeaderProps> = ({
  lang,
  onOpenImportWizard,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
      <div>
        <h1 className="text-lg font-extrabold text-slate-900">
          {lang === "ar"
            ? "إدارة حملات وطلبات جمع البيانات"
            : "Data Collection Requests"}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {lang === "ar"
            ? "إنشاء وتعديل ونشر وأرشفة نماذج جمع البيانات بدون تعديل الكود"
            : "Create, build dynamic forms, publish, and archive field collection tasks"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpenImportWizard("")}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          title={
            lang === "ar"
              ? "إدراج بيانات الحملات والعملاء من ملفات الإكسل"
              : "Import data from Excel"
          }
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>
            {lang === "ar" ? "إدراج بيانات من Excel" : "Import from Excel"}
          </span>
        </button>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>{lang === "ar" ? "إنشاء طلب جديد" : "Create New Request"}</span>
        </button>
      </div>
    </div>
  );
};
