import React from "react";
import { RequestItem, RequestField } from "../../../types";
import { FileSpreadsheet, UploadCloud, Sparkles, Lock } from "lucide-react";
import i18n from "../../../i18n";

interface Props {
  lang: string;
  selectableRequests: RequestItem[];
  selectedRequestId: string;
  setSelectedRequestId: (id: string) => void;
  currentRequest?: RequestItem;
  requestFields: RequestField[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadDemoData: () => void;
}

export const ImportStepSelectFile: React.FC<Props> = ({
  lang,
  selectableRequests,
  selectedRequestId,
  setSelectedRequestId,
  currentRequest,
  requestFields,
  onFileUpload,
  onLoadDemoData,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      {/* Target Request Picker */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <label className="block text-xs font-extrabold text-slate-900">
          {i18n.t("auto.1TargetCollectionRequest")}
        </label>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <select
            value={selectedRequestId}
            onChange={(e) => setSelectedRequestId(e.target.value)}
            className="w-full sm:max-w-md h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-600"
          >
            {selectableRequests.map((r) => (
              <option key={r.requestId} value={r.requestId}>
                {r.requestCode} - {lang === "ar" ? r.titleAr : r.titleEn} (
                {r.status})
              </option>
            ))}
          </select>

          {currentRequest && (
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold">
                {requestFields.length} {i18n.t("auto.formFields")}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>
                  {requestFields.filter((f) => f.isReadOnly).length}{" "}
                  {i18n.t("auto.readonly1")}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="border-2 border-dashed border-purple-200 hover:border-purple-600 bg-purple-50/20 rounded-2xl p-8 text-center transition-all">
        <FileSpreadsheet className="w-12 h-12 mx-auto text-emerald-700 mb-3" />
        <h3 className="font-extrabold text-sm text-slate-800">
          {i18n.t("auto.dropYourExcelFile")}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {i18n.t("auto.supportsXlsxXlsCsv")}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <label className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold cursor-pointer shadow-md transition-all flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            <span>{i18n.t("auto.browseFile")}</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={onFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onLoadDemoData}
            className="px-4 py-2.5 rounded-xl bg-white border border-purple-300 hover:bg-purple-50 text-purple-900 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title={i18n.t("auto.loadDemoDataset")}
          >
            <Sparkles className="w-4 h-4 text-purple-700" />
            <span>{i18n.t("auto.loadMatchingDemoDataset")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
