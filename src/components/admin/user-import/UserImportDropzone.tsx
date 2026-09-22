import React, { useRef, useState } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  Sparkles,
  Info,
  ArrowUpDown,
} from "lucide-react";

interface UserImportDropzoneProps {
  lang: string;
  fileName: string | null;
  swappedDetected: boolean;
  onFileSelected: (file: File) => void;
  onDownloadTemplate: () => void;
  onLoadDemoData: () => void;
}

export const UserImportDropzone: React.FC<UserImportDropzoneProps> = ({
  lang,
  fileName,
  swappedDetected,
  onFileSelected,
  onDownloadTemplate,
  onLoadDemoData,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelected(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200/80">
        <div className="flex items-center gap-2 text-xs text-purple-950 font-bold">
          <Info className="w-4 h-4 text-purple-700 shrink-0" />
          <span>
            {lang === "ar"
              ? "الأعمدة: [رقم_المستخدم (المعرف)] و [اسم_المستخدم] و [الفرع] و [رقم_الجوال]"
              : "Columns: [User_Number (ID)], [User_Name], [Branch], [Phone]"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-700" />
            <span>
              {lang === "ar"
                ? "تحميل نموذج Excel المعتمد"
                : "Download Sample Template"}
            </span>
          </button>

          <button
            type="button"
            onClick={onLoadDemoData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {lang === "ar"
                ? "تجربة عينة مناديب جدة والمدينة (18 منطقة)"
                : "Load Demo Sample"}
            </span>
          </button>
        </div>
      </div>

      {/* Auto-Swap Detection Banner if detected */}
      {swappedDetected && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <ArrowUpDown className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="font-bold">
            {lang === "ar"
              ? "ذكاء النظام: تم الكشف تلقائياً عن تبديل في محتوى العمودين A و B (تم تصحيح رقم المستخدم واسم المستخدم تلقائياً دون أي أخطاء)!"
              : "Auto-detected swapped columns A & B: Successfully corrected User No and User Name!"}
          </div>
        </div>
      )}

      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-purple-600 bg-purple-50"
            : "border-slate-300 hover:border-purple-400 bg-slate-50/50 hover:bg-white"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-2.5">
          <UploadCloud className="w-6 h-6" />
        </div>

        <p className="text-xs font-bold text-slate-800">
          {fileName ? (
            <span className="text-purple-950 font-extrabold flex items-center justify-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{fileName}</span>
            </span>
          ) : lang === "ar" ? (
            "اسحب وأفلت ملف إكسل (.xlsx, .xls, .csv) هنا، أو اضغط للاختيار من جهازك"
          ) : (
            "Drag and drop Excel (.xlsx, .xls, .csv) file here, or click to browse"
          )}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          {lang === "ar"
            ? "يتعرف المعالج تلقائياً على الأعمدة المتبادلة ويدمج صفوف نفس المستخدم تلقائياً"
            : "Smart mapping auto-detects swapped columns and merges rows for the same user"}
        </p>
      </div>
    </div>
  );
};
